package com.performance.skateshop.repository;

import com.performance.skateshop.model.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByCodigo(String codigo);
    List<Producto> findByCategoriaNombreIgnoreCase(String categoriaNombre);
    List<Producto> findByOfertaTrue();
    List<Producto> findByStockLessThanEqual(Integer stockLimite);

    // Lectura bloqueante para descontar stock: dos compras simultáneas de la
    // última unidad ya no pueden pasar ambas el chequeo y sobrevender.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.codigo = :codigo")
    Optional<Producto> findByCodigoForUpdate(@Param("codigo") String codigo);
}
