import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from '../../services/api';

const IMAGEN_DEFAULT = "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=300&q=80";

const Categoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const lista = await getCategorias();
            setCategorias(lista || []);
        } catch (err) {
            setError('No se pudieron cargar las categorías.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
                <h1 className="section-title">Categorías</h1>
                <div style={{ textAlign: 'center', paddingTop: '40px' }}>Cargando categorías...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
                <h1 className="section-title">Categorías</h1>
                <div style={{ textAlign: 'center', paddingTop: '40px', color: '#ff4a57' }}>{error}</div>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            <h1 className="section-title">Categorías</h1>
            
            <div className="categories-grid-page">
                {categorias.map((cat, idx) => (
                    <Link key={cat.id} to={`/categoria/${encodeURIComponent(cat.nombre)}`} className="category-card-visual">
                        <img 
                            src={IMAGEN_DEFAULT} 
                            alt={cat.nombre} 
                            className="category-card-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = IMAGEN_DEFAULT;
                            }}
                        />
                        <div className="category-card-overlay">
                            <h3>{cat.nombre}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
};

export default Categoria;
