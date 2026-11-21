package com.performance.skateshop.service;

import com.performance.skateshop.model.Categoria;
import com.performance.skateshop.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombreIgnoreCase(nombre);
    }

    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id)
                .map(cat -> {
                    cat.setNombre(categoriaActualizada.getNombre());
                    cat.setDescripcion(categoriaActualizada.getDescripcion());
                    return categoriaRepository.save(cat);
                })
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con ID: " + id));
    }

    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Categoría no encontrada con ID: " + id);
        }
        categoriaRepository.deleteById(id);
    }
}
