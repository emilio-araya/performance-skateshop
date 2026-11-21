import React, { useState, useEffect } from 'react';
import { getProductos } from '../../services/api';
import TarjetaProducto from '../../components/TarjetaProducto';

const Ofertas = () => {
    const [ofertas, setOfertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const todos = await getProductos();
            setOfertas((todos || []).filter(p => p.oferta === true));
        } catch (err) {
            setError('No se pudieron cargar las ofertas.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <main style={{ paddingTop: '110px' }}>
                <div className="container">
                    <h1 className="section-title">Productos en Oferta</h1>
                    <div className="products-grid" style={{ textAlign: 'center', paddingTop: '40px' }}>Cargando ofertas...</div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ paddingTop: '110px' }}>
                <div className="container">
                    <h1 className="section-title">Productos en Oferta</h1>
                    <div className="products-grid" style={{ textAlign: 'center', paddingTop: '40px', color: '#ff4a57' }}>{error}</div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container">
                <h1 className="section-title">Productos en Oferta</h1>
                <div className="products-grid">
                    {ofertas.length > 0 ? (
                        ofertas.map(p => <TarjetaProducto key={p.id} producto={p} />)
                    ) : (
                        <p style={{ color: '#fff', textAlign: 'center', gridColumn: '1/-1' }}>
                            No hay ofertas disponibles por el momento.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Ofertas;
