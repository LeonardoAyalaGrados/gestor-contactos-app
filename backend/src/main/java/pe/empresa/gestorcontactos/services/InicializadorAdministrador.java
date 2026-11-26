package pe.empresa.gestorcontactos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RolUsuario;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;

import java.util.Optional;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class InicializadorAdministrador implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String initialPassword;

    public InicializadorAdministrador(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.initial-username}") String username,
            @Value("${app.admin.initial-password}") String initialPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.initialPassword = initialPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (username == null || username.isBlank()) {
            throw new IllegalStateException(
                    "Configure ADMIN_INITIAL_USERNAME para crear el usuario ADMIN inicial.");
        }
        Optional<Usuario> existente = usuarioRepository.findByUsername(username);
        if (existente.isPresent()) {
            if (existente.get().getRol() == RolUsuario.ADMIN) {
                return;
            }
            throw new IllegalStateException(
                    "ADMIN_INITIAL_USERNAME ya pertenece a una cuenta que no tiene el rol ADMIN.");
        }
        if (initialPassword == null || initialPassword.isBlank()) {
            throw new IllegalStateException(
                    "Configure ADMIN_INITIAL_PASSWORD para crear el usuario ADMIN inicial.");
        }

        Usuario administrador = new Usuario(
                username,
                passwordEncoder.encode(initialPassword),
                RolUsuario.ADMIN,
                EstadoUsuario.ACTIVO);
        usuarioRepository.save(administrador);
    }
}
