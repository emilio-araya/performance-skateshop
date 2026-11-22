import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos } from '../../services/api';
import TarjetaProducto from '../../components/TarjetaProducto';

const Inicio = () => {
    const [productos, setProductos] = useState([]);
    const [categoriaSel, setCategoriaSel] = useState("todo");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const lista = await getProductos();
            setProductos(lista || []);
        } catch (err) {
            setError('No se pudieron cargar los productos.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const productosFiltrados = productos.filter(p => {
        if (categoriaSel === "todo") return true;
        const catNombre = typeof p.categoria === 'string' ? p.categoria : (p.categoria?.nombre || '');
        return catNombre.toLowerCase().trim() === categoriaSel.toLowerCase().trim();
    });

    if (cargando) {
        return (
            <main>
                <section id="inicio">
                    <div className="hero-content">
                        <h1>Bienvenidos a Performancesb.cl</h1>
                        <p>El mejor hardware, tablas y estilo urbano en un solo lugar.</p>
                        <a href="#tienda" className="btn-main">Ver productos</a>
                    </div>
                </section>
                <section id="tienda" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando productos...</section>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <section id="inicio">
                    <div className="hero-content">
                        <h1>Bienvenidos a Performancesb.cl</h1>
                        <p>El mejor hardware, tablas y estilo urbano en un solo lugar.</p>
                        <a href="#tienda" className="btn-main">Ver productos</a>
                    </div>
                </section>
                <section id="tienda" style={{ textAlign: 'center', paddingTop: '60px', color: '#ff4a57' }}>{error}</section>
            </main>
        );
    }

    return (
        <main>
            {/* Hero */}
            <section id="inicio">
                <div className="hero-content">
                    <h1>Bienvenidos a Performancesb.cl</h1>
                    <p>El mejor hardware, tablas y estilo urbano en un solo lugar.</p>
                    <a href="#tienda" className="btn-main">Ver productos</a>
                </div>
            </section>

            {/* Nosotros */}
            <section id="nosotros">
                <div className="container">
                    <h2 className="section-title">Nosotros</h2>
                    <div className="about-grid">
                        <div className="about-text">
                            <p>Somos apasionados de la cultura urbana y el skateboarding. Nacimos con el objetivo de proveer productos de alta calidad.</p>
                            <p>No somos solo una tienda, somos un punto de encuentro para todos aquellos que entienden el skate como un estilo de vida.</p>
                            <Link to="/blogs" className="btn-main">Leer más</Link>
                        </div>
                        <div className="about-video-container">
                            <div className="video-wrapper">
                                <iframe 
                                    src="https://www.youtube.com/embed/295z4jtqq2A" 
                                    title="Performance Crew Video"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tienda */}
            <section id="tienda">
                <div className="container">
                    <h2 className="section-title">Nuestra Tienda</h2>
                    <div className="shop-categories">
                        <button className={`cat-btn ${categoriaSel === 'todo' ? 'active' : ''}`} onClick={() => setCategoriaSel('todo')}>Todo</button>
                        <button className={`cat-btn ${categoriaSel === 'Tablas' ? 'active' : ''}`} onClick={() => setCategoriaSel('Tablas')}>Tablas</button>
                        <button className={`cat-btn ${categoriaSel === 'Poleras y Polerones' ? 'active' : ''}`} onClick={() => setCategoriaSel('Poleras y Polerones')}>Poleras y Polerones</button>
                        <button className={`cat-btn ${categoriaSel === 'Accesorios' ? 'active' : ''}`} onClick={() => setCategoriaSel('Accesorios')}>Accesorios</button>
                    </div>

                    <div className="products-grid">
                        {productosFiltrados.length > 0 ? (
                            productosFiltrados.map(prod => (
                                <TarjetaProducto key={prod.id} producto={prod} />
                            ))
                        ) : (
                            <p style={{ color: '#fff', textAlign: 'center', gridColumn: '1/-1' }}>No hay productos en esta categoría.</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Inicio;
