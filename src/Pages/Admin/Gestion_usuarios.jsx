import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import Campo from '../../components/Campo';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../services/api';
import '../../assets/styles/admin.css';

const ROL_BACKEND = { Cliente: 'CLIENTE', Administrador: 'ADMINISTRADOR', Vendedor: 'VENDEDOR' };
const ROL_FRONT = { CLIENTE: 'Cliente', ADMINISTRADOR: 'Administrador', VENDEDOR: 'Vendedor' };

const rolBackend = (rol = '') => ROL_BACKEND[rol] || rol;
const rolFront = (rol = '') => ROL_FRONT[rol] || rol;

const FORM_INICIAL = {
    run: '',
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    rol: 'Cliente',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Santiago',
    direccion: ''
};

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [tabActiva, setTabActiva] = useState('clientes');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [usrIndex, setUsrIndex] = useState(-1);
    const [form, setForm] = useState(FORM_INICIAL);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const lista = await getUsuarios();
            setUsuarios((lista || []).map(u => ({
                ...u,
                rol: rolFront(u.rol)
            })));
        } catch (err) {
            setError('No se pudieron cargar los usuarios.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const clientes = usuarios.filter(u => u.rol === 'Cliente');
    const staff = usuarios.filter(u => u.rol !== 'Cliente');

    const handleNuevo = () => {
        setForm(FORM_INICIAL);
        setUsrIndex(-1);
        setMostrarForm(true);
    };

    const handleEditar = (usr) => {
        setForm({ ...usr, password: usr.password || '' });
        setUsrIndex(usr.originalIndex >= 0 ? usr.originalIndex : -1);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
            try {
                await eliminarUsuario(id);
                await cargarDatos();
            } catch (err) {
                setError('No se pudo eliminar el usuario.');
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            rol: rolBackend(form.rol)
        };
        try {
            if (usrIndex >= 0) {
                await actualizarUsuario(usrIndex, payload);
            } else {
                await crearUsuario(payload);
            }
            setMostrarForm(false);
            await cargarDatos();
        } catch (err) {
            setError('No se pudo guardar el usuario.');
            console.error(err);
        }
    };

    if (cargando) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Usuarios</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando usuarios...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Usuarios</h1></header>
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
                    <h1>Gestión de Usuarios</h1>
                </header>

                <div className="admin-container">
                    <div className="section-header-actions">
                        <div className="user-tabs-container">
                            <button 
                                className={`user-tab-btn ${tabActiva === 'clientes' ? 'active' : ''}`} 
                                onClick={() => { setTabActiva('clientes'); setMostrarForm(false); }}
                            >
                                Clientes ({clientes.length})
                            </button>
                            <button 
                                className={`user-tab-btn ${tabActiva === 'staff' ? 'active' : ''}`} 
                                onClick={() => { setTabActiva('staff'); setMostrarForm(false); }}
                            >
                                Staff / Personal ({staff.length})
                            </button>
                        </div>
                        <button className="btn-main" onClick={handleNuevo}>
                            + Nuevo Usuario
                        </button>
                    </div>

                    {mostrarForm ? (
                        <div className="user-form-card">
                            <div className="user-form-header">
                                <h2>{usrIndex >= 0 ? "Editar Perfil de Usuario" : "Registro de Nuevo Usuario"}</h2>
                                <p className="user-form-subtitle">
                                    Asigna los datos del usuario y gestiona sus permisos en el sistema.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="admin-form-block">
                                <div className="form-section-title">1. Datos de Acceso y Rol</div>
                                <div className="form-grid-2col">
                                    <Campo 
                                        label="RUN (Sin puntos ni guión)" 
                                        name="run" 
                                        placeholder="123456789" 
                                        value={form.run} 
                                        onChange={e => setForm({ ...form, run: e.target.value })} 
                                        required 
                                    />

                                    <div className="admin-form-group">
                                        <label htmlFor="gestion-usuarios-rol">Tipo de Usuario / Rol</label>
                                        <select 
                                            id="gestion-usuarios-rol" 
                                            className="admin-select"
                                            value={form.rol} 
                                            onChange={e => setForm({ ...form, rol: e.target.value })}
                                        >
                                            <option value="Cliente">Cliente</option>
                                            <option value="Administrador">Administrador</option>
                                            <option value="Vendedor">Vendedor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-section-title" style={{ marginTop: '20px' }}>2. Información Personal</div>
                                <div className="form-grid-2col">
                                    <Campo 
                                        label="Nombre" 
                                        name="nombre" 
                                        placeholder="Nombre del usuario" 
                                        value={form.nombre} 
                                        onChange={e => setForm({ ...form, nombre: e.target.value })} 
                                        required 
                                    />

                                    <Campo 
                                        label="Apellidos" 
                                        name="apellidos" 
                                        placeholder="Apellidos del usuario" 
                                        value={form.apellidos} 
                                        onChange={e => setForm({ ...form, apellidos: e.target.value })} 
                                        required 
                                    />

                                    <Campo 
                                        label="Correo Electrónico" 
                                        type="email" 
                                        name="email" 
                                        placeholder="usuario@ejemplo.cl" 
                                        value={form.email} 
                                        onChange={e => setForm({ ...form, email: e.target.value })} 
                                        required 
                                    />

                                    <Campo 
                                        label="Contraseña" 
                                        type="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        value={form.password} 
                                        onChange={e => setForm({ ...form, password: e.target.value })} 
                                        required={usrIndex < 0} 
                                    />
                                </div>

                                <div className="form-section-title" style={{ marginTop: '20px' }}>3. Dirección de Contacto</div>
                                <div className="form-grid-2col">
                                    <div className="form-field-full">
                                        <Campo 
                                            label="Dirección Completa" 
                                            name="direccion" 
                                            placeholder="Av. Principal #123, Comuna, Región" 
                                            value={form.direccion} 
                                            onChange={e => setForm({ ...form, direccion: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="user-form-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-main">
                                        {usrIndex >= 0 ? "Actualizar Usuario" : "Guardar Usuario"}
                                    </button>
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
                                    {(tabActiva === 'clientes' ? clientes : staff).length > 0 ? (
                                        (tabActiva === 'clientes' ? clientes : staff).map(u => (
                                            <tr key={u.email}>
                                                <td>{u.run || 'N/A'}</td>
                                                <td><strong>{u.nombre} {u.apellidos}</strong></td>
                                                <td>{u.email}</td>
                                                <td><span className="badge-admin">{u.rol}</span></td>
                                                <td>
                                                    <button type="button" className="btn-action btn-edit" onClick={() => handleEditar(u)}>
                                                        Editar
                                                    </button>
                                                    <button type="button" className="btn-action btn-delete" onClick={() => handleEliminar(u.id)}>
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#aaaaaa' }}>
                                                No hay usuarios registrados en esta sección.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GestionUsuarios;
