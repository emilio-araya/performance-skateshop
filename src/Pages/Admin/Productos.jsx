import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import Campo from '../../components/Campo';
import ImagenProducto from '../../components/ImagenProducto';
import { getProductos, guardarProducto, eliminarProducto, getCategorias } from '../../services/mockStorage';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [modalActivo, setModalActivo] = useState(false);
    const [form, setForm] = useState({ id: '', nombre: '', categoria: '', precio: 0, stock: 10, imagen: '' });
    const [idEditando, setIdEditando] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = () => {
        setProductos(getProductos());
        const cats = getCategorias();
        setCategorias(cats);
        if (cats.length > 0 && !form.categoria) {
            setForm(prev => ({ ...prev, categoria: cats[0] }));
        }
    };

    const abrirModalNuevo = () => {
        setForm({ id: '', nombre: '', categoria: categorias[0] || 'Tablas', precio: 0, stock: 10, imagen: '' });
        setIdEditando(null);
        setModalActivo(true);
    };

    const abrirModalEditar = (prod) => {
        setForm(prod);
        setIdEditando(prod.id);
        setModalActivo(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        guardarProducto({
            ...form,
            precio: Number(form.precio),
            stock: Number(form.stock)
        });
        setModalActivo(false);
        cargarDatos();
    };

    const handleEliminar = (id) => {
        if (window.confirm(`¿Seguro que deseas eliminar el producto ID: ${id}?`)) {
            eliminarProducto(id);
            cargarDatos();
        }
    };

    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Gestión de Productos</h1>
                </header>

                <div className="admin-container">
                    <div className="section-header-actions">
                        <h2>Inventario General</h2>
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
                                        <td><span className="badge-admin">{p.categoria}</span></td>
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

                {/* Modal Crear / Editar */}
                {modalActivo && (
                    <div className="modal-overlay active">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>{idEditando ? "Editar Producto" : "Nuevo Producto"}</h3>
                                <button className="btn-close-modal" onClick={() => setModalActivo(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="auth-form active">
                                <Campo label="ID Único" name="id" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} disabled={!!idEditando} required />
                                <Campo label="Nombre del Producto" name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                                <div className="input-group">
                                    <label htmlFor="productos-categoria">Categoría</label>
                                    <select 
                                        id="productos-categoria"
                                        className="admin-select" 
                                        value={form.categoria} 
                                        onChange={e => setForm({ ...form, categoria: e.target.value })}
                                    >
                                        {categorias.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <Campo label="Precio ($ CLP)" type="number" name="precio" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                                <Campo label="Stock Disponible" type="number" name="stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                                <Campo label="Ruta de Imagen" name="imagen" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} required />
                                <button type="submit" className="btn-main auth-btn">Guardar Producto</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Productos;