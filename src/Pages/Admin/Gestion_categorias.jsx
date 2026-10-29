import React, { useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import { getCategorias, guardarCategoria, eliminarCategoria } from '../../services/mockStorage';
import '../../assets/styles/admin.css';

const GestionCategorias = () => {
    const [categorias, setCategorias] = useState(() => getCategorias());
    const [nuevaCat, setNuevaCat] = useState('');

    const cargarDatos = () => {
        setCategorias(getCategorias());
    };

    const handleAgregar = (e) => {
        e.preventDefault();
        if (nuevaCat.trim()) {
            guardarCategoria(nuevaCat.trim());
            cargarDatos();
            setNuevaCat('');
        }
    };

    const handleEliminar = (nombre) => {
        if (window.confirm(`¿Deseas eliminar la categoría "${nombre}"?`)) {
            eliminarCategoria(nombre);
            cargarDatos();
        }
    };

    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Gestión de Categorías</h1>
                </header>

                <div className="admin-container">
                    <div className="category-card">
                        <h3>Nueva Categoría</h3>
                        <form onSubmit={handleAgregar} className="category-form">
                            <div className="input-group">
                                <label htmlFor="nombreCategoria">Nombre de la Categoría</label>
                                <input 
                                    id="nombreCategoria"
                                    type="text" 
                                    value={nuevaCat} 
                                    onChange={e => setNuevaCat(e.target.value)} 
                                    placeholder="Ej: Calzado Skate" 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn-save-cat">
                                Guardar Categoría
                            </button>
                        </form>
                    </div>

                    <div className="table-responsive" style={{ maxWidth: '650px', margin: '0 auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px', textAlign: 'center' }}>#</th>
                                    <th>Nombre Categoría</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((cat, idx) => (
                                    <tr key={cat}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#ff4a57' }}>{idx + 1}</td>
                                        <td><strong>{cat}</strong></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button type="button" className="btn-action btn-delete" onClick={() => handleEliminar(cat)}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GestionCategorias;