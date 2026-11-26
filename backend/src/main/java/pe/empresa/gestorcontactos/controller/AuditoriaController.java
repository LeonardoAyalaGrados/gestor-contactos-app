package pe.empresa.gestorcontactos.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.empresa.gestorcontactos.dto.AuditoriaResponse;
import pe.empresa.gestorcontactos.services.AuditoriaService;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("${app.api.prefix:/api/v1}/auditoria")
public class AuditoriaController {
    private final AuditoriaService auditoria;

    public AuditoriaController(AuditoriaService auditoria) { this.auditoria = auditoria; }

    @GetMapping
    public Page<AuditoriaResponse> listar(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return auditoria.listar(page, size);
    }
}
