import React from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../context/Contexto_carrito';
import ImagenProducto from './ImagenProducto';

const TarjetaProducto = ({ producto }) => {
    const { agregarAlCarrito } = useCarrito();

    return (
        <div className="product-card">
            {producto.oferta && <span className="product-badge">Oferta</span>}
            <ImagenProducto src={producto.imagen} alt={producto.nombre} className="product-img" />
            <div className="product-info">
                <div className="product-cat">{producto.categoria}</div>
                <h3 className="product-title">
                    <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
                </h3>
                <div className="product-price">${Number(producto.precio).toLocaleString("es-CL")}</div>
                
                <a 
                    href={`https://wa.me/56973969195?text=Hola!%20Me%20interesa%20${encodeURIComponent(producto.nombre)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-ask"
                >
                    <i className="fab fa-whatsapp"></i> Consultar
                </a>

                <button className="btn-cart" type="button" onClick={() => agregarAlCarrito(producto)}>
                    <i className="fas fa-cart-plus"></i> Agregar al carrito
                </button>
            </div>
        </div>
    );
};

export default TarjetaProducto;