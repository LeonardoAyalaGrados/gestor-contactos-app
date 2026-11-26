package pe.empresa.gestorcontactos.dto;

import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RolUsuario;
import java.time.Instant;

public record UsuarioResponse(Long id, String username, RolUsuario rol, EstadoUsuario estado,
                              Instant createdAt, Instant updatedAt) { }
