import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductos } from '../../services/mockStorage';
import TarjetaProducto from '../../components/TarjetaProducto';

const DetalleCategoria = () => {
    const { nombre } = useParams();
    const [productos, setProductos] = useState([]);
    const categoriaNombre = decodeURIComponent(nombre || '');

    useEffect(() => {
        const todos = getProductos();
        const filtrados = todos.filter(p => p.categoria?.toLowerCase() === categoriaNombre.toLowerCase());
        setProductos(filtrados);
    }, [categoriaNombre]);

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            {/* Botón discreto en la esquina superior izquierda */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                <Link to="/categorias" className="btn-back-link-subtle">
                    <i className="fas fa-arrow-left"></i> Volver a Categorías
                </Link>
            </div>

            {/* Título únicamente con el nombre de la categoría */}
            <h1 className="section-title">{categoriaNombre.toUpperCase()}</h1>

            <div className="products-grid">
                {productos.length > 0 ? (
                    productos.map(p => <TarjetaProducto key={p.id} producto={p} />)
                ) : (
                    <p style={{ color: '#aaa', textAlign: 'center', gridColumn: '1/-1', padding: '40px 0' }}>
                        No hay productos registrados en esta categoría.
                    </p>
                )}
            </div>
        </main>
    );
};

export default DetalleCategoria;