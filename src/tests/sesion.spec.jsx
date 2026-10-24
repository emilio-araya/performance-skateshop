import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

const SESION_GUARDADA = { nombre: 'Ana', apellidos: 'Pérez', email: 'ana@correo.cl', rol: 'Cliente' };

const renderEn = (ruta) => {
    window.history.pushState({}, '', ruta);
    return render(<App />);
};

describe('Shared session (ProveedorSesion)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('updates the Navbar right after logging in, without reloading', () => {
        localStorage.setItem('usuarios_registrados', JSON.stringify([
            { run: '123456789', nombre: 'Ana', apellidos: 'Pérez', email: 'ana@correo.cl', password: 'secreto1', rol: 'Cliente' }
        ]));
        renderEn('/login');

        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'ana@correo.cl' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

        expect(window.location.pathname).toBe('/');
        expect(screen.getByRole('button', { name: /Ana/ })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Iniciar Sesión' })).toBeNull();
    });

    const ingresar = (email, password) => {
        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: email } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
        fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    };

    it('logs the demo admin in and sends it to /admin, even if other users were already saved', () => {
        localStorage.setItem('usuarios_registrados', JSON.stringify([
            { nombre: 'Viejo', apellidos: 'Usuario', email: 'viejo@correo.cl', rol: 'Cliente' }
        ]));
        renderEn('/login');

        ingresar(' Admin@Performance.cl ', 'admin123');

        expect(window.location.pathname).toBe('/admin');
        const sesion = JSON.parse(localStorage.getItem('usuario_logueado'));
        expect(sesion).toMatchObject({ email: 'admin@performance.cl', rol: 'Administrador' });
        expect(sesion.password).toBeUndefined();
    });

    it('lists the demo admin as a regular stored user (Staff)', async () => {
        const { getUsuarios } = await import('../services/mockStorage');
        expect(getUsuarios()).toEqual(expect.arrayContaining([
            expect.objectContaining({ email: 'admin@performance.cl', rol: 'Administrador', nombre: 'Administrador', apellidos: 'Performance' })
        ]));
    });

    it('rejects a wrong password with an error and opens no session', () => {
        renderEn('/login');

        ingresar('admin@performance.cl', 'incorrecta');

        expect(screen.getByRole('alert').textContent).toMatch(/Credenciales incorrectas/);
        expect(localStorage.getItem('usuario_logueado')).toBeNull();
    });

    it('does not allow registering an e-mail that already exists (including the admin)', () => {
        renderEn('/login');
        fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));
        const llenar = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
        llenar('RUN (Sin puntos ni guión)', '123456789');
        llenar('Nombre', 'Falso');
        llenar('Apellidos', 'Admin');
        llenar('Correo Electrónico', 'admin@performance.cl');
        llenar('Contraseña', 'secreto1');

        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

        expect(screen.getByRole('alert').textContent).toMatch(/ya se encuentra registrado/);
        expect(localStorage.getItem('usuario_logueado')).toBeNull();
    });

    it('does not offer a Google / Gmail sign-in option', () => {
        renderEn('/login');

        expect(screen.queryByRole('button', { name: /google|gmail/i })).toBeNull();
        expect(screen.queryByText(/gmail/i)).toBeNull();
    });

    it('sin sesión, ir a /admin redirige a /login y recuerda el origen', () => {
        renderEn('/admin');

        expect(window.location.pathname).toBe('/login');
        const estado = JSON.parse(localStorage.getItem('usuario_logueado'));
        expect(estado).toBeNull();
    });

    it('cliente logueado no puede entrar a /admin y vuelve a la tienda', () => {
        localStorage.setItem('usuarios_registrados', JSON.stringify([
            { run: '123456789', nombre: 'Ana', apellidos: 'Pérez', email: 'ana@correo.cl', password: 'secreto1', rol: 'Cliente' }
        ]));
        localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Ana', apellidos: 'Pérez', email: 'ana@correo.cl', rol: 'Cliente' }));
        renderEn('/admin');

        expect(window.location.pathname).toBe('/');
        expect(screen.getByRole('button', { name: /Ana/ })).toBeTruthy();
    });

    it('administrador logueado puede entrar a /admin', () => {
        localStorage.setItem('usuarios_registrados', JSON.stringify([
            { run: '', nombre: 'Administrador', apellidos: 'Performance', email: 'admin@performance.cl', password: 'admin123', rol: 'Administrador' }
        ]));
        localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Administrador', apellidos: 'Performance', email: 'admin@performance.cl', rol: 'Administrador' }));
        renderEn('/admin');

        expect(window.location.pathname).toBe('/admin');
        expect(screen.getByText('Dashboard Principal')).toBeTruthy();
    });

    it('logging out from the Navbar clears the session and shows the login link again', () => {
        localStorage.setItem('usuario_logueado', JSON.stringify(SESION_GUARDADA));
        renderEn('/');

        fireEvent.click(screen.getByRole('button', { name: /Ana/ }));
        fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));

        expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeTruthy();
        expect(localStorage.getItem('usuario_logueado')).toBeNull();
    });

    it('restores a saved session on load and pre-fills the Checkout form', () => {
        localStorage.setItem('usuario_logueado', JSON.stringify(SESION_GUARDADA));
        localStorage.setItem('carrito', JSON.stringify([
            { id: 'p1', nombre: 'Tabla', precio: 1000, imagen: '', cantidad: 1 }
        ]));
        renderEn('/checkout');

        expect(screen.getByRole('button', { name: /Ana/ })).toBeTruthy();
        expect(screen.getByDisplayValue('Ana')).toBeTruthy();
        expect(screen.getByDisplayValue('Pérez')).toBeTruthy();
        expect(screen.getByDisplayValue('ana@correo.cl')).toBeTruthy();
    });

    it('never stores the password in the session', () => {
        renderEn('/login');
        fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));
        const llenar = (label, valor) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });
        llenar('RUN (Sin puntos ni guión)', '123456789');
        llenar('Nombre', 'Ana');
        llenar('Apellidos', 'Pérez');
        llenar('Correo Electrónico', 'ana@correo.cl');
        llenar('Contraseña', 'secreto1');

        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));

        const sesion = JSON.parse(localStorage.getItem('usuario_logueado'));
        expect(sesion).toMatchObject({ email: 'ana@correo.cl', rol: 'Cliente' });
        expect(sesion.password).toBeUndefined();
        expect(screen.getByRole('button', { name: /Ana/ })).toBeTruthy();
    });
});
