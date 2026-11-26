package pe.empresa.gestorcontactos.dto;

import pe.empresa.gestorcontactos.entitys.EstadoContacto;
import java.time.Instant;
import java.util.List;

public record ContactoResponse(Long id, String dni, String nombres, String apellidos, EstadoContacto estado,
                               String foto, List<String> telefonos, List<String> correos,
                               Instant createdAt, Instant updatedAt) { }
