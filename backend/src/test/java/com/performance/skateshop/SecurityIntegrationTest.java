package com.performance.skateshop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.performance.skateshop.model.Usuario;
import com.performance.skateshop.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cubre S1 (JWT), S2 (matriz de roles) y S3 (passwords hasheadas).
 *
 * Un solo contexto de Spring a propósito: data.sql corre con
 * spring.sql.init.mode=always, así que varios contextos sobre la misma base
 * en memoria duplicarían las PK. Si se agrega otra clase @SpringBootTest,
 * darle su propio spring.datasource.url.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String ADMIN = "admin@performance.cl";
    private static final String ADMIN_PASS = "admin123";
    private static final String VENDEDOR = "vendedor@performance.cl";
    private static final String VENDEDOR_PASS = "vendedor123";
    private static final String CLIENTE = "cliente@correo.cl";
    private static final String CLIENTE_PASS = "cliente123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String tokenDe(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    // --- S1: autenticación ---

    @Test
    void loginValidoDevuelveTokenYUsuarioSinPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + ADMIN + "\",\"password\":\"" + ADMIN_PASS + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.email").value(ADMIN))
                .andExpect(jsonPath("$.usuario.rol").value("ADMINISTRADOR"))
                .andExpect(jsonPath("$.usuario.password").doesNotExist());
    }

    @Test
    void loginConPasswordIncorrectaDevuelve401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + ADMIN + "\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginConEmailInexistenteDevuelve401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nadie@correo.cl\",\"password\":\"admin123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoDevuelve401() throws Exception {
        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", bearer("no.es.un.jwt")))
                .andExpect(status().isUnauthorized());
    }

    // --- S3: registro y hasheo ---

    @Test
    void registroCreaClienteConPasswordHasheada() throws Exception {
        String email = "nuevo@correo.cl";
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"run\":\"99999999-9\",\"nombre\":\"Nuevo\",\"apellidos\":\"Cliente\","
                                + "\"email\":\"" + email + "\",\"password\":\"secreto123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.rol").value("CLIENTE"));

        Usuario creado = usuarioRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(creado.getPassword()).startsWith("$2");
        assertThat(passwordEncoder.matches("secreto123", creado.getPassword())).isTrue();
    }

    @Test
    void registroConEmailDuplicadoDevuelve409() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Duplicado\",\"email\":\"" + ADMIN + "\",\"password\":\"otra123\"}"))
                .andExpect(status().isConflict());
    }

    // --- S2: catálogo público ---

    @Test
    void catalogoEsPublico() throws Exception {
        mockMvc.perform(get("/api/v1/productos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/categorias")).andExpect(status().isOk());
    }

    @Test
    void escrituraDeCatalogoSinTokenDevuelve401() throws Exception {
        mockMvc.perform(post("/api/v1/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Sin Token\"}"))
                .andExpect(status().isUnauthorized());
    }

    // --- S2: matriz de roles ---

    @Test
    void clienteNoPuedeCrearProductos() throws Exception {
        mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(tokenDe(CLIENTE, CLIENTE_PASS)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Hack\",\"precio\":1,\"stock\":1,\"categoria\":{\"id\":1}}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void vendedorNoPuedeCrearProductos() throws Exception {
        mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(tokenDe(VENDEDOR, VENDEDOR_PASS)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Hack\",\"precio\":1,\"stock\":1,\"categoria\":{\"id\":1}}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void administradorPuedeCrearProductos() throws Exception {
        mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(tokenDe(ADMIN, ADMIN_PASS)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"tabla-de-test\",\"nombre\":\"Tabla de Test\",\"precio\":1000,"
                                + "\"stock\":5,\"oferta\":false,\"categoria\":{\"id\":1}}"))
                .andExpect(status().isCreated());
    }

    @Test
    void vendedorVeBoletasPeroNoUsuarios() throws Exception {
        String token = tokenDe(VENDEDOR, VENDEDOR_PASS);
        mockMvc.perform(get("/api/v1/boletas").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    void administradorVeUsuarios() throws Exception {
        mockMvc.perform(get("/api/v1/usuarios")
                        .header("Authorization", bearer(tokenDe(ADMIN, ADMIN_PASS))))
                .andExpect(status().isOk());
    }

    @Test
    void clienteVeSusBoletasPeroNoTodas() throws Exception {
        String token = tokenDe(CLIENTE, CLIENTE_PASS);
        mockMvc.perform(get("/api/v1/boletas/mias").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/boletas").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());
    }
}
