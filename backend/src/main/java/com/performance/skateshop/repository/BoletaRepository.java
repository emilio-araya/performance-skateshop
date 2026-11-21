package com.performance.skateshop.repository;

import com.performance.skateshop.model.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Long> {
    Optional<Boleta> findByNumeroBoleta(String numeroBoleta);
    List<Boleta> findAllByOrderByFechaDesc();
    List<Boleta> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
