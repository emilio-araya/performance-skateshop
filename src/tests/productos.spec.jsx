import { it, expect, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getProductos } from '../services/mockStorage';

beforeEach(() => localStorage.clear());

it('shows the fase 1 board photo on the board product', () => {
    const tabla = getProductos().find((p) => p.id === 'tabla-maple-pro-825');

    expect(tabla.imagen).toBe('/img/tablas.jpg');
});

it('points every demo product at an image that exists in public/img', () => {
    const missing = getProductos()
        .map((p) => p.imagen)
        .filter((img) => !existsSync(resolve(process.cwd(), 'public', img.slice(1))));

    expect(missing).toEqual([]);
});
