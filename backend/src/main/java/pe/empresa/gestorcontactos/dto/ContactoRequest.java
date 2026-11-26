package pe.empresa.gestorcontactos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ContactoRequest(
        @NotBlank @Pattern(regexp = "\\d{8}") String dni,
        @NotBlank @Size(max = 150) String nombres,
        @NotBlank @Size(max = 150) String apellidos,
        List<@NotBlank @Pattern(regexp = "9\\d{8}") String> telefonos,
        List<@Email @NotBlank @Size(max = 254) String> correos) { }
