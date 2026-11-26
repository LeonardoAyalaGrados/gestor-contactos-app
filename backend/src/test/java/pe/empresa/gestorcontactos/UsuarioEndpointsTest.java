package pe.empresa.gestorcontactos;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UsuarioEndpointsTest {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void endpointsAdministranBuscanYDesactivanUsuariosSinExponerHash() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "test-user-" + suffix;
        String createBody = objectMapper.writeValueAsString(Map.of(
                "username", username, "password", "clave-de-prueba", "rol", "USER"));

        String created = mvc.perform(post("/api/v1/usuarios").contentType("application/json").content(createBody))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.rol").value("USER")).andExpect(jsonPath("$.estado").value("ACTIVO"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist()).andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).get("id").asLong();

        String hash = jdbcTemplate.queryForObject("SELECT password_hash FROM usuarios WHERE id = ?", String.class, id);
        org.assertj.core.api.Assertions.assertThat(hash).startsWith("$2");

        mvc.perform(get("/api/v1/usuarios").param("buscar", username).param("page", "0").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].username").value(username));
        mvc.perform(get("/api/v1/usuarios/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id)).andExpect(jsonPath("$.passwordHash").doesNotExist());

        String updatedUsername = username + "-edit";
        String updateBody = objectMapper.writeValueAsString(Map.of(
                "username", updatedUsername, "password", "otra-clave-de-prueba", "rol", "ADMIN"));
        mvc.perform(put("/api/v1/usuarios/{id}", id).contentType("application/json").content(updateBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.username").value(updatedUsername))
                .andExpect(jsonPath("$.rol").value("ADMIN")).andExpect(jsonPath("$.passwordHash").doesNotExist());

        mvc.perform(patch("/api/v1/usuarios/{id}/desactivar", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/usuarios").param("buscar", updatedUsername).param("estado", "INACTIVO"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].estado").value("INACTIVO"));
        String duplicateBody = objectMapper.writeValueAsString(Map.of(
                "username", updatedUsername, "password", "clave-de-prueba", "rol", "USER"));
        mvc.perform(post("/api/v1/usuarios").contentType("application/json").content(duplicateBody))
                .andExpect(status().isConflict());

        Integer auditEvents = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM auditoria WHERE usuario_afectado_id = ? AND accion IN ('CREAR_USUARIO','ACTUALIZAR_USUARIO','DESACTIVAR_USUARIO')",
                Integer.class, id);
        org.assertj.core.api.Assertions.assertThat(auditEvents).isEqualTo(3);
    }
}
