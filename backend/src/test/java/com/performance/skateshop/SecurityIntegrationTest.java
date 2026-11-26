package com.performance.skateshop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.performance.skateshop.model.Usuario;
import com.performance.skateshop.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
@ActiveProfiles("test")
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

    @Value("${app.jwt.secret}")
    private String jwtSecret;

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

    @Test
    void tokenVencidoDevuelve401() throws Exception {
        String vencido = Jwts.builder()
                .subject(ADMIN)
                .claim("rol", "ADMINISTRADOR")
                .issuedAt(Date.from(Instant.now().minusSeconds(7200)))
                .expiration(Date.from(Instant.now().minusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)))
                .compact();

        mockMvc.perform(get("/api/v1/usuarios").header("Authorization", bearer(vencido)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clienteCompraYVeSoloSusBoletas() throws Exception {
        String clienteToken = tokenDe(CLIENTE, CLIENTE_PASS);
        String adminToken = tokenDe(ADMIN, ADMIN_PASS);

        mockMvc.perform(post("/api/v1/boletas")
                        .header("Authorization", bearer(clienteToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Cliente\",\"correo\":\"cliente@correo.cl\","
                                + "\"direccion\":\"Calle 1\",\"items\":[{\"productoId\":1,\"cantidad\":1}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(45000))
                .andExpect(jsonPath("$.detalles[0].cantidad").value(1));

        // El stock del producto 1 baja de 3 a 2.
        mockMvc.perform(get("/api/v1/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(2));

        // Otra boleta, de otro usuario, no debe aparecer en /mias del cliente.
        mockMvc.perform(post("/api/v1/boletas")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Admin\",\"correo\":\"admin@performance.cl\","
                                + "\"direccion\":\"Calle 2\",\"items\":[{\"productoId\":3,\"cantidad\":1}]}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/boletas/mias").header("Authorization", bearer(clienteToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].clienteEmail").value("cliente@correo.cl"));
    }

    @Test
    void cantidadCeroEsRechazada() throws Exception {
        mockMvc.perform(post("/api/v1/boletas")
                        .header("Authorization", bearer(tokenDe(CLIENTE, CLIENTE_PASS)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"productoId\":1,\"cantidad\":0}]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void vendedorNoPuedeEditarNiEliminarCatalogo() throws Exception {
        String token = tokenDe(VENDEDOR, VENDEDOR_PASS);
        mockMvc.perform(put("/api/v1/productos/1")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/productos/1").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/categorias/1").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());
    }

    // --- S2: reposición de stock (PATCH admin) ---

    @Test
    void administradorReponeStock() throws Exception {
        String token = tokenDe(ADMIN, ADMIN_PASS);
        MvcResult creado = mockMvc.perform(post("/api/v1/productos")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"reponer-stock-test\",\"nombre\":\"Reponer Stock Test\",\"precio\":1000,\"stock\":1,\"categoria\":{\"id\":1}}"))
                .andExpect(status().isCreated())
                .andReturn();
        long id = objectMapper.readTree(creado.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/v1/productos/" + id + "/reponer-stock?cantidad=4")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(5));
    }

    @Test
    void vendedorNoPuedeReponerStock() throws Exception {
        mockMvc.perform(patch("/api/v1/productos/1/reponer-stock")
                        .header("Authorization", bearer(tokenDe(VENDEDOR, VENDEDOR_PASS))))
                .andExpect(status().isForbidden());
    }

    @Test
    void reponerStockConCantidadInvalidaDevuelve400() throws Exception {
        mockMvc.perform(patch("/api/v1/productos/1/reponer-stock?cantidad=0")
                        .header("Authorization", bearer(tokenDe(ADMIN, ADMIN_PASS))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reponerStockInexistenteDevuelve404() throws Exception {
        mockMvc.perform(patch("/api/v1/productos/999999/reponer-stock")
                        .header("Authorization", bearer(tokenDe(ADMIN, ADMIN_PASS))))
                .andExpect(status().isNotFound());
    }

    @Test
    void rutaInexistenteDevuelve404YNo401() throws Exception {
        mockMvc.perform(get("/api/v1/no-existe").header("Authorization", bearer(tokenDe(ADMIN, ADMIN_PASS))))
                .andExpect(status().isNotFound());
    }
}
