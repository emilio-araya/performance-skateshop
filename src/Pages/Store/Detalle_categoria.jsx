import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductos } from '../../services/api';
import TarjetaProducto from '../../components/TarjetaProducto';

const DetalleCategoria = () => {
    const { nombre } = useParams();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const categoriaNombre = decodeURIComponent(nombre || '');

    useEffect(() => {
        cargarProductos();
    }, [categoriaNombre]);

    const cargarProductos = async () => {
        try {
            setCargando(true);
            const todos = await getProductos();
            const filtrados = (todos || []).filter(p => {
                const catNombre = typeof p.categoria === 'string' ? p.categoria : (p.categoria?.nombre || '');
                return catNombre.toLowerCase() === categoriaNombre.toLowerCase();
            });
            setProductos(filtrados);
        } catch (err) {
            setError('No se pudieron cargar los productos de esta categoría.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', paddingTop: '40px' }}>Cargando productos...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#ff4a57' }}>{error}</div>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                <Link to="/categorias" className="btn-back-link-subtle">
                    <i className="fas fa-arrow-left"></i> Volver a Categorías
                </Link>
            </div>

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
