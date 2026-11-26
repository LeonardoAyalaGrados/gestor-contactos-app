package pe.empresa.gestorcontactos.dto;

import java.time.Instant;
import pe.empresa.gestorcontactos.entitys.RolUsuario;

public record LoginResponse(String accessToken, String tokenType, Instant expiresAt, AuthenticatedUser user) {
    public record AuthenticatedUser(Long id, String username, RolUsuario role) { }
}
