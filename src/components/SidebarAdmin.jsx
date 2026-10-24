import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const SidebarAdmin = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>PERFORMANCE</h2>
                <span className="badge-admin">Admin Panel</span>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-chart-line"></i> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/productos" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-box-open"></i> Productos
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/productos/criticos" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-triangle-exclamation"></i> Stock Crítico
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/categorias" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-tags"></i> Categorías
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-users"></i> Usuarios
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/pedidos" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            <i className="fa-solid fa-receipt"></i> Pedidos
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <Link to="/" className="btn-logout">
                    <i className="fa-solid fa-right-from-bracket"></i> Salir a Tienda
                </Link>
            </div>
        </aside>
    );
};

export default SidebarAdmin;