package pe.empresa.gestorcontactos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import pe.empresa.gestorcontactos.dto.AuditoriaResponse;
import pe.empresa.gestorcontactos.entitys.*;
import pe.empresa.gestorcontactos.repository.AuditoriaRepository;

@Service
public class AuditoriaService {
    private final AuditoriaRepository auditoriaRepository;
    private final AuthenticatedUserService authenticatedUser;

    public AuditoriaService(AuditoriaRepository auditoriaRepository, AuthenticatedUserService authenticatedUser) {
        this.auditoriaRepository = auditoriaRepository;
        this.authenticatedUser = authenticatedUser;
    }

    @Transactional
    public void registrar(Contacto contacto, AccionAuditoria accion, String detalle) {
        Usuario actor = authenticatedUser.requireCurrentUser();
        auditoriaRepository.save(new RegistroAuditoria(contacto, null, accion, actor, detalle));
    }

    @Transactional
    public void registrar(Usuario usuarioAfectado, AccionAuditoria accion, String detalle) {
        Usuario actor = authenticatedUser.requireCurrentUser();
        auditoriaRepository.save(new RegistroAuditoria(null, usuarioAfectado, accion, actor, detalle));
    }

    @Transactional
    public void registrarUsuario(Usuario usuarioAfectado, Usuario usuarioEjecutor,
                                 AccionAuditoria accion, String detalle) {
        auditoriaRepository.save(new RegistroAuditoria(null, usuarioAfectado, accion, usuarioEjecutor, detalle));
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaResponse> listar(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("page debe ser >= 0 y size entre 1 y 100.");
        }
        return auditoriaRepository.findAllByOrderByTimestampDesc(
                PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private AuditoriaResponse toResponse(RegistroAuditoria registro) {
        boolean isContact = registro.getContactoAfectado() != null;
        String entity = isContact ? "CONTACTO" : "USUARIO";
        Long entityId = isContact ? registro.getContactoAfectado().getId() : registro.getUsuarioAfectado().getId();
        return new AuditoriaResponse(registro.getId(), entity, entityId, registro.getAccion(),
                registro.getUsuarioEjecutor().getUsername(), registro.getDetalle(), registro.getTimestamp());
    }
}
