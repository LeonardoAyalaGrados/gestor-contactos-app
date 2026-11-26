package pe.empresa.gestorcontactos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InicializadorCarpetaFotografias implements ApplicationRunner {

    private final Path photoDirectory;

    public InicializadorCarpetaFotografias(
            @Value("${app.uploads.contact-photos-dir}") String configuredDirectory) {
        this.photoDirectory = Path.of(configuredDirectory).toAbsolutePath().normalize();
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        Files.createDirectories(photoDirectory);
    }
}
