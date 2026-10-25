import React, { useState, useEffect } from 'react';
import Campo from '../../components/Campo';
import { getUsuarios, guardarUsuario, eliminarUsuario } from '../../services/mockStorage';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [tabActiva, setTabActiva] = useState('clientes');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [usrIndex, setUsrIndex] = useState(-1);

    const [form, setForm] = useState({
        run: '',
        nombre: '',
        apellidos: '',
        email: '',
        rol: 'Cliente',
        region: 'Región Metropolitana de Santiago',
        comuna: 'Santiago',
        direccion: ''
    });

    useEffect(() => {
        setUsuarios(getUsuarios());
    }, []);

    const clientes = usuarios.map((u, i) => ({ ...u, originalIndex: i })).filter(u => u.rol === 'Cliente');
    const staff = usuarios.map((u, i) => ({ ...u, originalIndex: i })).filter(u => u.rol !== 'Cliente');

    const handleNuevo = () => {
        setForm({ run: '', nombre: '', apellidos: '', email: '', rol: 'Cliente', region: 'Región Metropolitana de Santiago', comuna: 'Santiago', direccion: '' });
        setUsrIndex(-1);
        setMostrarForm(true);
    };

    const handleEditar = (usr) => {
        setForm(usr);
        setUsrIndex(usr.originalIndex);
        setMostrarForm(true);
    };

    const handleEliminar = (index) => {
        if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
            eliminarUsuario(index);
            setUsuarios(getUsuarios());
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        guardarUsuario(form, usrIndex);
        setUsuarios(getUsuarios());
        setMostrarForm(false);
    };

    return (
        <>
        <header className="admin-header">
            <h1>Gestión de Usuarios</h1>
        </header>

        <div className="admin-container">
            <div className="section-header-actions">
                <div className="user-tabs-container">
                    <button className={`user-tab-btn ${tabActiva === 'clientes' ? 'active' : ''}`} onClick={() => { setTabActiva('clientes'); setMostrarForm(false); }}>
                        Clientes ({clientes.length})
                    </button>
                    <button className={`user-tab-btn ${tabActiva === 'staff' ? 'active' : ''}`} onClick={() => { setTabActiva('staff'); setMostrarForm(false); }}>
                        Staff / Personal ({staff.length})
                    </button>
                </div>
                <button className="btn-main" onClick={handleNuevo}>
                    <i className="fa-solid fa-user-plus"></i> Nuevo Usuario
                </button>
            </div>

            {mostrarForm ? (
                <div className="form-container">
                    <h3>{usrIndex >= 0 ? "Editar Usuario" : "Nuevo Usuario"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <Campo label="RUN (Sin puntos ni guión)" name="run" value={form.run} onChange={e => setForm({ ...form, run: e.target.value })} required />
                            <Campo label="Nombre" name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                            <Campo label="Apellidos" name="apellidos" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} required />
                            <Campo label="Correo Electrónico" type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            <div className="form-group">
                                <label htmlFor="gestion-usuarios-rol">Tipo de Usuario / Rol</label>
                                <select id="gestion-usuarios-rol" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Vendedor">Vendedor</option>
                                </select>
                            </div>
                            <Campo label="Dirección" name="direccion" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
                        </div>
                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
                            <button type="submit" className="btn-main">Guardar Usuario</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>RUN</th>
                                <th>Nombre Completo</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(tabActiva === 'clientes' ? clientes : staff).map(u => (
                                <tr key={u.email}>
                                    <td>{u.run || 'N/A'}</td>
                                    <td>{u.nombre} {u.apellidos}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${u.rol}`}>{u.rol}</span></td>
                                    <td>
                                        <button className="btn-action btn-edit" onClick={() => handleEditar(u)}>
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button className="btn-action btn-delete" onClick={() => handleEliminar(u.originalIndex)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
};

export default GestionUsuarios;