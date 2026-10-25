import { it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorSesion } from '../context/Contexto_sesion';
import { ProveedorCarrito } from '../context/Contexto_carrito';
import { getProductos, guardarProducto, getPedidos } from '../services/mockStorage';
import Checkout from '../Pages/Store/Checkout';

beforeEach(() => {
    localStorage.clear();
    // The cart line must exist in the catalogue: a paid order now checks stock.
    guardarProducto({ id: 'p1', nombre: 'Tabla', categoria: 'Tablas', precio: 1000, stock: 5, imagen: '', oferta: false });
    localStorage.setItem('carrito', JSON.stringify([
        { id: 'p1', nombre: 'Tabla', precio: 1000, imagen: '', cantidad: 1 }
    ]));
});

const renderCheckout = () => render(
    <ProveedorSesion>
        <ProveedorCarrito>
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        </ProveedorCarrito>
    </ProveedorSesion>
);

it('lets the customer type the comuna and saves it in the order address', () => {
    renderCheckout();
    const comuna = screen.getByLabelText('Comuna');
    expect(comuna.value).toBe('');

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Av. Siempre Viva 123' } });
    fireEvent.change(comuna, { target: { value: 'Maipú' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    const [pedido] = getPedidos();
    expect(pedido.direccion).toContain('Maipú');
    expect(pedido.direccion).not.toContain('Cerrillos');
});

it('does not allow purchase with empty name', () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    expect(getPedidos()).toEqual([]);
});

it('does not allow purchase with empty street', () => {
    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    expect(getPedidos()).toEqual([]);
});

it('does not allow purchase with empty comuna', () => {
    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Av. Siempre Viva 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    expect(getPedidos()).toEqual([]);
});

it('generates an order id with the expected format', async () => {
    const { getProductos, guardarProducto } = await import('../services/mockStorage');
    localStorage.clear();
    localStorage.removeItem('contador_pedidos');
    guardarProducto({ id: 'prod-1', nombre: 'Producto Test', categoria: 'Tablas', precio: 5000, stock: 10, imagen: '', oferta: false });

    localStorage.setItem('carrito', JSON.stringify([
        { id: 'prod-1', nombre: 'Producto Test', precio: 5000, imagen: '', cantidad: 1 }
    ]));

    renderCheckout();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    const id = getPedidos()[0].id;
    expect(id).toMatch(/^pedido-\d+$/);
});

it('discounts stock on successful purchase', async () => {
    const { getProductos, guardarProducto } = await import('../services/mockStorage');
    localStorage.clear();
    guardarProducto({ id: 'prod-stock', nombre: 'Producto Stock', categoria: 'Tablas', precio: 5000, stock: 10, imagen: '', oferta: false });

    localStorage.setItem('carrito', JSON.stringify([
        { id: 'prod-stock', nombre: 'Producto Stock', precio: 5000, imagen: '', cantidad: 3 }
    ]));

    renderCheckout();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    const productos = getProductos();
    const producto = productos.find(p => p.id === 'prod-stock');
    expect(producto.stock).toBe(7);
});

it('blocks a paid purchase when there is not enough stock and keeps the cart', () => {
    localStorage.clear();
    guardarProducto({ id: 'prod-corto', nombre: 'Producto Corto', categoria: 'Tablas', precio: 5000, stock: 2, imagen: '', oferta: false });
    localStorage.setItem('carrito', JSON.stringify([
        { id: 'prod-corto', nombre: 'Producto Corto', precio: 5000, imagen: '', cantidad: 3 }
    ]));
    const avisos = [];
    window.alert = (mensaje) => avisos.push(mensaje);

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    expect(avisos).toEqual(['No hay stock suficiente de Producto Corto (quedan 2).']);
    expect(getPedidos()).toEqual([]);
    expect(getProductos().find(p => p.id === 'prod-corto').stock).toBe(2);
    expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(1);
});

it('does not discount stock on failed purchase', async () => {
    const { getProductos, guardarProducto } = await import('../services/mockStorage');
    localStorage.clear();
    guardarProducto({ id: 'prod-stock-2', nombre: 'Producto Stock 2', categoria: 'Tablas', precio: 5000, stock: 10, imagen: '', oferta: false });

    localStorage.setItem('carrito', JSON.stringify([
        { id: 'prod-stock-2', nombre: 'Producto Stock 2', precio: 5000, imagen: '', cantidad: 3 }
    ]));

    renderCheckout();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago con Error' }));

    const productos = getProductos();
    const producto = productos.find(p => p.id === 'prod-stock-2');
    expect(producto.stock).toBe(10);
});
