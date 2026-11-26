package pe.empresa.gestorcontactos.controller;

import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.empresa.gestorcontactos.entitys.EstadoContacto;
import pe.empresa.gestorcontactos.dto.ContactoRequest;
import pe.empresa.gestorcontactos.dto.ContactoResponse;
import pe.empresa.gestorcontactos.services.ContactoService;
import pe.empresa.gestorcontactos.services.PhotoStorageService;
import java.net.URI;

@RestController
@RequestMapping("${app.api.prefix:/api/v1}/contactos")
public class ContactoController {
    private final ContactoService service;
    public ContactoController(ContactoService service) { this.service = service; }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContactoResponse> crear(@Valid @RequestPart("contacto") ContactoRequest request, @RequestPart("foto") MultipartFile foto) {
        ContactoResponse response = service.crear(request, foto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }
    @GetMapping
    public Page<ContactoResponse> listar(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size,
                                         @RequestParam(required=false) String buscar, @RequestParam(required=false) EstadoContacto estado) {
        return service.listar(page, size, buscar, estado == null ? EstadoContacto.ACTIVO : estado);
    }
    @GetMapping("/{id}") public ContactoResponse obtener(@PathVariable Long id) { return service.obtener(id); }
    @PutMapping(value="/{id}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ContactoResponse actualizar(@PathVariable Long id, @Valid @RequestPart("contacto") ContactoRequest request,
                                       @RequestPart(value="foto", required=false) MultipartFile foto) { return service.actualizar(id, request, foto); }
    @PatchMapping("/{id}/desactivar") public ResponseEntity<Void> desactivar(@PathVariable Long id) { service.desactivar(id); return ResponseEntity.noContent().build(); }
    @PatchMapping("/{id}/reactivar") public ResponseEntity<Void> reactivar(@PathVariable Long id) { service.reactivar(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/{id}/foto")
    public ResponseEntity<ByteArrayResource> foto(@PathVariable Long id) {
        PhotoStorageService.PhotoFile foto = service.foto(id);
        MediaType type;
        try { type = MediaType.parseMediaType(foto.contentType()); } catch (RuntimeException ex) { type = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().contentType(type).header(HttpHeaders.CACHE_CONTROL, "no-store").body(new ByteArrayResource(foto.bytes()));
    }
}
