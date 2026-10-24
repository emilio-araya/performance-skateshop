import { it, expect, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getProductos } from '../services/mockStorage';

beforeEach(() => localStorage.clear());

it('gives every demo product its own photo instead of the logo', () => {
    const imagenPorId = Object.fromEntries(getProductos().map((p) => [p.id, p.imagen]));

    expect(imagenPorId).toEqual({
        'tabla-maple-pro-825': '/img/tablas.jpg',
        'lija-premium-black': '/img/lija.jpg',
        'polera-oversize-street': '/img/polera.jpg'
    });
});

it('updates the placeholder image saved by an earlier visit and keeps its stock', () => {
    localStorage.setItem('admin_productos', JSON.stringify([
        { id: 'tabla-maple-pro-825', nombre: 'Tabla Maple Pro 8.25', categoria: 'Tablas', precio: 45000, stock: 1, imagen: '/img/logo.jpeg', oferta: false },
        { id: 'lija-premium-black', nombre: 'Lija Premium Black', categoria: 'Hardwares', precio: 8900, stock: 12, imagen: 'https://example.com/lija.jpg', oferta: true },
        { id: 'creado-en-admin', nombre: 'Trucks', categoria: 'Hardwares', precio: 30000, stock: 4, imagen: '/img/logo.jpeg', oferta: false }
    ]));

    const productos = getProductos();
    const tabla = productos.find((p) => p.id === 'tabla-maple-pro-825');

    expect(tabla.imagen).toBe('/img/tablas.jpg');
    expect(tabla.stock).toBe(1);
    expect(productos.find((p) => p.id === 'lija-premium-black').imagen).toBe('https://example.com/lija.jpg');
    expect(productos.find((p) => p.id === 'creado-en-admin').imagen).toBe('/img/logo.jpeg');
    expect(JSON.parse(localStorage.getItem('admin_productos'))[0].imagen).toBe('/img/tablas.jpg');
});

it('points every demo product at an image that exists in public/img', () => {
    const missing = getProductos()
        .map((p) => p.imagen)
        .filter((img) => !existsSync(resolve(process.cwd(), 'public', img.slice(1))));

    expect(missing).toEqual([]);
});
