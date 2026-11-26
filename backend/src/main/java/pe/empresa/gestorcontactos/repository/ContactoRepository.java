package pe.empresa.gestorcontactos.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.empresa.gestorcontactos.entitys.Contacto;
import pe.empresa.gestorcontactos.entitys.EstadoContacto;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    boolean existsByDniAndEstado(String dni, EstadoContacto estado);

    boolean existsByDniAndEstadoAndIdNot(String dni, EstadoContacto estado, Long id);

    @Query("""
            select c from Contacto c
            where c.estado = :estado
              and (:termino = '' or c.dni like concat('%', :termino, '%')
                   or c.nombres like concat('%', :termino, '%')
                   or c.apellidos like concat('%', :termino, '%'))
            """)
    Page<Contacto> buscarPorEstadoYTermino(
            @Param("estado") EstadoContacto estado,
            @Param("termino") String termino,
            Pageable pageable);
}
