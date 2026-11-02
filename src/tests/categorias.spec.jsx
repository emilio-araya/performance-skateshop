import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getCategorias, getProductos } from '../services/mockStorage';
import Footer from '../components/Footer';

describe('Hardwares merged into Accesorios', () => {
    beforeEach(() => localStorage.clear());

    it('has no Hardwares category and keeps Accesorios', () => {
        expect(getCategorias()).toEqual(['Tablas', 'Poleras y Polerones', 'Accesorios']);
    });

    it('lists the lija under Accesorios', () => {
        const lija = getProductos().find(p => p.id === 'lija-premium-black');

        expect(lija.categoria).toBe('Accesorios');
    });

    it('moves categories and products saved by an earlier version', () => {
        localStorage.setItem('admin_categorias', JSON.stringify(['Tablas', 'Hardwares', 'Accesorios', 'Ruedas']));
        localStorage.setItem('admin_productos', JSON.stringify([
            { id: 'lija-premium-black', nombre: 'Lija Premium Black', categoria: 'Hardwares', stock: 4 },
            { id: 'trucks-x', nombre: 'Trucks X', categoria: 'Hardwares', stock: 2 },
            { id: 'rueda-52', nombre: 'Rueda 52', categoria: 'Ruedas', stock: 9 }
        ]));

        expect(getCategorias()).toEqual(['Tablas', 'Accesorios', 'Ruedas']);
        expect(getProductos().map(p => [p.id, p.categoria, p.stock])).toEqual([
            ['lija-premium-black', 'Accesorios', 4],
            ['trucks-x', 'Accesorios', 2],
            ['rueda-52', 'Ruedas', 9]
        ]);
        expect(JSON.parse(localStorage.getItem('admin_categorias'))).toEqual(['Tablas', 'Accesorios', 'Ruedas']);
    });

    it('adds Accesorios when an earlier version only had Hardwares', () => {
        localStorage.setItem('admin_categorias', JSON.stringify(['Tablas', 'Hardwares']));

        expect(getCategorias()).toEqual(['Tablas', 'Accesorios']);
    });

    it('shows Accesorios instead of Hardwares in the footer', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>);

        expect(screen.getByText('Accesorios')).toBeTruthy();
        expect(screen.queryByText('Hardwares')).toBeNull();
    });
});
