package pe.empresa.gestorcontactos.services;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;
import pe.empresa.gestorcontactos.entitys.*;
import pe.empresa.gestorcontactos.dto.ContactoRequest;
import pe.empresa.gestorcontactos.dto.ContactoResponse;
import pe.empresa.gestorcontactos.repository.ContactoRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Validated
public class ContactoService {
    private final ContactoRepository contactos;
    private final AuditoriaService auditoria;
    private final PhotoStorageService photos;
    private final AuthenticatedUserService authenticatedUser;

    public ContactoService(ContactoRepository contactos, AuditoriaService auditoria,
                           PhotoStorageService photos, AuthenticatedUserService authenticatedUser) {
        this.contactos = contactos; this.auditoria = auditoria;
        this.photos = photos; this.authenticatedUser = authenticatedUser;
    }

    @Transactional(readOnly = true)
    public Page<ContactoResponse> listar(int page, int size, String buscar, EstadoContacto estado) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("page debe ser >= 0 y size entre 1 y 100.");
        return contactos.buscarPorEstadoYTermino(estado, buscar == null ? "" : buscar.trim(),
                PageRequest.of(page, size, Sort.by("apellidos").ascending().and(Sort.by("nombres").ascending()))).map(ContactoService::view);
    }

    @Transactional(readOnly = true)
    public ContactoResponse obtener(Long id) { return view(encontrar(id)); }

    @Transactional
    public ContactoResponse crear(@Valid ContactoRequest request, MultipartFile foto) {
        validar(request);
        if (contactos.existsByDniAndEstado(request.dni(), EstadoContacto.ACTIVO)) throw new ConflictException("Ya existe un contacto activo con ese DNI.");
        String photoName = photos.store(foto);
        photos.deleteAfterRollback(photoName);
        Usuario actor = actor();
        Contacto contacto = new Contacto(request.dni(), request.nombres().trim(), request.apellidos().trim(), photoName, actor);
        agregarMedios(contacto, request);
        Contacto saved = contactos.saveAndFlush(contacto);
        auditoria.registrar(saved, AccionAuditoria.CREAR, "Contacto creado.");
        return view(saved);
    }

    @Transactional
    public ContactoResponse actualizar(Long id, @Valid ContactoRequest request, MultipartFile foto) {
        validar(request);
        Contacto contacto = encontrar(id);
        if (contacto.getEstado() != EstadoContacto.ACTIVO) throw new ConflictException("No se puede editar un contacto inactivo.");
        if (contactos.existsByDniAndEstadoAndIdNot(request.dni(), EstadoContacto.ACTIVO, id)) throw new ConflictException("Ya existe otro contacto activo con ese DNI.");
        String oldPhoto = contacto.getPhotoPath();
        String photo = foto != null && !foto.isEmpty() ? photos.store(foto) : oldPhoto;
        if (!photo.equals(oldPhoto)) { photos.deleteAfterRollback(photo); photos.deleteAfterCommit(oldPhoto); }
        contacto.actualizarDatos(request.dni(), request.nombres().trim(), request.apellidos().trim(), photo, actor());
        contacto.limpiarMediosContacto();
        contactos.flush();
        agregarMedios(contacto, request);
        auditoria.registrar(contacto, AccionAuditoria.ACTUALIZAR, "Datos y medios de contacto actualizados.");
        return view(contacto);
    }

    @Transactional
    public void desactivar(Long id) {
        Contacto contacto = encontrar(id);
        if (contacto.getEstado() == EstadoContacto.INACTIVO) throw new ConflictException("El contacto ya está inactivo.");
        contacto.desactivar(); contacto.actualizarDatos(contacto.getDni(), contacto.getNombres(), contacto.getApellidos(), contacto.getPhotoPath(), actor());
        auditoria.registrar(contacto, AccionAuditoria.DESACTIVAR, "Contacto desactivado.");
    }

    @Transactional
    public void reactivar(Long id) {
        Contacto contacto = encontrar(id);
        if (contacto.getEstado() == EstadoContacto.ACTIVO) throw new ConflictException("El contacto ya está activo.");
        if (contactos.existsByDniAndEstadoAndIdNot(contacto.getDni(), EstadoContacto.ACTIVO, id)) throw new ConflictException("Otro contacto activo ya utiliza ese DNI.");
        contacto.reactivar(); contacto.actualizarDatos(contacto.getDni(), contacto.getNombres(), contacto.getApellidos(), contacto.getPhotoPath(), actor());
        auditoria.registrar(contacto, AccionAuditoria.REACTIVAR, "Contacto reactivado.");
    }

    @Transactional(readOnly = true)
    public PhotoStorageService.PhotoFile foto(Long id) { return photos.read(encontrar(id).getPhotoPath()); }

    private Contacto encontrar(Long id) {
        return contactos.findById(id).orElseThrow(() -> new ResourceNotFoundException("No se encontró el contacto."));
    }

    private static ContactoResponse view(Contacto c) {
        return new ContactoResponse(c.getId(), c.getDni(), c.getNombres(), c.getApellidos(), c.getEstado(), c.getPhotoPath(),
                c.getTelefonos().stream().map(TelefonoContacto::getNumero).toList(),
                c.getCorreos().stream().map(CorreoContacto::getCorreo).toList(), c.getCreatedAt(), c.getUpdatedAt());
    }

    private Usuario actor() { return authenticatedUser.requireCurrentUser(); }

    private void validar(ContactoRequest request) {
        if ((request.telefonos() == null || request.telefonos().isEmpty()) && (request.correos() == null || request.correos().isEmpty()))
            throw new IllegalArgumentException("Debe indicar al menos un teléfono o un correo.");
        if (request.correos() != null) {
            Set<String> seen = new HashSet<>();
            for (String email : request.correos()) if (!seen.add(email.trim().toLowerCase(Locale.ROOT)))
                throw new IllegalArgumentException("No se puede repetir un correo dentro del contacto.");
        }
    }

    private void agregarMedios(Contacto contacto, ContactoRequest request) {
        if (request.telefonos() != null) request.telefonos().forEach(n -> contacto.agregarTelefono(new TelefonoContacto(n.trim())));
        if (request.correos() != null) request.correos().forEach(e -> contacto.agregarCorreo(new CorreoContacto(e.trim())));
    }

}
