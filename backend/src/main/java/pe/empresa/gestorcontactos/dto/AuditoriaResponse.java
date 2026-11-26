package pe.empresa.gestorcontactos.dto;

import java.time.Instant;
import pe.empresa.gestorcontactos.entitys.AccionAuditoria;

public record AuditoriaResponse(Long id, String entidad, Long entidadId, AccionAuditoria accion,
                                String usuarioEjecutor, String detalle, Instant timestamp) { }
