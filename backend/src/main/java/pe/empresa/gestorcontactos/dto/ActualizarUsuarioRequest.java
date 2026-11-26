package pe.empresa.gestorcontactos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.empresa.gestorcontactos.entitys.RolUsuario;

public record ActualizarUsuarioRequest(@NotBlank @Size(max = 100) String username,
                                       String password,
                                       @NotNull RolUsuario rol) { }
