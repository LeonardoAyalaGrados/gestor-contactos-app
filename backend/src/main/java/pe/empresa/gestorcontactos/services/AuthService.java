package pe.empresa.gestorcontactos.services;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.empresa.gestorcontactos.dto.LoginRequest;
import pe.empresa.gestorcontactos.dto.LoginResponse;
import pe.empresa.gestorcontactos.entitys.AccionAuditoria;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarios;
    private final AuditoriaService auditoria;
    private final JwtEncoder jwtEncoder;
    private final long expirationMs;

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarios, AuditoriaService auditoria,
                       JwtEncoder jwtEncoder, @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        this.authenticationManager = authenticationManager;
        this.usuarios = usuarios;
        this.auditoria = auditoria;
        this.jwtEncoder = jwtEncoder;
        if (expirationMs < 60_000) throw new IllegalStateException("JWT_EXPIRATION_MS debe ser de al menos un minuto.");
        this.expirationMs = expirationMs;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String username = request.username().trim();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.password()));
        Usuario usuario = usuarios.findByUsername(username).orElseThrow();
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(expirationMs);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("nexodir-api")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(usuario.getUsername())
                .claim("role", usuario.getRol().name())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        auditoria.registrarUsuario(usuario, usuario, AccionAuditoria.LOGIN, "Inicio de sesión exitoso.");
        return new LoginResponse(token, "Bearer", expiresAt,
                new LoginResponse.AuthenticatedUser(usuario.getId(), usuario.getUsername(), usuario.getRol()));
    }
}
