import { it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorSesion } from '../context/Contexto_sesion';
import { ProveedorCarrito } from '../context/Contexto_carrito';
import Checkout from '../Pages/Store/Checkout';

const mockFetch = vi.spyOn(globalThis, 'fetch');

const renderCheckout = () => render(
    <ProveedorSesion>
        <ProveedorCarrito>
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        </ProveedorCarrito>
    </ProveedorSesion>
);

const mockProductos = (productos = [{ id: 1, nombre: 'Tabla', precio: 1000, stock: 10, imagen: '', categoria: 'Tablas', oferta: false }]) => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => productos
    });
};

const mockBoletaCreada = (respuesta = {
    numeroBoleta: 'BOL-0001',
    fecha: '20/11/2026',
    clienteNombre: 'Ana Pérez',
    clienteEmail: 'ana@correo.cl',
    direccionEnvio: 'Av. Siempre Viva 123, Maipú, Región Metropolitana de Santiago',
    total: 1000,
    estado: 'PAGADO'
}) => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => respuesta
    });
};

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('carrito', JSON.stringify([
        { id: 1, nombre: 'Tabla', precio: 1000, imagen: '', cantidad: 1 }
    ]));
    mockFetch.mockReset();
});

it('lets the customer type the comuna and sends the order to the API', async () => {
    mockProductos();
    mockBoletaCreada();

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Av. Siempre Viva 123' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Maipú' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    ));

    const llamadasPost = mockFetch.mock.calls.filter(([url]) => String(url).includes('/api/v1/boletas'));
    expect(llamadasPost.length).toBe(1);
    const cuerpo = JSON.stringify(JSON.parse(llamadasPost[0][1].body));
    expect(cuerpo).toContain('Maipú');
    expect(cuerpo).not.toContain('Cerrillos');
});

it('does not allow purchase with empty name', async () => {
    mockProductos();

    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    ));
});

it('does not allow purchase with empty street', async () => {
    mockProductos();

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    ));
});

it('does not allow purchase with empty comuna', async () => {
    mockProductos();

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    ));
});

it('sends the cart items to the API on successful purchase', async () => {
    mockProductos();
    mockBoletaCreada();

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    ));

    const llamadasPost = mockFetch.mock.calls.filter(([url]) => String(url).includes('/api/v1/boletas'));
    const cuerpo = JSON.parse(llamadasPost[0][1].body);
    expect(cuerpo.items).toHaveLength(1);
    expect(cuerpo.items[0]).toMatchObject({ productoId: 1, cantidad: 1 });
});

it('shows error when stock is insufficient', async () => {
    mockProductos([{ id: 1, nombre: 'Tabla', precio: 1000, stock: 0, imagen: '', categoria: 'Tablas', oferta: false }]);

    renderCheckout();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Calle y Número'), { target: { value: 'Calle 1' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simular Pago Exitoso' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Stock insuficiente/));
    expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/boletas'),
        expect.objectContaining({ method: 'POST' })
    );
});
