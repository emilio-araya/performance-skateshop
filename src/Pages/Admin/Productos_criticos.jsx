import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import ImagenProducto from '../../components/ImagenProducto';
import { getProductosCriticos, reponerStock } from '../../services/mockStorage';
import '../../assets/styles/admin.css';

const UMBRAL_STOCK_CRITICO = 5;

const ProductosCriticos = () => {
    const [criticos, setCriticos] = useState([]);

    const cargarCriticos = () => {
        setCriticos(getProductosCriticos(UMBRAL_STOCK_CRITICO));
    };

    useEffect(() => {
        cargarCriticos();
    }, []);

    const handleReponer = (id) => {
        reponerStock(id, 1);
        cargarCriticos();
    };

    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Listado de Productos Críticos</h1>
                </header>

                <div className="admin-container">
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>
                        Productos con existencias en bodega iguales o inferiores a {UMBRAL_STOCK_CRITICO} unidades.
                    </p>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock Actual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criticos.length > 0 ? (
                                    criticos.map(p => (
                                        <tr key={p.id}>
                                            <td><ImagenProducto src={p.imagen} alt={p.nombre} className="img-thumb" /></td>
                                            <td><strong>{p.nombre}</strong></td>
                                            <td><span className="badge-admin">{p.categoria}</span></td>
                                            <td>${Number(p.precio).toLocaleString("es-CL")}</td>
                                            <td style={{ color: '#ff4a57', fontWeight: 'bold' }}>{p.stock} un.</td>
                                            <td>
                                                <button type="button" className="btn-reponer" onClick={() => handleReponer(p.id)}>
                                                    +1 Reponer
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                                            No hay productos en estado crítico.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductosCriticos;