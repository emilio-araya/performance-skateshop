import { describe, it, expect, beforeEach } from 'vitest';
import { getProductos } from '../services/mockStorage';

const KEY = 'admin_productos';

describe('Product images', () => {
    beforeEach(() => localStorage.clear());

    it('gives every demo product its own image', () => {
        const imagenes = Object.fromEntries(getProductos().map(p => [p.id, p.imagen]));

        expect(imagenes).toEqual({
            'tabla-maple-pro-825': '/img/productos/tabla-maple-pro-825.jpg',
            'tabla-performance-81': '/img/productos/tabla-performance-81.jpg',
            'lija-premium-black': '/img/productos/lija-premium-black.jpg',
            'polera-oversize-street': '/img/productos/polera-oversize-street.jpg'
        });
    });

    it('replaces the old placeholder saved by a previous version', () => {
        localStorage.setItem(KEY, JSON.stringify([
            { id: 'tabla-maple-pro-825', nombre: 'Tabla Maple Pro 8.25', imagen: '/img/logo.jpeg', stock: 1 },
            { id: 'lija-premium-black', nombre: 'Lija Premium Black', imagen: '', stock: 7 }
        ]));

        const productos = getProductos();

        expect(productos.map(p => p.imagen)).toEqual([
            '/img/productos/tabla-maple-pro-825.jpg',
            '/img/productos/lija-premium-black.jpg'
        ]);
        expect(productos.map(p => p.stock)).toEqual([1, 7]);
        expect(JSON.parse(localStorage.getItem(KEY))[0].imagen).toBe('/img/productos/tabla-maple-pro-825.jpg');
    });

    it('replaces the images saved by the previous published version', () => {
        localStorage.setItem(KEY, JSON.stringify([
            { id: 'tabla-maple-pro-825', nombre: 'Tabla Maple Pro 8.25', imagen: '/img/tablas.jpg' },
            { id: 'lija-premium-black', nombre: 'Lija Premium Black', imagen: '/img/lija.jpg' },
            { id: 'polera-oversize-street', nombre: 'Polera Oversize "Street"', imagen: '/img/polera.jpg' }
        ]));

        expect(getProductos().map(p => p.imagen)).toEqual([
            '/img/productos/tabla-maple-pro-825.jpg',
            '/img/productos/lija-premium-black.jpg',
            '/img/productos/polera-oversize-street.jpg'
        ]);
    });

    it('keeps an image chosen by the admin', () => {
        localStorage.setItem(KEY, JSON.stringify([
            { id: 'tabla-maple-pro-825', nombre: 'Tabla Maple Pro 8.25', imagen: '/img/mi-tabla.png' },
            { id: 'producto-nuevo', nombre: 'Producto nuevo', imagen: '/img/logo.jpeg' }
        ]));

        expect(getProductos().map(p => p.imagen)).toEqual(['/img/mi-tabla.png', '/img/logo.jpeg']);
    });
});
