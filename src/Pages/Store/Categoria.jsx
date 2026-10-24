import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from '../../services/mockStorage';

const Categoria = () => {
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        setCategorias(getCategorias());
    }, []);

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container">
                <h1 className="section-title">Categorías</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {categorias.map((cat, idx) => (
                        <Link key={idx} to={`/categoria/${encodeURIComponent(cat)}`} style={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            padding: '30px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}>
                            {cat}
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Categoria;