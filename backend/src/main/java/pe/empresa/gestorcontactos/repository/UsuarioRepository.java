package pe.empresa.gestorcontactos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.empresa.gestorcontactos.entitys.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);
}
