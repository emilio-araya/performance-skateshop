package com.performance.skateshop.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Recurso inexistente. Se mapea a 404 sin capturar en cada controlador, para que
 * una falla real del servidor (violación de FK, caída de la DB) no se disfrace
 * de "no encontrado" y quede registrada como 500.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
