// Base API configuration
export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api/v1';

const CLAVE_TOKEN = 'auth_token';
const CLAVE_SESION = 'usuario_logueado';

export const getToken = () => {
    try {
        return localStorage.getItem(CLAVE_TOKEN) || null;
    } catch {
        return null;
    }
};

export const setToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(CLAVE_TOKEN, token);
        } else {
            localStorage.removeItem(CLAVE_TOKEN);
        }
    } catch {}
};

export const removeToken = () => {
    try {
        localStorage.removeItem(CLAVE_TOKEN);
    } catch {}
};

export const getUsuario = () => {
    try {
        const raw = localStorage.getItem(CLAVE_SESION);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setUsuario = (usuario) => {
    try {
        if (usuario) {
            localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
        } else {
            localStorage.removeItem(CLAVE_SESION);
        }
    } catch {}
};

export const removeUsuario = () => {
    try {
        localStorage.removeItem(CLAVE_SESION);
    } catch {}
};

export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
    if (token && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers
    });

    if (!res.ok) {
        let errorData = null;
        try {
            errorData = await res.json();
        } catch {
            try {
                errorData = { error: await res.text() };
            } catch {
                errorData = { error: res.statusText };
            }
        }
        const errorMsg = errorData?.error || errorData?.mensaje || errorData?.message || `HTTP ${res.status}`;
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = errorData;
        throw err;
    }

    if (res.status === 204) {
        return null;
    }

    return res.json();
}

// --- AUTENTICACIÓN ---
export const login = async (email, password) => {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
};

export const register = async ({ run, nombre, apellidos, email, password }) => {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, apellidos, email, password })
    });
};

// --- PRODUCTOS ---
export const getProductos = async () => {
    return apiFetch('/productos');
};

export const getProductoPorId = async (id) => {
    return apiFetch(`/productos/${id}`);
};

export const getProductosPorCategoria = async (cat) => {
    return apiFetch(`/productos/categoria/${encodeURIComponent(cat)}`);
};

export const getProductosOfertas = async () => {
    return apiFetch('/productos/ofertas');
};

export const getProductosCriticos = async (limite = 5) => {
    return apiFetch(`/productos/stock-critico?limite=${limite}`);
};

export const crearProducto = async (producto) => {
    return apiFetch('/productos', {
        method: 'POST',
        body: JSON.stringify(producto)
    });
};

export const actualizarProducto = async (id, producto) => {
    return apiFetch(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(producto)
    });
};

export const eliminarProducto = async (id) => {
    return apiFetch(`/productos/${id}`, {
        method: 'DELETE'
    });
};

export const reponerStock = async (id, cantidad = 1) => {
    return apiFetch(`/productos/${id}/reponer-stock?cantidad=${cantidad}`, {
        method: 'PATCH'
    });
};

// --- CATEGORÍAS ---
export const getCategorias = async () => {
    return apiFetch('/categorias');
};

export const crearCategoria = async (nombre) => {
    return apiFetch('/categorias', {
        method: 'POST',
        body: JSON.stringify(typeof nombre === 'string' ? { nombre } : nombre)
    });
};

export const actualizarCategoria = async (id, nombre) => {
    return apiFetch(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(typeof nombre === 'string' ? { nombre } : nombre)
    });
};

export const eliminarCategoria = async (id) => {
    return apiFetch(`/categorias/${id}`, {
        method: 'DELETE'
    });
};

// --- BOLETAS / COMPRAS ---
export const crearBoleta = async (boletaDto) => {
    return apiFetch('/boletas', {
        method: 'POST',
        body: JSON.stringify(boletaDto)
    });
};

export const getBoletas = async () => {
    return apiFetch('/boletas');
};

export const getMisBoletas = async () => {
    return apiFetch('/boletas/mias');
};

// --- USUARIOS ---
export const getUsuarios = async () => {
    return apiFetch('/usuarios');
};

export const crearUsuario = async (usuario) => {
    return apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify(usuario)
    });
};

export const actualizarUsuario = async (id, usuario) => {
    return apiFetch(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(usuario)
    });
};

export const eliminarUsuario = async (id) => {
    return apiFetch(`/usuarios/${id}`, {
        method: 'DELETE'
    });
};
