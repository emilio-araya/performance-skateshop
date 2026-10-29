import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/Contexto_carrito.jsx';
import { useSesion } from '../context/Contexto_sesion.jsx';

const Navbar = () => {
    const contextCarrito = useCarrito() || {};
    const { carrito = [], cantidadTotal } = contextCarrito;
    const { usuario, cerrarSesion } = useSesion();
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const totalItems = typeof cantidadTotal === 'function'
        ? cantidadTotal()
        : typeof cantidadTotal === 'number'
            ? cantidadTotal
            : (Array.isArray(carrito) ? carrito.reduce((acc, prod) => acc + (prod.cantidad || prod.quantity || 1), 0) : 0);

    // Prioriza el usuario del contexto de React para actualización inmediata
    const usuarioLogueado = usuario || JSON.parse(localStorage.getItem('usuario_logueado'));

    const handleLogout = () => {
        if (cerrarSesion) {
            cerrarSesion();
        } else {
            localStorage.removeItem('usuario_logueado');
        }
        setMenuAbierto(false);
        navigate('/login');
    };

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="navbar-wrapper">
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="nav-brand" onClick={cerrarMenu}>
                        PERFORMANCE
                    </Link>

                    {/* Botón Hamburguesa Nativo */}
                    <button 
                        type="button"
                        className={`menu-toggle ${menuAbierto ? 'open' : ''}`} 
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        aria-label="Abrir menú de navegación"
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>

                    {/* Menú de Navegación */}
                    <div className={`nav-menu ${menuAbierto ? 'active' : ''}`}>
                        <ul className="nav-links">
                            <li><Link to="/" onClick={cerrarMenu}>Inicio</Link></li>
                            <li><Link to="/categorias" onClick={cerrarMenu}>Categorías</Link></li>
                            <li><Link to="/ofertas" onClick={cerrarMenu}>Ofertas</Link></li>
                            <li><Link to="/blogs" onClick={cerrarMenu}>Blog</Link></li>
                            <li>
                                <Link to="/checkout" className="cart-link" onClick={cerrarMenu}>
                                    Carrito ({totalItems})
                                </Link>
                            </li>
                        </ul>

                        <div className="nav-auth">
                            {usuarioLogueado ? (
                                <div className="user-dropdown">
                                    <button type="button" className="user-greeting btn-user-greeting">
                                        Hola, {usuarioLogueado.nombre}
                                    </button>
                                    {usuarioLogueado.rol === 'Administrador' && (
                                        <Link to="/admin" className="btn-admin-nav" onClick={cerrarMenu}>
                                            Panel Admin
                                        </Link>
                                    )}
                                    <button type="button" onClick={handleLogout} className="btn-logout-nav">
                                        Cerrar Sesión
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="btn-main btn-login-nav" onClick={cerrarMenu}>
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;