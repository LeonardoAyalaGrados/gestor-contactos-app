package pe.empresa.gestorcontactos;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.Base64;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ContactoEndpointsTest {

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void endpointsDeContactoCubrenElFlujoBasico() throws Exception {
        String dni = String.format("%08d", Integer.toUnsignedLong(UUID.randomUUID().hashCode()) % 100_000_000);
        String json = """
                {"dni":"%s","nombres":"Ana","apellidos":"Prueba Endpoint %s","telefonos":["912345678"],"correos":["ana-%s@example.test"]}
                """.formatted(dni, dni, dni);
        byte[] png = Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC");
        MockMultipartFile request = new MockMultipartFile("contacto", "contacto.json", "application/json", json.getBytes());
        MockMultipartFile photo = new MockMultipartFile("foto", "photo.png", "image/png", png);

        String response = mvc.perform(multipart("/api/v1/contactos").file(request).file(photo))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.estado").value("ACTIVO")).andReturn().getResponse().getContentAsString();
        long id = com.fasterxml.jackson.databind.json.JsonMapper.builder().build().readTree(response).get("id").asLong();

        mvc.perform(get("/api/v1/contactos/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.dni").value(dni)).andExpect(jsonPath("$.telefonos[0]").value("912345678"));
        mvc.perform(get("/api/v1/contactos").param("buscar", "Prueba Endpoint " + dni).param("page", "0").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].dni").value(dni));
        mvc.perform(get("/api/v1/contactos/{id}/foto", id)).andExpect(status().isOk()).andExpect(content().contentType("image/png"));

        MockMultipartFile updated = new MockMultipartFile("contacto", "contacto.json", "application/json",
                ("{\"dni\":\"%s\",\"nombres\":\"Ana Maria\",\"apellidos\":\"Prueba Endpoint %s\",\"telefonos\":[\"912345678\",\"998765432\"],\"correos\":[\"ana-%s@example.test\",\"ana-2-%s@example.test\"]}").formatted(dni, dni, dni, dni).getBytes());
        MockHttpServletRequestBuilder update = multipart("/api/v1/contactos/{id}", id).file(updated).with(req -> { req.setMethod("PUT"); return req; });
        mvc.perform(update).andExpect(status().isOk()).andExpect(jsonPath("$.nombres").value("Ana Maria"))
                .andExpect(jsonPath("$.telefonos.length()").value(2)).andExpect(jsonPath("$.correos.length()").value(2));

        mvc.perform(patch("/api/v1/contactos/{id}/desactivar", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/contactos")).andExpect(status().isOk()).andExpect(jsonPath("$.content[*].id").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem((int) id))));
        mvc.perform(get("/api/v1/contactos").param("estado", "INACTIVO")).andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + id + ")]").exists());
        mvc.perform(patch("/api/v1/contactos/{id}/reactivar", id)).andExpect(status().isNoContent());
        Integer auditEvents = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM auditoria WHERE contacto_afectado_id = ? AND accion IN ('CREAR','ACTUALIZAR','DESACTIVAR','REACTIVAR')",
                Integer.class, id);
        org.assertj.core.api.Assertions.assertThat(auditEvents).isEqualTo(4);
        mvc.perform(get("/api/v1/contactos/{id}", id)).andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("ACTIVO"));
        mvc.perform(get("/api/v1/contactos/999999999")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.validationErrors").isMap()).andExpect(jsonPath("$.path").value("/api/v1/contactos/999999999"));
    }
}
