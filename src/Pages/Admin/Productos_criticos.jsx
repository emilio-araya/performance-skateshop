import { useState } from 'react';
import ImagenProducto from '../../components/ImagenProducto';
import { getProductosCriticos } from '../../services/mockStorage';

const UMBRAL_STOCK_CRITICO = 5;

const ProductosCriticos = () => {
    // Read once on mount; the list is not edited from this page.
    const [criticos] = useState(() => getProductosCriticos(UMBRAL_STOCK_CRITICO));

    return (
        <>
        <header className="admin-header">
            <h1>Listado de Productos Críticos</h1>
        </header>

        <div className="admin-container">
            <p className="admin-descripcion">
                Productos con existencias en bodega iguales o inferiores a {UMBRAL_STOCK_CRITICO} unidades.
            </p>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock Actual</th>
                            <th>Estado Alerta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {criticos.length > 0 ? (
                            criticos.map(p => (
                                <tr key={p.id}>
                                    <td><ImagenProducto src={p.imagen} alt={p.nombre} className="img-thumb" /></td>
                                    <td><strong>{p.nombre}</strong></td>
                                    <td><span className="badge-admin">{p.categoria}</span></td>
                                    <td>${Number(p.precio).toLocaleString("es-CL")}</td>
                                    <td className="stock-critico">{p.stock} un.</td>
                                    <td>
                                        <span className="badge badge-alerta">Reponer Stock</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="tabla-vacia">No hay productos en estado crítico.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default ProductosCriticos;