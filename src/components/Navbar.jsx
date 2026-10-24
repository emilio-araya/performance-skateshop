import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/Contexto_carrito';
import { useSesion } from '../context/Contexto_sesion';

const Navbar = () => {
    const { totalProductos } = useCarrito();
    const navigate = useNavigate();
    const { usuario: usuarioLogueado, cerrarSesion } = useSesion();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const handleCerrarSesion = () => {
        cerrarSesion();
        setMenuAbierto(false);
        navigate('/');
    };

    return (
        <header className="site-header">
            <nav className="navbar">
                <div className="logo">
                    <Link to="/">
                        <img src="/img/img_nav.PNG" alt="Logo de la tienda" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>PERFORMANCE</span>
                    </Link>
                </div>
                <ul className="nav-menu">
                    <li className="nav-item"><Link to="/">Inicio</Link></li>
                    <li className="nav-item"><Link to="/categorias">Categorías</Link></li>
                    <li className="nav-item"><Link to="/ofertas">Ofertas</Link></li>
                    <li className="nav-item"><Link to="/blogs">Blog</Link></li>
                    <li className="nav-item">
                        <Link to="/checkout">
                            <i className="fas fa-shopping-cart"></i> Carrito ({totalProductos})
                        </Link>
                    </li>
                    <li className="nav-item">
                        {usuarioLogueado ? (
                            <div className="user-dropdown">
                                <button className="user-avatar-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
                                    <i className="fa-solid fa-circle-user"></i>
                                    <span>{usuarioLogueado.nombre}</span>
                                    <i className="fa-solid fa-chevron-down arrow-icon"></i>
                                </button>
                                {menuAbierto && (
                                    <div className="dropdown-content">
                                        <button onClick={handleCerrarSesion}>
                                            <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn-login-nav">Iniciar Sesión</Link>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;