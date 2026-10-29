import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from '../../services/mockStorage';

const IMAGEN_DEFAULT = "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=300&q=80";

const Categoria = () => {
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        setCategorias(getCategorias());
    }, []);

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            <h1 className="section-title">Categorías</h1>
            
            <div className="categories-grid-page">
                {categorias.map((cat, idx) => (
                    <Link key={idx} to={`/categoria/${encodeURIComponent(cat)}`} className="category-card-visual">
                        <img 
                            src={IMAGEN_DEFAULT} 
                            alt={cat} 
                            className="category-card-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = IMAGEN_DEFAULT;
                            }}
                        />
                        <div className="category-card-overlay">
                            <h3>{cat}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
};

export default Categoria;