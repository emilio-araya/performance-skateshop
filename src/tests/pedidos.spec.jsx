import { describe, it, expect, beforeEach } from 'vitest';
import { confirmarPedido, getPedidos, getProductos, guardarProducto } from '../services/mockStorage';

const cliente = {
    nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@correo.cl',
    calle: 'Calle 1', comuna: 'Maipú', region: 'Región Metropolitana de Santiago'
};

const item = (cantidad) => ({ id: 'tabla', nombre: 'Tabla', precio: 1000, cantidad });

const stockDeTabla = () => getProductos().find((p) => p.id === 'tabla').stock;

describe('confirmarPedido', () => {
    beforeEach(() => {
        localStorage.clear();
        guardarProducto({ id: 'tabla', nombre: 'Tabla', categoria: 'Tablas', precio: 1000, stock: 2, imagen: '', oferta: false });
    });

    it('rejects a paid order without enough stock and writes nothing', () => {
        const resultado = confirmarPedido({ cliente, items: [item(3)], total: 3000, exitoso: true });

        expect(resultado).toEqual({ error: 'No hay stock suficiente de Tabla (quedan 2).' });
        expect(getPedidos()).toEqual([]);
        expect(stockDeTabla()).toBe(2);
        expect(localStorage.getItem('contador_pedidos')).toBeNull();
    });

    it('saves an approved order, discounts stock and numbers orders in sequence', () => {
        const { pedido } = confirmarPedido({ cliente, items: [item(1)], total: 1000, exitoso: true });
        const { pedido: segundo } = confirmarPedido({ cliente, items: [item(1)], total: 1000, exitoso: true });

        expect(pedido).toMatchObject({
            id: 'pedido-1',
            cliente: 'Ana Pérez',
            correo: 'ana@correo.cl',
            direccion: 'Calle 1, Maipú, Región Metropolitana de Santiago',
            resumenItems: '1x Tabla',
            total: 1000,
            estado: 'Aprobado'
        });
        expect(segundo.id).toBe('pedido-2');
        expect(stockDeTabla()).toBe(0);
        expect(getPedidos().map((p) => p.id)).toEqual(['pedido-2', 'pedido-1']);
    });

    it('records a rejected payment without touching stock, even if stock is short', () => {
        const { pedido } = confirmarPedido({ cliente, items: [item(3)], total: 3000, exitoso: false });

        expect(pedido.estado).toBe('Rechazado');
        expect(getPedidos()).toHaveLength(1);
        expect(stockDeTabla()).toBe(2);
    });
});
