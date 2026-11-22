import { createContext, useContext, useState } from 'react';
import { crearCuenta, validarCredenciales } from '../services/auth';
import { getToken, setToken, removeToken, getUsuario, setUsuario as persistirUsuario, removeUsuario } from '../services/api';

const SesionContext = createContext(null);

export const ProveedorSesion = ({ children }) => {
    const [usuario, setUsuario] = useState(getUsuario);
    const [token, setEstadoToken] = useState(getToken);

    const abrirSiOk = (resultado) => {
        if (resultado.ok) {
            persistirUsuario(resultado.usuario);
            if (resultado.token) {
                setToken(resultado.token);
                setEstadoToken(resultado.token);
            }
            setUsuario(resultado.usuario);
        }
        return resultado;
    };

    const iniciarSesion = async (email, password) => {
        const resultado = await validarCredenciales(email, password);
        return abrirSiOk(resultado);
    };

    const registrarse = async (datos) => {
        const resultado = await crearCuenta(datos);
        return abrirSiOk(resultado);
    };

    const cerrarSesion = () => {
        removeToken();
        removeUsuario();
        setUsuario(null);
        setEstadoToken(null);
    };

    return (
        <SesionContext.Provider value={{ usuario, token, iniciarSesion, registrarse, cerrarSesion }}>
            {children}
        </SesionContext.Provider>
    );
};

export const useSesion = () => {
    const contexto = useContext(SesionContext);
    return contexto || {
        usuario: getUsuario(),
        token: getToken(),
        iniciarSesion: async () => ({ ok: false }),
        registrarse: async () => ({ ok: false }),
        cerrarSesion: () => {}
    };
};
