package pe.empresa.gestorcontactos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.empresa.gestorcontactos.entitys.*;
import pe.empresa.gestorcontactos.repository.AuditoriaRepository;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

@Service
public class AuditoriaService {
    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final String actorUsername;

    public AuditoriaService(AuditoriaRepository auditoriaRepository, UsuarioRepository usuarioRepository,
                           @Value("${app.admin.initial-username}") String actorUsername) {
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.actorUsername = actorUsername;
    }

    @Transactional
    public void registrar(Contacto contacto, AccionAuditoria accion, String detalle) {
        Usuario actor = usuarioRepository.findFirstByUsernameAndEstadoAndRol(actorUsername, EstadoUsuario.ACTIVO, RolUsuario.ADMIN)
                .orElseThrow(() -> new IllegalStateException("No existe un administrador activo para registrar auditoría."));
        auditoriaRepository.save(new RegistroAuditoria(contacto, null, accion, actor, detalle));
    }

    @Transactional
    public void registrar(Usuario usuarioAfectado, AccionAuditoria accion, String detalle) {
        Usuario actor = usuarioRepository.findFirstByUsernameAndEstadoAndRol(actorUsername, EstadoUsuario.ACTIVO, RolUsuario.ADMIN)
                .orElseThrow(() -> new IllegalStateException("No existe un administrador activo para registrar auditoría."));
        auditoriaRepository.save(new RegistroAuditoria(null, usuarioAfectado, accion, actor, detalle));
    }

    @Transactional
    public void registrarUsuario(Usuario usuarioAfectado, Usuario usuarioEjecutor,
                                 AccionAuditoria accion, String detalle) {
        auditoriaRepository.save(new RegistroAuditoria(null, usuarioAfectado, accion, usuarioEjecutor, detalle));
    }
}
