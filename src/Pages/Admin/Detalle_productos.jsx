import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { getProductos } from '../../services/mockStorage';

const DetalleProductosAdmin = () => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);

    useEffect(() => {
        const productos = getProductos();
        const encontrado = productos.find(p => p.id === id);
        setProducto(encontrado);
    }, [id]);

    if (!producto) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <div className="admin-container">
                        <h2>Producto no encontrado</h2>
                        <Link to="/admin/productos" className="btn-main" style={{ marginTop: '20px' }}>Volver a la lista</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Detalle del Producto: {producto.nombre}</h1>
                </header>

                <div className="admin-container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
                        <div>
                            <img src={producto.imagen || "/img/logo.jpeg"} alt={producto.nombre} style={{ width: '100%', borderRadius: '6px' }} />
                        </div>
                        <div>
                            <h3>{producto.nombre}</h3>
                            <p style={{ margin: '10px 0', color: '#aaa' }}>ID Único: <code>{producto.id}</code></p>
                            <p style={{ margin: '10px 0', color: '#aaa' }}>Categoría: <strong>{producto.categoria}</strong></p>
                            <p style={{ margin: '10px 0', color: '#aaa' }}>Precio Venta: <strong>${Number(producto.precio).toLocaleString("es-CL")}</strong></p>
                            <p style={{ margin: '10px 0', color: '#aaa' }}>Stock en Bodega: <strong style={{ color: producto.stock <= 5 ? '#ff4a57' : '#25d366' }}>{producto.stock} unidades</strong></p>
                            
                            <Link to="/admin/productos" className="btn-main" style={{ marginTop: '20px', display: 'inline-block' }}>
                                &larr; Volver a Inventario
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalleProductosAdmin;