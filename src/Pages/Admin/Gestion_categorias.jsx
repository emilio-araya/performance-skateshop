import React, { useState } from 'react';
import { getCategorias, guardarCategoria } from '../../services/mockStorage';

const GestionCategorias = () => {
    const [categorias, setCategorias] = useState(() => getCategorias());
    const [nuevaCat, setNuevaCat] = useState('');

    const handleAgregar = (e) => {
        e.preventDefault();
        if (nuevaCat.trim()) {
            guardarCategoria(nuevaCat.trim());
            setCategorias(getCategorias());
            setNuevaCat('');
        }
    };

    return (
        <>
        <header className="admin-header">
            <h1>Gestión de Categorías</h1>
        </header>

        <div className="admin-container">
            {/* Tarjeta contenedora del formulario de categorías */}
            <div className="category-card">
                <h3>Nueva Categoría</h3>
                <form onSubmit={handleAgregar} className="category-form">
                    <div className="input-group">
                        <label>Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            value={nuevaCat} 
                            onChange={e => setNuevaCat(e.target.value)} 
                            placeholder="Ej: Calzado Skate" 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-main btn-save-cat">
                        <i className="fa-solid fa-plus"></i> Guardar Categoría
                    </button>
                </form>
            </div>

            {/* Tabla de categorías */}
            <div className="table-responsive" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>#</th>
                            <th>Nombre Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map((cat, idx) => (
                            <tr key={cat}>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#ff4a57' }}>{idx + 1}</td>
                                <td><strong>{cat}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default GestionCategorias;