package com.performance.skateshop.security;

import com.performance.skateshop.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey key;
    private final long expirationMillis;

    public JwtService(@Value("${app.jwt.secret:}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        if (secret == null || secret.isBlank()) {
            // Sin secreto configurado se usa una clave efímera: nunca se commitea
            // una clave de firma. Los tokens dejan de valer al reiniciar.
            this.key = Jwts.SIG.HS256.key().build();
            log.warn("JWT_SECRET no está definido: se generó una clave efímera. "
                    + "En producción definí JWT_SECRET (base64, mínimo 32 bytes).");
        } else {
            this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        }
        this.expirationMillis = expirationMinutes * 60_000L;
    }

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("uid", usuario.getId())
                .claim("rol", usuario.getRol().name())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(expirationMillis)))
                .signWith(key)
                .compact();
    }

    public String extraerEmail(String token) {
        return parsear(token).getSubject();
    }

    public boolean esValido(String token) {
        try {
            parsear(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
