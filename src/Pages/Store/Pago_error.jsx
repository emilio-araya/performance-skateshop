import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PagoError = () => {
    const { state } = useLocation();

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <i className="fa-solid fa-circle-xmark" style={{ fontSize: '4rem', color: '#ff4a57', marginBottom: '20px' }}></i>
                <h2>No se pudo realizar el pago. nro #{state?.id || '20240705'}</h2>
                <p style={{ color: '#aaa', margin: '15px 0' }}>
                    Ocurrió un problema procesando la transacción. No se ha efectuado ningún cargo a tu cuenta.
                </p>
                <Link to="/checkout" className="btn-main" style={{ marginTop: '20px', display: 'inline-block' }}>
                    VOLVER A REALIZAR EL PAGO
                </Link>
            </div>
        </main>
    );
};

export default PagoError;