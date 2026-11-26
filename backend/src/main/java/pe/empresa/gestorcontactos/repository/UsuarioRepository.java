package pe.empresa.gestorcontactos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RolUsuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findFirstByUsernameAndEstadoAndRol(
            String username, EstadoUsuario estado, RolUsuario rol);

    Optional<Usuario> findFirstByEstadoAndRol(EstadoUsuario estado, RolUsuario rol);

    boolean existsByUsernameAndIdNot(String username, Long id);

    @Query("""
            select u from Usuario u
            where (:estado is null or u.estado = :estado)
              and (:rol is null or u.rol = :rol)
              and (:termino = '' or u.username like concat('%', :termino, '%'))
            """)
    Page<Usuario> buscar(@Param("estado") EstadoUsuario estado,
                         @Param("rol") RolUsuario rol,
                         @Param("termino") String termino,
                         Pageable pageable);
}
