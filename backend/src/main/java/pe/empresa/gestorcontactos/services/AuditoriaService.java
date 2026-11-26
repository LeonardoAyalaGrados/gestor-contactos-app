package pe.empresa.gestorcontactos.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.empresa.gestorcontactos.entitys.*;
import pe.empresa.gestorcontactos.repository.AuditoriaRepository;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

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
}
