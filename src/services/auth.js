import { getUsuarios, guardarUsuario } from './mockStorage';

// Pure credential checks: they validate and return the user, but never open
// the session. Only ProveedorSesion calls them and persists the result.

export const normalizarEmail = (email = '') => email.trim().toLowerCase();

const buscarPorEmail = (email) =>
    getUsuarios().find(u => normalizarEmail(u.email) === email);

// The user handed to the UI never carries the password.
const sinPassword = ({ password: _password, ...usuario }) => usuario;

export const validarCredenciales = (email, password) => {
    const usuario = buscarPorEmail(normalizarEmail(email));
    // Accounts without a stored password can never log in.
    if (usuario?.password && usuario.password === password) {
        return { ok: true, usuario: sinPassword(usuario) };
    }
    return {
        ok: false,
        error: 'Credenciales incorrectas o usuario no registrado. Crea una cuenta para ingresar.'
    };
};

export const crearCuenta = ({ run, nombre, apellidos, email, password }) => {
    const emailLimpio = normalizarEmail(email);
    if (buscarPorEmail(emailLimpio)) {
        return { ok: false, error: 'Este correo electrónico ya se encuentra registrado. Inicia sesión.' };
    }

    const nuevoUsuario = {
        run: run.trim(),
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: emailLimpio,
        password,
        rol: 'Cliente'
    };
    guardarUsuario(nuevoUsuario);
    return { ok: true, usuario: sinPassword(nuevoUsuario) };
};
