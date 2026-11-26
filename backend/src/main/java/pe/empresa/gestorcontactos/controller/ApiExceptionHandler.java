package pe.empresa.gestorcontactos.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import pe.empresa.gestorcontactos.services.ConflictException;
import pe.empresa.gestorcontactos.services.ResourceNotFoundException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class) ResponseEntity<ApiError> notFound(Exception ex, HttpServletRequest req) { return error(HttpStatus.NOT_FOUND, ex.getMessage(), req, Map.of()); }
    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class})
    ResponseEntity<ApiError> conflict(Exception ex, HttpServletRequest req) { return error(HttpStatus.CONFLICT, ex instanceof DataIntegrityViolationException ? "La operación entra en conflicto con datos existentes." : ex.getMessage(), req, Map.of()); }
    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class, HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class, MissingServletRequestPartException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ApiError> badRequest(Exception ex, HttpServletRequest req) { return error(HttpStatus.BAD_REQUEST, ex instanceof HttpMessageNotReadableException ? "El cuerpo de la solicitud no tiene un formato válido." : ex.getMessage(), req, Map.of()); }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiError> tooLarge(Exception ex, HttpServletRequest req) { return error(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo supera el tamaño permitido.", req, Map.of()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> invalid(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> fields.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return error(HttpStatus.BAD_REQUEST, "Hay campos inválidos.", req, fields);
    }
    @ExceptionHandler(Exception.class) ResponseEntity<ApiError> internal(Exception ex, HttpServletRequest req) { return error(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno.", req, Map.of()); }
    private ResponseEntity<ApiError> error(HttpStatus status, String message, HttpServletRequest req, Map<String, String> fields) {
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, req.getRequestURI(), fields));
    }
    public record ApiError(Instant timestamp, int status, String error, String message, String path, Map<String, String> validationErrors) { }
}
