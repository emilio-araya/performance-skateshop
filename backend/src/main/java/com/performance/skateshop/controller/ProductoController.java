package com.performance.skateshop.controller;

import com.performance.skateshop.model.Producto;
import com.performance.skateshop.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos", description = "Endpoints para la gestión del catálogo de productos de skate")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar productos (con filtro opcional por categoría)")
    public ResponseEntity<List<Producto>> listar(@RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(productoService.buscarPorCategoria(categoria));
        }
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID numérico")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener producto por código/slug (ej. tabla-maple-pro-825)")
    public ResponseEntity<Producto> buscarPorCodigo(@PathVariable String codigo) {
        return productoService.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ofertas")
    @Operation(summary = "Listar productos en oferta")
    public ResponseEntity<List<Producto>> listarOfertas() {
        return ResponseEntity.ok(productoService.listarOfertas());
    }

    @GetMapping("/criticos")
    @Operation(summary = "Listar productos con stock crítico para reposición")
    public ResponseEntity<List<Producto>> listarCriticos(@RequestParam(required = false, defaultValue = "5") Integer limite) {
        return ResponseEntity.ok(productoService.listarCriticos(limite));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo producto")
    public ResponseEntity<Producto> crear(@Valid @RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.guardar(producto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto existente")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        try {
            return ResponseEntity.ok(productoService.actualizar(id, producto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
