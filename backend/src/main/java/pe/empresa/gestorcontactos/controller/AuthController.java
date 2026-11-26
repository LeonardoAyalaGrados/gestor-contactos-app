package pe.empresa.gestorcontactos.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.empresa.gestorcontactos.dto.LoginRequest;
import pe.empresa.gestorcontactos.dto.LoginResponse;
import pe.empresa.gestorcontactos.services.AuthService;

@RestController
@RequestMapping("${app.api.prefix:/api/v1}/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
