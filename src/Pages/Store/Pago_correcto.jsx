import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PagoCorrecto = () => {
    const { state } = useLocation();

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '4rem', color: '#25d366', marginBottom: '20px' }}></i>
                <h2>Se ha realizado la compra. nro #{state?.id || '20240705'}</h2>
                <p style={{ color: '#aaa', margin: '15px 0' }}>
                    Gracias por tu compra, <strong>{state?.cliente || 'Cliente'}</strong>. Se ha enviado el comprobante a {state?.correo || 'tu correo'}.
                </p>
                <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'left', marginBottom: '20px' }}>
                    <p><strong>Dirección de entrega:</strong> {state?.direccion}</p>
                    <p><strong>Total Pagado:</strong> ${state?.total?.toLocaleString("es-CL")}</p>
                </div>
                <Link to="/" className="btn-main">Volver a la Tienda</Link>
            </div>
        </main>
    );
};

export default PagoCorrecto;