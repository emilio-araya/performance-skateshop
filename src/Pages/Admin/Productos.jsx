import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import Campo from '../../components/Campo';
import ImagenProducto from '../../components/ImagenProducto';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, getCategorias } from '../../services/api';
import '../../assets/styles/admin.css';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modalActivo, setModalActivo] = useState(false);
    const [form, setForm] = useState({ id: '', nombre: '', categoria: '', precio: 0, stock: 10, imagen: '' });
    const [idEditando, setIdEditando] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [listaProductos, listaCategorias] = await Promise.all([getProductos(), getCategorias()]);
            setProductos(listaProductos || []);
            setCategorias(listaCategorias || []);
            if ((listaCategorias || []).length > 0 && !form.categoria) {
                setForm(prev => ({ ...prev, categoria: String((listaCategorias || [])[0].id) }));
            }
        } catch (err) {
            setError('No se pudieron cargar los productos y categorías.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevo = () => {
        setForm({ id: '', nombre: '', categoria: categorias.length > 0 ? String(categorias[0].id) : '', precio: 0, stock: 10, imagen: '' });
        setIdEditando(null);
        setModalActivo(true);
    };

    const abrirModalEditar = (prod) => {
        setForm({
            id: String(prod.id || ''),
            nombre: prod.nombre || '',
            categoria: prod.categoria ? String(prod.categoria.id || prod.categoria) : '',
            precio: Number(prod.precio || 0),
            stock: Number(prod.stock || 0),
            imagen: prod.imagen || ''
        });
        setIdEditando(prod.id);
        setModalActivo(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nombre: form.nombre,
            categoria: { id: Number(form.categoria) },
            precio: Number(form.precio),
            stock: Number(form.stock),
            imagen: form.imagen
        };
        try {
            if (idEditando) {
                await actualizarProducto(idEditando, payload);
            } else {
                await crearProducto(payload);
            }
            setModalActivo(false);
            await cargarDatos();
        } catch (err) {
            setError('No se pudo guardar el producto.');
            console.error(err);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm(`¿Seguro que deseas eliminar el producto ID: ${id}?`)) {
            try {
                await eliminarProducto(id);
                await cargarDatos();
            } catch (err) {
                setError('No se pudo eliminar el producto.');
                console.error(err);
            }
        }
    };

    if (cargando) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Productos</h1></header>
                    <div className="admin-container" style={{ textAlign: 'center', paddingTop: '60px' }}>Cargando productos...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-body">
                <SidebarAdmin />
                <main className="admin-main">
                    <header className="admin-header"><h1>Gestión de Productos</h1></header>
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
                    <h1>Gestión de Productos</h1>
                </header>

                <div className="admin-container">
                    <div className="section-header-actions">
                        <h2>Inventario General ({productos.length})</h2>
                        <button className="btn-main" onClick={abrirModalNuevo}>
                            <i className="fa-solid fa-plus"></i> Agregar Producto
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(p => (
                                    <tr key={p.id}>
                                        <td><ImagenProducto src={p.imagen} alt={p.nombre} className="img-thumb" /></td>
                                        <td>
                                            <Link to={`/admin/producto/${p.id}`} style={{ color: '#fff', fontWeight: 'bold' }}>
                                                {p.nombre}
                                            </Link>
                                        </td>
                                        <td><span className="badge-admin">{p.categoria ? (typeof p.categoria === 'string' ? p.categoria : p.categoria.nombre) : '-'}</span></td>
                                        <td>${Number(p.precio).toLocaleString("es-CL")}</td>
                                        <td>{p.stock} un.</td>
                                        <td>
                                            <button className="btn-action btn-edit" onClick={() => abrirModalEditar(p)}>
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button className="btn-action btn-delete" onClick={() => handleEliminar(p.id)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {modalActivo && (
                    <div className="modal-overlay active">
                        <div className="modal-box user-form-card">
                            <div className="user-form-header">
                                <h2>{idEditando ? "Editar Producto" : "Nuevo Producto"}</h2>
                                <p className="user-form-subtitle">
                                    Completa los campos del producto para mantener actualizado el inventario.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="admin-form-container">
                                <div className="form-grid-2col">
                                    <Campo 
                                        label="ID Único" 
                                        name="id" 
                                        value={form.id} 
                                        onChange={e => setForm({ ...form, id: e.target.value })} 
                                        disabled={!!idEditando} 
                                        required 
                                    />
                                    <Campo 
                                        label="Nombre del Producto" 
                                        name="nombre" 
                                        value={form.nombre} 
                                        onChange={e => setForm({ ...form, nombre: e.target.value })} 
                                        required 
                                    />
                                    <div className="admin-form-group">
                                        <label htmlFor="productos-categoria">Categoría</label>
                                        <select 
                                            id="productos-categoria"
                                            className="admin-select" 
                                            value={form.categoria} 
                                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                                        >
                                            {categorias.map((c, idx) => (
                                                <option key={c.id || idx} value={c.id}>
                                                    {c.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Campo 
                                        label="Precio ($ CLP)" 
                                        type="number" 
                                        name="precio" 
                                        value={form.precio} 
                                        onChange={e => setForm({ ...form, precio: e.target.value })} 
                                        required 
                                    />
                                    <Campo 
                                        label="Stock Disponible" 
                                        type="number" 
                                        name="stock" 
                                        value={form.stock} 
                                        onChange={e => setForm({ ...form, stock: e.target.value })} 
                                        required 
                                    />
                                    <Campo 
                                        label="Ruta de Imagen" 
                                        name="imagen" 
                                        value={form.imagen} 
                                        onChange={e => setForm({ ...form, imagen: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div className="user-form-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setModalActivo(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-main">
                                        Guardar Producto
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Productos;
