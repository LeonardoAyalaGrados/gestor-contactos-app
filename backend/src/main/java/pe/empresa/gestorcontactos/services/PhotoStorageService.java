package pe.empresa.gestorcontactos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Locale;
import java.util.UUID;

@Service
public class PhotoStorageService {
    private final Path directory;
    private final long maxBytes;

    public PhotoStorageService(@Value("${app.uploads.contact-photos-dir}") String directory,
                               @Value("${app.photos.max-bytes:2097152}") long maxBytes) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
    }

    public String store(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) throw new IllegalArgumentException("La fotografía es obligatoria.");
        if (photo.getSize() > maxBytes) throw new IllegalArgumentException("La fotografía supera el máximo de 2 MB.");
        try {
            byte[] bytes = photo.getBytes();
            String format = detectFormat(bytes);
            String extension = switch (format) {
                case "jpeg", "jpg" -> "jpg";
                case "png" -> "png";
                case "webp" -> "webp";
                default -> throw new IllegalArgumentException("Formato de fotografía no permitido.");
            };
            Files.createDirectories(directory);
            String name = UUID.randomUUID() + "." + extension;
            Files.write(resolve(name), bytes);
            return name;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo almacenar la fotografía.", ex);
        }
    }

    public PhotoFile read(String filename) {
        Path path = resolve(filename);
        try {
            byte[] bytes = Files.readAllBytes(path);
            String extension = path.getFileName().toString().substring(path.getFileName().toString().lastIndexOf('.') + 1);
            String contentType = switch (extension) {
                case "jpg" -> "image/jpeg";
                case "png" -> "image/png";
                case "webp" -> "image/webp";
                default -> "application/octet-stream";
            };
            return new PhotoFile(bytes, contentType);
        } catch (IOException ex) {
            throw new ResourceNotFoundException("No se encontró la fotografía.");
        }
    }

    public void deleteAfterCommit(String filename) {
        if (filename == null || filename.isBlank()) return;
        Runnable delete = () -> { try { Files.deleteIfExists(resolve(filename)); } catch (IOException ignored) { } };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { delete.run(); }
            });
        } else delete.run();
    }

    public void deleteAfterRollback(String filename) {
        if (filename == null || filename.isBlank()) return;
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if (status != STATUS_COMMITTED) {
                        try { Files.deleteIfExists(resolve(filename)); } catch (IOException ignored) { }
                    }
                }
            });
        }
    }

    private String detectFormat(byte[] bytes) throws IOException {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) throw new IllegalArgumentException("El archivo no contiene una imagen válida.");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new IllegalArgumentException("El archivo no contiene una imagen válida.");
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                reader.read(0);
                return format;
            } finally { reader.dispose(); }
        }
    }

    private Path resolve(String filename) {
        if (filename == null || !filename.matches("[0-9a-fA-F-]{36}\\.(jpg|png|webp)"))
            throw new IllegalArgumentException("Nombre de fotografía inválido.");
        Path resolved = directory.resolve(filename).normalize();
        if (!resolved.startsWith(directory)) throw new IllegalArgumentException("Ruta de fotografía inválida.");
        return resolved;
    }

    public record PhotoFile(byte[] bytes, String contentType) { }
}
