import { createContext, useContext, useState } from 'react';
import { crearCuenta, validarCredenciales } from '../services/auth';

// --- POLYFILL LOCALSTORAGE PARA AMBIENTE DE TEST (NODE 22) ---
if (typeof globalThis !== 'undefined') {
    try {
        if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
            const store = new Map();
            Object.defineProperty(globalThis, 'localStorage', {
                value: {
                    getItem: (k) => store.get(String(k)) ?? null,
                    setItem: (k, v) => store.set(String(k), String(v)),
                    removeItem: (k) => store.delete(String(k)),
                    clear: () => store.clear(),
                    key: (i) => Array.from(store.keys())[i] ?? null,
                    get length() { return store.size; }
                },
                writable: true,
                configurable: true
            });
        }
    } catch (e) {}
}

const CLAVE_SESION = 'usuario_logueado';

const SesionContext = createContext(null);

const leerSesionGuardada = () => {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_SESION));
    } catch {
        localStorage.removeItem(CLAVE_SESION);
        return null;
    }
};

export const ProveedorSesion = ({ children }) => {
    const [usuario, setUsuario] = useState(leerSesionGuardada);

    const abrirSiOk = (resultado) => {
        if (resultado.ok) {
            localStorage.setItem(CLAVE_SESION, JSON.stringify(resultado.usuario));
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const iniciarSesion = (email, password) => abrirSiOk(validarCredenciales(email, password));
    const registrarse = (datos) => abrirSiOk(crearCuenta(datos));

    const cerrarSesion = () => {
        localStorage.removeItem(CLAVE_SESION);
        setUsuario(null);
    };

    return (
        <SesionContext.Provider value={{ usuario, iniciarSesion, registrarse, cerrarSesion }}>
            {children}
        </SesionContext.Provider>
    );
};

export const useSesion = () => {
    const contexto = useContext(SesionContext);
    if (!contexto) {
        throw new Error('useSesion must be used inside <ProveedorSesion>');
    }
    return contexto;
};