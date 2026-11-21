package com.performance.skateshop.service;

import com.performance.skateshop.model.Rol;
import com.performance.skateshop.model.Usuario;
import com.performance.skateshop.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email);
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarPorRol(Rol rol) {
        return usuarioRepository.findByRol(rol);
    }

    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null && usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está registrado: " + usuario.getEmail());
        }
        // La password llega en texto plano desde el cliente y se persiste hasheada.
        // Nunca se serializa de vuelta (Usuario la marca WRITE_ONLY), así que no
        // hay riesgo de re-hashear un valor ya hasheado.
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario datos) {
        return usuarioRepository.findById(id)
                .map(existente -> {
                    existente.setNombre(datos.getNombre());
                    existente.setApellidos(datos.getApellidos());
                    existente.setRun(datos.getRun());
                    existente.setRegion(datos.getRegion());
                    existente.setComuna(datos.getComuna());
                    existente.setDireccion(datos.getDireccion());
                    if (datos.getRol() != null) {
                        existente.setRol(datos.getRol());
                    }
                    if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
                        existente.setPassword(passwordEncoder.encode(datos.getPassword()));
                    }
                    return usuarioRepository.save(existente);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}
