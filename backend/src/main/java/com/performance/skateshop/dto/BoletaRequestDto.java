package com.performance.skateshop.dto;

import java.util.List;

public class BoletaRequestDto {
    private Long usuarioId;
    private String nombre;
    private String correo;
    private String direccion;
    private List<DetalleBoletaRequestDto> items;

    public BoletaRequestDto() {}

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public List<DetalleBoletaRequestDto> getItems() { return items; }
    public void setItems(List<DetalleBoletaRequestDto> items) { this.items = items; }
}
