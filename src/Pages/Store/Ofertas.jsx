import React, { useState, useEffect } from 'react';
import { getProductos } from '../../services/mockStorage';
import TarjetaProducto from '../../components/TarjetaProducto';

const Ofertas = () => {
    const [ofertas, setOfertas] = useState([]);

    useEffect(() => {
        const todos = getProductos();
        setOfertas(todos.filter(p => p.oferta === true));
    }, []);

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