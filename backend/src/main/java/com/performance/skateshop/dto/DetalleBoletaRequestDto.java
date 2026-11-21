package com.performance.skateshop.dto;

public class DetalleBoletaRequestDto {
    private Long productoId;
    private String productoCodigo;
    private Integer cantidad;

    public DetalleBoletaRequestDto() {}

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getProductoCodigo() { return productoCodigo; }
    public void setProductoCodigo(String productoCodigo) { this.productoCodigo = productoCodigo; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
