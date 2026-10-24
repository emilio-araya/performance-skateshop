import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductos } from '../../services/mockStorage';
import TarjetaProducto from '../../components/TarjetaProducto';

const DetalleCategoria = () => {
    const { nombre } = useParams();
    const [productos, setProductos] = useState([]);
    const categoriaNombre = decodeURIComponent(nombre || '');

    useEffect(() => {
        const todos = getProductos();
        const filtrados = todos.filter(p => p.categoria.toLowerCase() === categoriaNombre.toLowerCase());
        setProductos(filtrados);
    }, [categoriaNombre]);

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container">
                <h1 className="section-title">Categoría: {categoriaNombre}</h1>
                <div className="products-grid">
                    {productos.length > 0 ? (
                        productos.map(p => <TarjetaProducto key={p.id} producto={p} />)
                    ) : (
                        <p style={{ color: '#fff', textAlign: 'center', gridColumn: '1/-1' }}>
                            No hay productos registrados en esta categoría.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default DetalleCategoria;