package com.performance.skateshop.controller;

import com.performance.skateshop.dto.BoletaRequestDto;
import com.performance.skateshop.model.Boleta;
import com.performance.skateshop.model.Rol;
import com.performance.skateshop.security.UsuarioPrincipal;
import com.performance.skateshop.service.BoletaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boletas")
@Tag(name = "Boletas y Ventas", description = "Endpoints para el registro de compras, emisión de boletas y control de pedidos")
public class BoletaController {

    private static final Logger log = LoggerFactory.getLogger(BoletaController.class);

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las boletas emitidas (orden cronológico inverso)")
    public ResponseEntity<List<Boleta>> listarTodas() {
        return ResponseEntity.ok(boletaService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener boleta con su detalle por ID")
    public ResponseEntity<Boleta> buscarPorId(@PathVariable Long id) {
        return boletaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/numero/{numero}")
    @Operation(summary = "Obtener boleta por número correlativo (ej. BOL-123456789)")
    public ResponseEntity<Boleta> buscarPorNumero(@PathVariable String numero) {
        return boletaService.buscarPorNumero(numero)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Historial de compras / boletas por ID de usuario")
    public ResponseEntity<List<Boleta>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(boletaService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/mias")
    @Operation(summary = "Historial de compras del usuario autenticado")
    public ResponseEntity<List<Boleta>> misBoletas(Authentication authentication) {
        UsuarioPrincipal principal = (UsuarioPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(boletaService.listarPorUsuario(principal.getUsuario().getId()));
    }

    @PostMapping
    @Operation(summary = "Registrar nueva compra (crea boleta, detalles y descuenta stock)")
    public ResponseEntity<?> registrarCompra(@RequestBody BoletaRequestDto request, Authentication authentication) {
        // Un cliente solo puede comprar a su propio nombre; el id del cuerpo se ignora.
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal principal
                && principal.getUsuario().getRol() == Rol.CLIENTE) {
            request.setUsuarioId(principal.getUsuario().getId());
        }
        try {
            Boleta creada = boletaService.crearBoleta(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // No se filtra el detalle interno de persistencia al cliente.
            log.error("Error al procesar la compra", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se pudo procesar la compra. Intentalo nuevamente.");
        }
    }
}
