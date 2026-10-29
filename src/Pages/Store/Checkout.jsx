import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/Contexto_carrito';
import { useSesion } from '../../context/Contexto_sesion';
import Campo from '../../components/Campo';
import { registrarPedido, descontarStock, getProductos } from '../../services/mockStorage';
import '../../assets/styles/carrito.css';

const IMAGEN_DEFAULT = "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=300&q=80";

const Checkout = () => {
    const { carrito, totalPagar, disminuirCantidad, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = useCarrito();
    const navigate = useNavigate();
    const { usuario } = useSesion();

    const [errorStock, setErrorStock] = useState(null);

    const [form, setForm] = useState({
        nombre: usuario?.nombre || '',
        apellidos: usuario?.apellidos || '',
        correo: usuario?.email || '',
        calle: '',
        region: 'Región Metropolitana de Santiago',
        comuna: '',
        indicaciones: ''
    });

    useEffect(() => {
        if (usuario) {
            setForm(prev => ({
                ...prev,
                nombre: prev.nombre || usuario.nombre || '',
                apellidos: prev.apellidos || usuario.apellidos || '',
                correo: prev.correo || usuario.email || ''
            }));
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const camposRequeridos = ['nombre', 'apellidos', 'correo', 'calle', 'comuna'];

    const validarFormulario = () => {
        return camposRequeridos.find(campo => !form[campo] || String(form[campo]).trim() === '');
    };

    const simularPago = (exitoso) => {
        setErrorStock(null);

        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        const campoFaltante = validarFormulario();
        if (campoFaltante) {
            alert(`Completa el campo "${campoFaltante}" antes de pagar.`);
            return;
        }

        // Validar inventario solo si el producto existe en el catálogo registrado
        const productosBodega = getProductos();
        let mensajeError = null;

        for (const item of carrito) {
            const prodBodega = productosBodega.find(p => p.id === item.id);
            if (prodBodega) {
                const stockDisponible = Number(prodBodega.stock);
                if (Number(item.cantidad) > stockDisponible) {
                    mensajeError = `Stock insuficiente para "${item.nombre}". Solicitaste ${item.cantidad} unidad(es), pero únicamente quedan ${stockDisponible} unidad(es) disponible(s) en bodega.`;
                    break;
                }
            }
        }

        if (mensajeError) {
            setErrorStock(mensajeError);
            return;
        }

        const contador = parseInt(localStorage.getItem('contador_pedidos') || '0', 10) + 1;
        localStorage.setItem('contador_pedidos', String(contador));
        const orderId = `pedido-${contador}`;
        const resumen = carrito.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

        const nuevoPedido = {
            id: orderId,
            fecha: new Date().toLocaleDateString("es-CL"),
            cliente: `${form.nombre} ${form.apellidos}`,
            correo: form.correo,
            direccion: `${form.calle}, ${form.comuna}, ${form.region}`,
            resumenItems: resumen,
            total: Number(totalPagar || 0),
            items: carrito,
            estado: exitoso ? "Aprobado" : "Rechazado"
        };

        registrarPedido(nuevoPedido);

        if (exitoso) {
            descontarStock(carrito);
            vaciarCarrito();
            navigate('/pago-correcto', { state: nuevoPedido });
        } else {
            navigate('/pago-error', { state: nuevoPedido });
        }
    };

    return (
        <main className="checkout-page container">
            <h1 className="section-title">Carrito de Compra</h1>

            {errorStock && (
                <div style={{
                    backgroundColor: 'rgba(255, 74, 87, 0.15)',
                    border: '1px solid #ff4a57',
                    color: '#ff4a57',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px'
                }}>
                    <span>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '10px' }}></i>
                        {errorStock}
                    </span>
                    <button 
                        type="button"
                        onClick={() => setErrorStock(null)} 
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4a57',
                            fontSize: '1.2rem',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
            
            {carrito.length === 0 ? (
                <div className="cart-items-section" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', color: '#ff4a57', marginBottom: '15px' }}></i>
                    <h2>Tu carrito está vacío</h2>
                    <button type="button" className="btn-main" style={{ marginTop: '15px' }} onClick={() => navigate('/')}>
                        Ir a la tienda
                    </button>
                </div>
            ) : (
                <div className="checkout-grid">
                    <div className="cart-left-col">
                        <div className="cart-items-section">
                            <h3 className="cart-section-title">Productos en tu Carrito</h3>
                            {carrito.map(item => (
                                <div key={item.id} className="cart-item-card">
                                    <img 
                                        src={item.imagen || item.foto || item.image || IMAGEN_DEFAULT} 
                                        alt={item.nombre} 
                                        className="cart-item-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = IMAGEN_DEFAULT;
                                        }}
                                    />
                                    <div className="cart-item-details">
                                        <h4>{item.nombre}</h4>
                                        <p className="cart-item-price">
                                            Precio: ${Number(item.precio || 0).toLocaleString("es-CL")}
                                        </p>
                                        
                                        <div className="cart-item-actions">
                                            <div className="qty-controls">
                                                <button type="button" className="btn-qty" onClick={() => { setErrorStock(null); disminuirCantidad(item.id); }}>-</button>
                                                <span className="qty-number">{item.cantidad}</span>
                                                <button type="button" className="btn-qty" onClick={() => { setErrorStock(null); agregarAlCarrito(item); }}>+</button>
                                            </div>
                                            <button type="button" className="btn-delete-item" onClick={() => { setErrorStock(null); eliminarDelCarrito(item.id); }}>
                                                Eliminar
                                            </button>
                                        </div>
                                        <p className="cart-item-subtotal">
                                            Subtotal: ${((Number(item.precio) || 0) * (Number(item.cantidad) || 0)).toLocaleString("es-CL")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="client-info-card">
                            <h3 className="cart-section-title">Información del cliente</h3>
                            <div className="form-grid-2">
                                <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
                                <Campo label="Apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} />
                                <div className="form-field-full">
                                    <Campo label="Correo" type="email" name="correo" value={form.correo} onChange={handleChange} />
                                </div>
                                <Campo label="Calle y Número" name="calle" value={form.calle} onChange={handleChange} placeholder="Ej: Av. Principal 123" />
                                <Campo label="Comuna" name="comuna" value={form.comuna} onChange={handleChange} placeholder="Ej: Maipú" />
                            </div>
                        </div>
                    </div>

                    <div className="cart-summary-card">
                        <h3>Resumen de compra</h3>
                        <div className="summary-total-row">
                            <span>Total a pagar:</span>
                            <strong className="total-amount">${Number(totalPagar || 0).toLocaleString("es-CL")}</strong>
                        </div>

                        <div className="payment-buttons-wrapper">
                            <button type="button" className="btn-pay-success" onClick={() => simularPago(true)}>
                                Simular Pago Exitoso
                            </button>
                            <button type="button" className="btn-pay-error" onClick={() => simularPago(false)}>
                                Simular Pago con Error
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Checkout;