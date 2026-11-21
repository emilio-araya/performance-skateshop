import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import { getCategorias, crearCategoria, eliminarCategoria } from '../../services/api';
import '../../assets/styles/admin.css';

const GestionCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [nuevaCat, setNuevaCat] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleAgregar = async (e) => {
        e.preventDefault();
        if (nuevaCat.trim()) {
            try {
                await crearCategoria(nuevaCat.trim());
                await cargarDatos();
                setNuevaCat('');
            } catch (err) {
                setError('No se pudo crear la categoría.');
                console.error(err);
            }
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Deseas eliminar esta categoría?')) {
            try {
                await eliminarCategoria(id);
                await cargarDatos();
            } catch (err) {
                setError('No se pudo eliminar la categoría.');
                console.error(err);
            }
        }
    };

    if (cargando) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Categorías</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando categorías...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Categorías</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px', color: '#ff4a57' }}>{error}</div>
                </main>
            </div>
        );
    }

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
                                    <tr key={cat.id}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#ff4a57' }}>{idx + 1}</td>
                                        <td><strong>{cat.nombre}</strong></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button type="button" className="btn-action btn-delete" onClick={() => handleEliminar(cat.id)}>
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
