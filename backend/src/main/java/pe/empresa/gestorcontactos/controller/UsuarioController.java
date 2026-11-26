package pe.empresa.gestorcontactos.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import pe.empresa.gestorcontactos.dto.ActualizarUsuarioRequest;
import pe.empresa.gestorcontactos.dto.CrearUsuarioRequest;
import pe.empresa.gestorcontactos.dto.UsuarioResponse;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RolUsuario;
import pe.empresa.gestorcontactos.services.UsuarioService;
import java.net.URI;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("${app.api.prefix:/api/v1}/usuarios")
public class UsuarioController {
    private final UsuarioService service;
    public UsuarioController(UsuarioService service) { this.service = service; }

    @GetMapping
    public Page<UsuarioResponse> buscar(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size,
                                        @RequestParam(required = false) String buscar,
                                        @RequestParam(defaultValue = "ACTIVO") EstadoUsuario estado,
                                        @RequestParam(required = false) RolUsuario rol) {
        return service.buscar(page, size, buscar, estado, rol);
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioResponse usuario = service.crear(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(usuario.id()).toUri();
        return ResponseEntity.created(location).body(usuario);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarUsuarioRequest request) {
        return service.actualizar(id, request);
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
