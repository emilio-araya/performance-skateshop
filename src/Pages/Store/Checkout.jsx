import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/Contexto_carrito';
import { useSesion } from '../../context/Contexto_sesion';
import Campo from '../../components/Campo';
import { confirmarPedido } from '../../services/mockStorage';

const Checkout = () => {
    const { carrito, totalPagar, disminuirCantidad, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = useCarrito();
    const navigate = useNavigate();
    const { usuario } = useSesion();

    // Pre-filled once from the logged-in user; later edits stay local to the form.
    const [form, setForm] = useState(() => ({
        nombre: usuario?.nombre ?? '',
        apellidos: usuario?.apellidos ?? '',
        correo: usuario?.email ?? '',
        calle: '',
        region: 'Región Metropolitana de Santiago',
        comuna: '',
        indicaciones: ''
    }));

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const camposRequeridos = ['nombre', 'apellidos', 'correo', 'calle', 'comuna'];

    const validarFormulario = () => {
        const faltante = camposRequeridos.find(campo => !form[campo] || String(form[campo]).trim() === '');
        return faltante;
    };

    const simularPago = (exitoso) => {
        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        const campoFaltante = validarFormulario();
        if (campoFaltante) {
            alert(`Completa el campo ${campoFaltante} antes de pagar.`);
            return;
        }

        const { pedido, error } = confirmarPedido({ cliente: form, items: carrito, total: totalPagar, exitoso });
        if (error) {
            alert(error);
            return;
        }

        if (exitoso) {
            vaciarCarrito();
            navigate('/pago-correcto', { state: pedido });
        } else {
            navigate('/pago-error', { state: pedido });
        }
    };

    return (
        <main className="carrito-page">
            <div className="container">
                <h1 className="section-title">Carrito de Compra</h1>
                
                {carrito.length === 0 ? (
                    <div className="carrito-vacio">
                        <i className="fas fa-shopping-cart"></i>
                        <h2>Tu carrito está vacío</h2>
                        <button className="btn-main" onClick={() => navigate('/')}>Ir a la tienda</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        <div>
                            {/* Lista de productos */}
                            <div id="carrito-container">
                                {carrito.map(item => (
                                    <div key={item.id} className="producto-carrito">
                                        <img src={item.imagen} alt={item.nombre} />
                                        <div className="producto-carrito-info">
                                            <h3>{item.nombre}</h3>
                                            <p>Precio: ${Number(item.precio).toLocaleString("es-CL")}</p>
                                            <div className="control-cantidad">
                                                <button onClick={() => disminuirCantidad(item.id)}>-</button>
                                                <span>{item.cantidad}</span>
                                                <button onClick={() => agregarAlCarrito(item)}>+</button>
                                            </div>
                                            <p>Subtotal: ${(item.precio * item.cantidad).toLocaleString("es-CL")}</p>
                                            <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Formulario Cliente y Dirección */}
                            <div className="form-container" style={{ marginTop: '30px' }}>
                                <h3>Información del cliente</h3>
                                <div className="form-grid">
                                    <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
                                    <Campo label="Apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} />
                                    <Campo label="Correo" type="email" name="correo" value={form.correo} onChange={handleChange} />
                                    <Campo label="Calle y Número" name="calle" value={form.calle} onChange={handleChange} placeholder="Ej: Av. Principal 123" />
                                    <Campo label="Comuna" name="comuna" value={form.comuna} onChange={handleChange} placeholder="Ej: Maipú" />
                                </div>
                            </div>
                        </div>

                        {/* Resumen y Simulador de Pago */}
                        <div id="carrito-resumen">
                            <h2>Resumen de compra</h2>
                            <p>Total a pagar: <strong>${totalPagar.toLocaleString("es-CL")}</strong></p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                                <button className="btn-main" style={{ backgroundColor: '#25d366' }} onClick={() => simularPago(true)}>
                                    Simular Pago Exitoso
                                </button>
                                <button className="btn-main" style={{ backgroundColor: '#ff4a57' }} onClick={() => simularPago(false)}>
                                    Simular Pago con Error
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Checkout;