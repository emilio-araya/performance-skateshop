import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductos } from '../../services/mockStorage';
import { useCarrito } from '../../context/Contexto_carrito';

const DetalleProducto = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const { agregarAlCarrito } = useCarrito();

    useEffect(() => {
        const productos = getProductos();
        const encontrado = productos.find(p => p.id === id);
        setProducto(encontrado);
    }, [id]);

    if (!producto) {
        return (
            <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
                <h2>Producto no encontrado</h2>
                <Link to="/" className="btn-main" style={{ marginTop: '20px' }}>Volver al inicio</Link>
            </div>
        );
    }

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                    <div>
                        <img 
                            src={producto.imagen || "/img/logo.jpeg"} 
                            alt={producto.nombre} 
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #2a2a2a' }} 
                        />
                    </div>
                    <div>
                        <span className="badge-admin" style={{ marginBottom: '10px', display: 'inline-block' }}>{producto.categoria}</span>
                        <h1 style={{ fontSize: '2rem', marginBottom: '15px' }}>{producto.nombre}</h1>
                        <h2 style={{ color: 'var(--accent-color)', fontSize: '1.8rem', marginBottom: '20px' }}>
                            ${Number(producto.precio).toLocaleString("es-CL")}
                        </h2>
                        <p style={{ color: '#aaa', marginBottom: '20px', lineHeight: '1.6' }}>
                            Stock disponible: <strong>{producto.stock} unidades</strong>
                        </p>
                        <button className="btn-main" onClick={() => agregarAlCarrito(producto)}>
                            <i className="fas fa-cart-plus"></i> Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DetalleProducto;