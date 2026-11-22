import { login as apiLogin, register as apiRegister } from './api';

export const normalizarEmail = (email = '') => email.trim().toLowerCase();

export const validarCredenciales = async (email, password) => {
    try {
        const data = await apiLogin(normalizarEmail(email), password);
        return { ok: true, usuario: data.usuario, token: data.token };
    } catch (err) {
        return {
            ok: false,
            error: err.message || 'Credenciales incorrectas o usuario no registrado. Crea una cuenta para ingresar.'
        };
    }
};

export const crearCuenta = async ({ run, nombre, apellidos, email, password }) => {
    try {
        const data = await apiRegister({
            run: run ? run.trim() : '',
            nombre: nombre.trim(),
            apellidos: apellidos.trim(),
            email: normalizarEmail(email),
            password
        });
        return { ok: true, usuario: data.usuario, token: data.token };
    } catch (err) {
        return {
            ok: false,
            error: err.message || 'Este correo electrónico ya se encuentra registrado. Inicia sesión.'
        };
    }
};
