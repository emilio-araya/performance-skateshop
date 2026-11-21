package com.performance.skateshop.service;

import com.performance.skateshop.dto.BoletaRequestDto;
import com.performance.skateshop.dto.DetalleBoletaRequestDto;
import com.performance.skateshop.model.Boleta;
import com.performance.skateshop.model.DetalleBoleta;
import com.performance.skateshop.model.Producto;
import com.performance.skateshop.model.Usuario;
import com.performance.skateshop.repository.BoletaRepository;
import com.performance.skateshop.repository.ProductoRepository;
import com.performance.skateshop.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletaService(BoletaRepository boletaRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.boletaRepository = boletaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Boleta> listarTodas() {
        return boletaRepository.findAllByOrderByFechaDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Boleta> buscarPorId(Long id) {
        return boletaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Boleta> buscarPorNumero(String numero) {
        return boletaRepository.findByNumeroBoleta(numero);
    }

    @Transactional(readOnly = true)
    public List<Boleta> listarPorUsuario(Long usuarioId) {
        return boletaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId);
    }

    public Boleta crearBoleta(BoletaRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("La boleta debe incluir al menos un producto.");
        }

        Boleta boleta = new Boleta();
        // UUID en lugar de currentTimeMillis: dos compras en el mismo milisegundo
        // colisionaban contra la columna unique.
        boleta.setNumeroBoleta("BOL-" + UUID.randomUUID());
        boleta.setFecha(LocalDateTime.now());
        boleta.setClienteNombre(request.getNombre());
        boleta.setClienteEmail(request.getCorreo());
        boleta.setDireccionEnvio(request.getDireccion());
        boleta.setEstado("PAGADO");

        if (request.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Usuario no encontrado con ID: " + request.getUsuarioId()));
            boleta.setUsuario(usuario);
        }

        int totalAcumulado = 0;

        for (DetalleBoletaRequestDto item : request.getItems()) {
            Producto producto = null;
            if (item.getProductoId() != null) {
                producto = productoRepository.findByIdForUpdate(item.getProductoId()).orElse(null);
            }
            if (producto == null && item.getProductoCodigo() != null) {
                producto = productoRepository.findByCodigoForUpdate(item.getProductoCodigo()).orElse(null);
            }
            if (producto == null) {
                throw new IllegalArgumentException("Producto no encontrado: ID " + item.getProductoId() + " o Código " + item.getProductoCodigo());
            }

            int cantidad = (item.getCantidad() != null) ? item.getCantidad() : 1;
            if (cantidad <= 0) {
                throw new IllegalArgumentException(
                        "La cantidad debe ser mayor a cero para '" + producto.getNombre() + "'.");
            }
            if (producto.getStock() < cantidad) {
                throw new IllegalStateException("Stock insuficiente para '" + producto.getNombre() + "'. Disponible: " + producto.getStock() + ", Solicitado: " + cantidad);
            }

            // Descuento automático de stock
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            int subtotal = producto.getPrecio() * cantidad;
            totalAcumulado += subtotal;

            DetalleBoleta detalle = new DetalleBoleta(boleta, producto, cantidad, producto.getPrecio(), subtotal);
            boleta.agregarDetalle(detalle);
        }

        boleta.setTotal(totalAcumulado);
        return boletaRepository.save(boleta);
    }
}
