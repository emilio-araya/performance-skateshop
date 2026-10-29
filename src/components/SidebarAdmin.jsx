import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const SidebarAdmin = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <>
            {/* Botón flotante exclusivo para vista móvil */}
            <button 
                type="button" 
                className="admin-mobile-toggle" 
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-label="Abrir menú de administración"
            >
                <i className={`fa-solid ${menuAbierto ? 'fa-xmark' : 'fa-bars'}`}></i>
                <span>{menuAbierto ? 'Cerrar Menú' : 'Menú Admin'}</span>
            </button>

            {/* Fondo Oscuro al desplegar menú en celular */}
            {menuAbierto && (
                <div className="sidebar-backdrop" onClick={cerrarMenu}></div>
            )}

            <aside className={`sidebar ${menuAbierto ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>PERFORMANCE</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-chart-line"></i> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/productos" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-box-open"></i> Productos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/productos/criticos" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-triangle-exclamation"></i> Stock Crítico
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/categorias" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-tags"></i> Categorías
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-users"></i> Usuarios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/pedidos" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={cerrarMenu}>
                                <i className="fa-solid fa-receipt"></i> Pedidos
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="btn-logout" onClick={cerrarMenu}>
                        <i className="fa-solid fa-right-from-bracket"></i> Salir a Tienda
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default SidebarAdmin;