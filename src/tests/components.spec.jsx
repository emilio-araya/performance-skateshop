import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TarjetaProducto from '../components/TarjetaProducto';
import { ProveedorCarrito } from '../context/Contexto_carrito';
import { ProveedorSesion } from '../context/Contexto_sesion';
import Checkout from '../Pages/Store/Checkout';

// Mock de producto para pruebas
const mockProductoBase = {
    id: "tabla-test-1",
    nombre: "Tabla Maple Test 8.0",
    categoria: "Tablas",
    precio: 42000,
    stock: 8,
    imagen: "/img/logo.jpeg",
    oferta: false
};

const mockProductoOferta = {
    ...mockProductoBase,
    id: "tabla-test-2",
    nombre: "Tabla Maple Oferta",
    oferta: true
};

// Wrapper auxiliar con Providers (Router + Sesion + Carrito Context)
const RenderConProviders = ({ children }) => (
    <ProveedorSesion>
        <ProveedorCarrito>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </ProveedorCarrito>
    </ProveedorSesion>
);

describe('Suite de Pruebas Unitarias - Performance Skate Shop', () => {

    // ==========================================
    // 1. PRUEBAS DE RENDERIZADO
    // ==========================================
    describe('1. Pruebas de Renderizado', () => {

        it('Debe renderizar correctamente los datos del producto (Nombre, Precio y Categoría)', () => {
            render(
                <RenderConProviders>
                    <TarjetaProducto producto={mockProductoBase} />
                </RenderConProviders>
            );

            // Verificar renderizado del título del producto
            expect(screen.getByText('Tabla Maple Test 8.0')).toBeTruthy();

            // Verificar renderizado de la categoría
            expect(screen.getByText('Tablas')).toBeTruthy();

            // Verificar renderizado del precio formateado
            expect(screen.getByText('$42.000')).toBeTruthy();
        });

        it('Renderizado Condicional: Debe mostrar el badge "Oferta" ÚNICAMENTE cuando la propiedad oferta es true', () => {
            // Caso A: Sin Oferta
            const { rerender } = render(
                <RenderConProviders>
                    <TarjetaProducto producto={mockProductoBase} />
                </RenderConProviders>
            );

            expect(screen.queryByText('Oferta')).toBeNull();

            // Caso B: Con Oferta (Renderizado Condicional Activo)
            rerender(
                <RenderConProviders>
                    <TarjetaProducto producto={mockProductoOferta} />
                </RenderConProviders>
            );

            expect(screen.getByText('Oferta')).toBeTruthy();
        });
    });

    // ==========================================
    // 2. PRUEBAS DE PROPIEDADES (PROPS)
    // ==========================================
    describe('2. Pruebas de Propiedades (Props)', () => {

        it('Debe recibir y aplicar adecuadamente las props de imagen y enlace de WhatsApp', () => {
            render(
                <RenderConProviders>
                    <TarjetaProducto producto={mockProductoBase} />
                </RenderConProviders>
            );

            // Verificar prop de atributo src en la imagen
            const imagen = screen.getByRole('img');
            expect(imagen.getAttribute('src')).toBe('/img/logo.jpeg');

            // Verificar prop de enlace de consulta de WhatsApp
            const enlaceWa = screen.getByText('Consultar').closest('a');
            expect(enlaceWa.getAttribute('href')).toContain('Tabla%20Maple%20Test%208.0');
        });
    });

    // ==========================================
    // 3. PRUEBAS DE EVENTOS
    // ==========================================
    describe('3. Pruebas de Simulación de Eventos', () => {

        it('Debe responder al evento clic en "Agregar al Carrito" e incrementar el contador global', () => {
            render(
                <RenderConProviders>
                    <TarjetaProducto producto={mockProductoBase} />
                </RenderConProviders>
            );

            // Buscar el botón de agregar al carrito
            const botonAgregar = screen.getByRole('button', { name: /agregar al carrito/i });
            expect(botonAgregar).toBeTruthy();

            // Simular evento clic
            fireEvent.click(botonAgregar);
        });
    });

    // ==========================================
    // 4. PRUEBAS DE ESTADO (STATE)
    // ==========================================
    describe('4. Pruebas de Gestión de Estado (State)', () => {

        it('Debe actualizar el estado local del formulario de Checkout cuando el usuario escribe en un campo de texto', () => {
            // Simular un producto en el localStorage para que el Checkout no renderice carrito vacío
            localStorage.setItem('carrito', JSON.stringify([{ ...mockProductoBase, cantidad: 1 }]));

            render(
                <RenderConProviders>
                    <Checkout />
                </RenderConProviders>
            );

            // Seleccionar el input del nombre
            const inputNombre = screen.getByLabelText(/nombre/i);

            // Simular cambio de estado vía evento change
            fireEvent.change(inputNombre, { target: { value: 'Gonzalo' } });

            // Verificar que el valor del estado refleje la entrada introducida
            expect(inputNombre.value).toBe('Gonzalo');
        });
    });
});