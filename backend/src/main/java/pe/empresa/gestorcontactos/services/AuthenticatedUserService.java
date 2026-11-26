package pe.empresa.gestorcontactos.services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

@Service
public class AuthenticatedUserService {
    private final UsuarioRepository usuarios;
    public AuthenticatedUserService(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    public Usuario requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalStateException("No hay un usuario autenticado para atribuir la operación.");
        }
        return usuarios.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("La cuenta autenticada ya no existe."));
    }
}
