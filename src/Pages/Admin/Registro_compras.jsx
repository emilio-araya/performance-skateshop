import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import { getBoletas } from '../../services/api';
import '../../assets/styles/admin.css';

const RegistroCompras = () => {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const boletas = await getBoletas();
            const mapeados = (boletas || []).map(p => ({
                id: p.numeroBoleta || p.id,
                fecha: p.fecha,
                cliente: p.clienteNombre || p.cliente,
                correo: p.clienteEmail || p.correo,
                resumenItems: (p.detalles || []).map(d => `${d.cantidad}x ${d.productoNombre || d.producto?.nombre || 'Producto'}`).join(', '),
                total: p.total,
                estado: p.estado
            }));
            setPedidos(mapeados);
        } catch (err) {
            setError('No se pudieron cargar las boletas.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    if (cargando) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Historial de Compras y Boletas</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando compras...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Historial de Compras y Boletas</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px', color: '#ff4a57' }}>{error}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Historial de Compras y Boletas</h1>
                </header>

                <div className="admin-container">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>N° Pedido</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Resumen Ítems</th>
                                    <th>Total Pagado</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.length > 0 ? (
                                    pedidos.map((p) => (
                                        <tr key={p.id}>
                                            <td><code>#{p.id}</code></td>
                                            <td>{p.fecha}</td>
                                            <td>
                                                <strong>{p.cliente || 'Anónimo'}</strong>
                                                <br/>
                                                <small style={{ color: '#aaa' }}>{p.correo}</small>
                                            </td>
                                            <td style={{ maxWidth: '280px', fontSize: '0.9rem', lineHeight: '1.4' }}>{p.resumenItems}</td>
                                            <td><strong>${Number(p.total).toLocaleString("es-CL")}</strong></td>
                                            <td>
                                                <span 
                                                    style={{ 
                                                        backgroundColor: p.estado === 'Aprobado' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(255, 74, 87, 0.2)',
                                                        color: p.estado === 'Aprobado' ? '#25d366' : '#ff4a57',
                                                        border: `1px solid ${p.estado === 'Aprobado' ? '#25d366' : '#ff4a57'}`, 
                                                        padding: '4px 10px', 
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {p.estado || 'Aprobado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                                            No hay compras registradas aún.
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

export default RegistroCompras;
