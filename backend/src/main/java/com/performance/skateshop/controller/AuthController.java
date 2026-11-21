package com.performance.skateshop.controller;

import com.performance.skateshop.dto.LoginRequestDto;
import com.performance.skateshop.dto.LoginResponseDto;
import com.performance.skateshop.dto.RegistroRequestDto;
import com.performance.skateshop.model.Rol;
import com.performance.skateshop.model.Usuario;
import com.performance.skateshop.security.JwtService;
import com.performance.skateshop.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Inicio de sesión y registro con JWT")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          UsuarioService usuarioService,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener un token JWT")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas o usuario no registrado."));
        }

        Usuario usuario = usuarioService.buscarPorEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado"));

        return ResponseEntity.ok(new LoginResponseDto(jwtService.generarToken(usuario), usuario));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar un nuevo cliente y obtener su token JWT")
    public ResponseEntity<?> register(@Valid @RequestBody RegistroRequestDto request) {
        if (usuarioService.buscarPorEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Este correo electrónico ya se encuentra registrado."));
        }

        Usuario usuario = new Usuario();
        usuario.setRun(request.getRun());
        usuario.setNombre(request.getNombre());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setRegion(request.getRegion());
        usuario.setComuna(request.getComuna());
        usuario.setDireccion(request.getDireccion());
        usuario.setRol(Rol.CLIENTE);

        Usuario creado = usuarioService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponseDto(jwtService.generarToken(creado), creado));
    }
}
