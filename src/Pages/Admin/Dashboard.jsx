import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { getProductos, getBoletas, getUsuarios, getProductosCriticos } from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ productos: 0, pedidos: 0, usuarios: 0, criticos: 0 });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarStats();
    }, []);

    const cargarStats = async () => {
        try {
            setCargando(true);
            const [productos, boletas, usuarios, criticos] = await Promise.all([
                getProductos(),
                getBoletas(),
                getUsuarios(),
                getProductosCriticos(5)
            ]);
            setStats({
                productos: (productos || []).length,
                pedidos: (boletas || []).length,
                usuarios: (usuarios || []).length,
                criticos: (criticos || []).length
            });
        } catch (err) {
            setError('No se pudieron cargar las estadísticas.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header">
                        <div className="header-title"><h1>Dashboard Principal</h1></div>
                    </header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando estadísticas...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header">
                        <div className="header-title"><h1>Dashboard Principal</h1></div>
                    </header>
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
                    <div className="header-title">
                        <h1>Dashboard Principal</h1>
                    </div>
                    <div className="user-info">
                        <i className="fa-solid fa-user-shield"></i>
                        <span>Administrador</span>
                    </div>
                </header>

                <div className="admin-container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #ff4a57', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ color: '#aaa', fontSize: '0.9rem' }}>PRODUCTOS TOTALES</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{stats.productos}</p>
                            <Link to="/admin/productos" style={{ color: '#ff4a57', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>Gestionar inventario &rarr;</Link>
                        </div>

                        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #25d366', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ color: '#aaa', fontSize: '0.9rem' }}>COMPRAS REGISTRADAS</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{stats.pedidos}</p>
                            <Link to="/admin/pedidos" style={{ color: '#25d366', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>Ver historial de órdenes &rarr;</Link>
                        </div>

                        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #007bff', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ color: '#aaa', fontSize: '0.9rem' }}>USUARIOS REGISTRADOS</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginTop: '10px' }}>{stats.usuarios}</p>
                            <Link to="/admin/usuarios" style={{ color: '#007bff', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>Ver usuarios &rarr;</Link>
                        </div>

                        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #f39c12', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ color: '#aaa', fontSize: '0.9rem' }}>STOCK CRÍTICO (≤ 5)</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginTop: '10px' }}>{stats.criticos}</p>
                            <Link to="/admin/productos/criticos" style={{ color: '#f39c12', fontSize: '0.85rem', marginTop: '10px', display: 'inline-block' }}>Revisar alertas &rarr;</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
