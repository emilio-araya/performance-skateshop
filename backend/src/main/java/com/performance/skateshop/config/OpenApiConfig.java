package com.performance.skateshop.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Performance Skateshop API REST")
                        .version("v1")
                        .description("API REST para la gestión de catálogo, pedidos y usuarios de Performance Skateshop - Evaluación Parcial N° 3")
                        .contact(new Contact()
                                .name("Emilio Araya")
                                .email("contacto@performancesb.cl"))
                        .license(new License().name("Apache 2.0")));
    }
}
