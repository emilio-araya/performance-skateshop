package com.performance.skateshop.service;

import com.performance.skateshop.model.Categoria;
import com.performance.skateshop.model.Producto;
import com.performance.skateshop.repository.CategoriaRepository;
import com.performance.skateshop.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarPorCategoria(String categoriaNombre) {
        return productoRepository.findByCategoriaNombreIgnoreCase(categoriaNombre);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarOfertas() {
        return productoRepository.findByOfertaTrue();
    }

    @Transactional(readOnly = true)
    public List<Producto> listarCriticos(Integer limiteStock) {
        int limite = (limiteStock != null) ? limiteStock : 5;
        return productoRepository.findByStockLessThanEqual(limite);
    }

    public Producto guardar(Producto producto) {
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(producto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + producto.getCategoria().getId()));
            producto.setCategoria(categoria);
        }
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto prod) {
        return productoRepository.findById(id)
                .map(existente -> {
                    existente.setNombre(prod.getNombre());
                    existente.setCodigo(prod.getCodigo());
                    existente.setDescripcion(prod.getDescripcion());
                    existente.setPrecio(prod.getPrecio());
                    existente.setStock(prod.getStock());
                    existente.setImagen(prod.getImagen());
                    existente.setOferta(prod.getOferta());

                    if (prod.getCategoria() != null && prod.getCategoria().getId() != null) {
                        Categoria cat = categoriaRepository.findById(prod.getCategoria().getId())
                                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + prod.getCategoria().getId()));
                        existente.setCategoria(cat);
                    }
                    return productoRepository.save(existente);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }
}
