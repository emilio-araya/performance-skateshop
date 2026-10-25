import React, { useState } from 'react';
import { getPedidos } from '../../services/mockStorage';

const RegistroCompras = () => {
    // Leído una vez al montar; el historial no se edita desde esta página.
    const [pedidos] = useState(() => getPedidos());

    return (
        <>
        <header className="admin-header">
            <h1>Historial de Compras y Boletas</h1>
        </header>

        <div className="admin-container">
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>N° Pedido</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Resumen Ítems</th>
                            <th>Total Pagado</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.length > 0 ? (
                            pedidos.map((p) => (
                                <tr key={p.id}>
                                    <td><code>#{p.id}</code></td>
                                    <td>{p.fecha}</td>
                                    <td>{p.cliente || 'Anónimo'}</td>
                                    <td>{p.resumenItems}</td>
                                    <td><strong>${Number(p.total).toLocaleString("es-CL")}</strong></td>
                                    <td>
                                        <span className="badge Cliente" style={{ backgroundColor: p.estado === 'Aprobado' ? '#25d366' : '#ff4a57' }}>
                                            {p.estado || 'Aprobado'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No hay compras registradas aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default RegistroCompras;