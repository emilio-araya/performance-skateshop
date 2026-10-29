import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductos } from '../../services/mockStorage';
import { useCarrito } from '../../context/Contexto_carrito';

const IMAGEN_DEFAULT = "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=300&q=80";

const DetalleProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const { agregarAlCarrito } = useCarrito();

    useEffect(() => {
        const productos = getProductos();
        const encontrado = productos.find(p => String(p.id) === String(id));
        setProducto(encontrado);
    }, [id]);

    if (!producto) {
        return (
            <div className="container" style={{ padding: '120px 0', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Producto no encontrado</h2>
                <button type="button" className="btn-main" style={{ marginTop: '20px' }} onClick={() => navigate('/categorias')}>
                    Volver a Categorías
                </button>
            </div>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            {/* Botón para regresar al menú de categorías */}
            <div style={{ marginBottom: '25px' }}>
                <Link to="/categorias" className="btn-back-link">
                    <i className="fas fa-arrow-left"></i> Volver a Categorías
                </Link>
            </div>

            <div className="product-detail-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
                <div>
                    <img 
                        src={producto.imagen || producto.foto || IMAGEN_DEFAULT} 
                        alt={producto.nombre} 
                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #2a2a2a', objectFit: 'cover', maxHeight: '420px' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = IMAGEN_DEFAULT;
                        }}
                    />
                </div>
                <div>
                    <span className="badge-admin" style={{ marginBottom: '12px', display: 'inline-block' }}>{producto.categoria}</span>
                    <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#ffffff' }}>{producto.nombre}</h1>
                    <h2 style={{ color: 'var(--accent-color)', fontSize: '1.8rem', marginBottom: '20px' }}>
                        ${Number(producto.precio || 0).toLocaleString("es-CL")}
                    </h2>
                    <p style={{ color: '#aaaaaa', marginBottom: '25px', lineHeight: '1.6' }}>
                        Stock disponible: <strong>{producto.stock ?? 'Disponible'} unidades</strong>
                    </p>
                    <button type="button" className="btn-main" onClick={() => agregarAlCarrito(producto)}>
                        <i className="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            </div>
        </main>
    );
};

export default DetalleProducto;