import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorCarrito } from '../context/Contexto_carrito';
import TarjetaProducto from '../components/TarjetaProducto';

it('product card shows the placeholder image instead of the alt text when the image is missing', () => {
    render(
        <ProveedorCarrito>
            <MemoryRouter>
                <TarjetaProducto producto={{
                    id: 'lija-premium-black', nombre: 'Lija Premium Black', categoria: 'Hardwares',
                    precio: 8900, stock: 12, imagen: '/img/logo.jpeg', oferta: true
                }} />
            </MemoryRouter>
        </ProveedorCarrito>
    );
    const imagen = screen.getByRole('img', { name: 'Lija Premium Black' });

    fireEvent.error(imagen);

    expect(imagen.getAttribute('src')).toBe('/img/sin-imagen.svg');
    expect(imagen.className).toBe('product-img');
});
