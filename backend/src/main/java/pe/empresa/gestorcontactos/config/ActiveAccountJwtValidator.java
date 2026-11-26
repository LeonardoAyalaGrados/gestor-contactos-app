package pe.empresa.gestorcontactos.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

@Component
public class ActiveAccountJwtValidator implements OAuth2TokenValidator<Jwt> {
    private final UsuarioRepository usuarios;
    public ActiveAccountJwtValidator(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        boolean activeAndUnchanged = usuarios.findByUsername(jwt.getSubject())
                .filter(user -> user.getEstado() == EstadoUsuario.ACTIVO)
                .filter(user -> user.getRol().name().equals(jwt.getClaimAsString("role")))
                .isPresent();
        if (activeAndUnchanged) return OAuth2TokenValidatorResult.success();
        OAuth2Error error = new OAuth2Error("invalid_token", "La cuenta ya no está activa o sus permisos cambiaron.", null);
        return OAuth2TokenValidatorResult.failure(error);
    }
}
