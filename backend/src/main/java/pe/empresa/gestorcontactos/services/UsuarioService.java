package pe.empresa.gestorcontactos.services;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import pe.empresa.gestorcontactos.dto.ActualizarUsuarioRequest;
import pe.empresa.gestorcontactos.dto.CrearUsuarioRequest;
import pe.empresa.gestorcontactos.dto.UsuarioResponse;
import pe.empresa.gestorcontactos.entitys.AccionAuditoria;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RolUsuario;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

@Service
@Validated
public class UsuarioService {
    private final UsuarioRepository usuarios;
    private final AuditoriaService auditoria;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;

    public UsuarioService(UsuarioRepository usuarios, AuditoriaService auditoria,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.initial-username}") String adminUsername) {
        this.usuarios = usuarios;
        this.auditoria = auditoria;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> buscar(int page, int size, String termino,
                                        EstadoUsuario estado, RolUsuario rol) {
        validarPagina(page, size);
        return usuarios.buscar(estado, rol, termino == null ? "" : termino.trim(),
                PageRequest.of(page, size, Sort.by("username").ascending())).map(UsuarioService::view);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) { return view(encontrar(id)); }

    @Transactional
    public UsuarioResponse crear(@Valid CrearUsuarioRequest request) {
        String username = request.username().trim();
        if (usuarios.findByUsername(username).isPresent()) throw new ConflictException("Ya existe un usuario con ese nombre de usuario.");
        Usuario actor = actor();
        Usuario usuario = new Usuario(username, passwordEncoder.encode(request.password()), request.rol(), EstadoUsuario.ACTIVO);
        Usuario guardado = usuarios.saveAndFlush(usuario);
        auditoria.registrarUsuario(guardado, actor, AccionAuditoria.CREAR_USUARIO, "Usuario creado.");
        return view(guardado);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, @Valid ActualizarUsuarioRequest request) {
        Usuario usuario = encontrar(id);
        String username = request.username().trim();
        if (usuarios.existsByUsernameAndIdNot(username, id)) throw new ConflictException("Ya existe otro usuario con ese nombre de usuario.");
        Usuario actor = actor();
        String passwordHash = request.password() == null || request.password().isBlank()
                ? null : passwordEncoder.encode(request.password());
        usuario.actualizar(username, request.rol(), passwordHash);
        auditoria.registrarUsuario(usuario, actor, AccionAuditoria.ACTUALIZAR_USUARIO, "Usuario actualizado.");
        return view(usuario);
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = encontrar(id);
        if (usuario.getEstado() == EstadoUsuario.INACTIVO) throw new ConflictException("El usuario ya está inactivo.");
        Usuario actor = actor();
        usuario.cambiarEstado(EstadoUsuario.INACTIVO);
        auditoria.registrarUsuario(usuario, actor, AccionAuditoria.DESACTIVAR_USUARIO, "Usuario desactivado.");
    }

    private Usuario encontrar(Long id) {
        return usuarios.findById(id).orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario."));
    }

    private Usuario actor() {
        return usuarios.findFirstByUsernameAndEstadoAndRol(adminUsername, EstadoUsuario.ACTIVO, RolUsuario.ADMIN)
                .or(() -> usuarios.findFirstByEstadoAndRol(EstadoUsuario.ACTIVO, RolUsuario.ADMIN))
                .orElseThrow(() -> new IllegalStateException("No existe un administrador activo para atribuir la operación."));
    }

    private static UsuarioResponse view(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getUsername(), usuario.getRol(), usuario.getEstado(),
                usuario.getCreatedAt(), usuario.getUpdatedAt());
    }

    private static void validarPagina(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("page debe ser >= 0 y size entre 1 y 100.");
    }
}
