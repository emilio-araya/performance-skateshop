import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductosCriticos from '../Pages/Admin/Productos_criticos';

const renderCriticos = () => render(
    <MemoryRouter initialEntries={['/admin/productos/criticos']}>
        <ProductosCriticos />
    </MemoryRouter>
);

describe('Admin - Productos críticos', () => {
    beforeEach(() => localStorage.clear());

    it('lists only products with stock <= 5', () => {
        renderCriticos();
        const tabla = screen.getByRole('table');

        expect(within(tabla).getByText('Tabla Maple Pro 8.25')).toBeTruthy();
        expect(within(tabla).getByText('Polera Oversize "Street"')).toBeTruthy();
        expect(within(tabla).queryByText('Lija Premium Black')).toBeNull();
    });

    it('shows a placeholder image instead of the alt text when the image fails to load', () => {
        renderCriticos();
        const imagen = screen.getByRole('img', { name: 'Tabla Maple Pro 8.25' });

        fireEvent.error(imagen);

        expect(imagen.getAttribute('src')).toBe('/img/sin-imagen.svg');
    });

    it('marks only "Stock Crítico" as active in the sidebar', () => {
        renderCriticos();

        expect(screen.getByRole('link', { name: /Stock Crítico/ }).className).toContain('active');
        expect(screen.getByRole('link', { name: /^\s*Productos$/ }).className).not.toContain('active');
    });
});
