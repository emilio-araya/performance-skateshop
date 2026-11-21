package com.performance.skateshop.dto;

import com.performance.skateshop.model.Usuario;

/**
 * Respuesta de autenticación. La password del usuario nunca se serializa:
 * Usuario la marca como WRITE_ONLY.
 */
public class LoginResponseDto {

    private final String token;
    private final Usuario usuario;

    public LoginResponseDto(String token, Usuario usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() { return token; }
    public Usuario getUsuario() { return usuario; }
}
