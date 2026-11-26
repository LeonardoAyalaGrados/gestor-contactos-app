package pe.empresa.gestorcontactos;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import pe.empresa.gestorcontactos.entitys.AccionAuditoria;
import pe.empresa.gestorcontactos.entitys.Contacto;
import pe.empresa.gestorcontactos.entitys.CorreoContacto;
import pe.empresa.gestorcontactos.entitys.EstadoUsuario;
import pe.empresa.gestorcontactos.entitys.RegistroAuditoria;
import pe.empresa.gestorcontactos.entitys.RolUsuario;
import pe.empresa.gestorcontactos.entitys.TelefonoContacto;
import pe.empresa.gestorcontactos.entitys.Usuario;
import pe.empresa.gestorcontactos.repository.UsuarioRepository;
import pe.empresa.gestorcontactos.services.InicializadorAdministrador;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class InicializacionPersistenciaMySqlTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private InicializadorAdministrador inicializadorAdministrador;

    @Value("${app.uploads.contact-photos-dir}")
    private String photoDirectory;

    @Value("${app.admin.initial-username}")
    private String adminUsername;

    @Value("${app.admin.initial-password}")
    private String adminPassword;

    @Test
    void creaTablasPersisteRelacionesYConservaSemillaAdminIdempotente() {
        assertThat(Files.isDirectory(Path.of(photoDirectory).toAbsolutePath().normalize())).isTrue();

        String databaseCollation = jdbcTemplate.queryForObject(
                "SELECT DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = DATABASE()",
                String.class);
        assertThat(databaseCollation).isEqualTo("utf8mb4_unicode_ci");

        Integer tablesWithExpectedCollation = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.TABLES " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN " +
                        "('usuarios', 'contactos', 'contacto_telefonos', 'contacto_correos', 'auditoria') " +
                        "AND TABLE_COLLATION = 'utf8mb4_unicode_ci'",
                Integer.class);
        assertThat(tablesWithExpectedCollation).isEqualTo(5);

        Integer autoIncrementIds = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'id' " +
                        "AND TABLE_NAME IN ('usuarios', 'contactos', 'contacto_telefonos', " +
                        "'contacto_correos', 'auditoria') AND EXTRA LIKE '%auto_increment%'",
                Integer.class);
        assertThat(autoIncrementIds).isEqualTo(5);

        Integer explicitAuditReferences = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'auditoria' " +
                        "AND COLUMN_NAME IN ('contacto_afectado_id', 'usuario_afectado_id', 'usuario_ejecutor_id')",
                Integer.class);
        assertThat(explicitAuditReferences).isEqualTo(3);

        Integer auditForeignKeys = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'auditoria' " +
                        "AND COLUMN_NAME IN ('contacto_afectado_id', 'usuario_afectado_id', 'usuario_ejecutor_id') " +
                        "AND REFERENCED_TABLE_NAME IS NOT NULL",
                Integer.class);
        assertThat(auditForeignKeys).isEqualTo(3);

        Integer legacyGenericAuditColumns = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'auditoria' " +
                        "AND COLUMN_NAME IN ('entidad_id', 'entidad_afectada', 'usuario_id')",
                Integer.class);
        assertThat(legacyGenericAuditColumns).isZero();

        Usuario admin = usuarioRepository.findByUsername(adminUsername).orElseThrow();
        assertThat(admin.getRol()).isEqualTo(RolUsuario.ADMIN);
        assertThat(admin.getEstado()).isEqualTo(EstadoUsuario.ACTIVO);
        assertThat(admin.getPasswordHash()).startsWith("$2");
        assertThat(passwordEncoder.matches(
                adminPassword, admin.getPasswordHash())).isTrue();

        inicializadorAdministrador.run();
        assertThat(usuarioRepository.findAll())
                .filteredOn(usuario -> usuario.getUsername().equals(adminUsername))
                .hasSize(1);

        String suffix = UUID.randomUUID().toString().replace("-", "");
        String dni = "1" + String.format("%07d", ThreadLocalRandom.current().nextInt(10_000_000));
        String telefono = "9" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        Contacto contacto = new Contacto(
                dni,
                "Contacto de prueba",
                "Persistencia MySQL",
                "contactos/prueba-" + suffix + ".jpg",
                admin);
        contacto.agregarTelefono(new TelefonoContacto(telefono));
        contacto.agregarTelefono(new TelefonoContacto(
                "9" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000))));
        contacto.agregarCorreo(new CorreoContacto("prueba-" + suffix + "@example.test"));
        contacto.agregarCorreo(new CorreoContacto("prueba-2-" + suffix + "@example.test"));

        entityManager.persist(contacto);
        entityManager.flush();

        RegistroAuditoria auditoria = new RegistroAuditoria(
                contacto,
                null,
                AccionAuditoria.CREAR,
                admin,
                "Registro creado por la prueba de persistencia.");
        entityManager.persist(auditoria);
        entityManager.flush();
        entityManager.clear();

        Contacto guardado = entityManager.find(Contacto.class, contacto.getId());
        assertThat(guardado.getTelefonos()).hasSize(2);
        assertThat(guardado.getTelefonos()).allSatisfy(telefonoGuardado ->
                assertThat(telefonoGuardado.getNumero()).matches("9\\d{8}"));
        assertThat(guardado.getCorreos()).hasSize(2);
        assertThat(guardado.getCorreos()).allSatisfy(correoGuardado ->
                assertThat(correoGuardado.getCorreo()).endsWith("@example.test"));

        RegistroAuditoria auditoriaGuardada = entityManager.find(RegistroAuditoria.class, auditoria.getId());
        assertThat(auditoriaGuardada.getContactoAfectado().getId()).isEqualTo(guardado.getId());
        assertThat(auditoriaGuardada.getUsuarioAfectado()).isNull();
        assertThat(auditoriaGuardada.getUsuarioEjecutor().getId()).isEqualTo(admin.getId());
    }
}
