import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// --- POLYFILL LOCALSTORAGE PARA VITEST & JSDOM ---
if (typeof globalThis !== 'undefined') {
    if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function' || typeof globalThis.localStorage.getItem !== 'function') {
        const store = new Map();
        const mockLS = {
            getItem: (key) => store.get(String(key)) ?? null,
            setItem: (key, val) => store.set(String(key), String(val)),
            removeItem: (key) => store.delete(String(key)),
            clear: () => store.clear(),
            key: (i) => Array.from(store.keys())[i] ?? null,
            get length() { return store.size; }
        };
        Object.defineProperty(globalThis, 'localStorage', {
            value: mockLS,
            writable: true,
            configurable: true
        });
    }
}

// --- MOCK FETCH PARA API REST EN AMBIENTE DE TEST ---
const DEMO_USERS = [
    { id: 1, run: '111111111', nombre: 'Administrador', apellidos: 'Performance', email: 'admin@performance.cl', password: 'admin123', rol: 'ADMINISTRADOR' },
    { id: 2, run: '222222222', nombre: 'Vendedor', apellidos: 'Performance', email: 'vendedor@performance.cl', password: 'vendedor123', rol: 'VENDEDOR' },
    { id: 3, run: '333333333', nombre: 'Cliente', apellidos: 'Demo', email: 'cliente@correo.cl', password: 'cliente123', rol: 'CLIENTE' }
];

const DEMO_PRODUCTOS = [
    { id: 1, nombre: 'Tabla Maple Pro 8.25', categoria: { id: 1, nombre: 'Tablas' }, precio: 45000, stock: 3, imagen: '/img/productos/tabla-maple-pro-825.jpg', oferta: false },
    { id: 2, nombre: 'Tabla Performance 8.1', categoria: { id: 1, nombre: 'Tablas' }, precio: 34990, stock: 3, imagen: '/img/productos/tabla-performance-81.jpg', oferta: false },
    { id: 3, nombre: 'Lija Premium Black', categoria: { id: 2, nombre: 'Accesorios' }, precio: 8900, stock: 11, imagen: '/img/productos/lija-premium-black.jpg', oferta: true },
    { id: 4, nombre: 'Polera Oversize "Street"', categoria: { id: 3, nombre: 'Poleras y Polerones' }, precio: 22000, stock: 2, imagen: '/img/productos/polera-oversize-street.jpg', oferta: false }
];

const DEMO_CATEGORIAS = [
    { id: 1, nombre: 'Tablas', descripcion: 'Decks de maple canadiense' },
    { id: 2, nombre: 'Accesorios', descripcion: 'Lijas, rodamientos, pernos y herramientas' },
    { id: 3, nombre: 'Poleras y Polerones', descripcion: 'Ropa urbana y streetwear' }
];

const mockResponse = (data, status = 200) => {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => data,
        text: async () => typeof data === 'string' ? data : JSON.stringify(data)
    });
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
    const urlStr = typeof input === 'string' ? input : input?.url || '';
    if (!urlStr.includes('/api/v1')) {
        return originalFetch ? originalFetch(input, init) : Promise.reject(new Error(`Unhandled fetch: ${urlStr}`));
    }

    const method = (init.method || 'GET').toUpperCase();
    let body = {};
    if (init.body) {
        try {
            body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        } catch {
            body = {};
        }
    }

    // Auth endpoints
    if (urlStr.includes('/auth/login') && method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        const pass = body.password;

        let user = DEMO_USERS.find(u => u.email === email && u.password === pass);
        if (!user) {
            try {
                const stored = JSON.parse(globalThis.localStorage.getItem('usuarios_registrados') || '[]');
                const found = stored.find(u => (u.email || '').trim().toLowerCase() === email && u.password === pass);
                if (found) {
                    const rol = found.rol === 'Administrador' ? 'ADMINISTRADOR' : (found.rol || 'CLIENTE');
                    user = { ...found, rol };
                }
            } catch {}
        }

        if (user) {
            const { password: _, ...usuarioSinPass } = user;
            return mockResponse({
                token: `mock-jwt-${user.email}`,
                usuario: usuarioSinPass
            }, 200);
        } else {
            return mockResponse({ error: 'Credenciales incorrectas o usuario no registrado. Crea una cuenta para ingresar.' }, 401);
        }
    }

    if (urlStr.includes('/auth/register') && method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        let existe = DEMO_USERS.some(u => u.email === email);
        if (!existe) {
            try {
                const stored = JSON.parse(globalThis.localStorage.getItem('usuarios_registrados') || '[]');
                existe = stored.some(u => (u.email || '').trim().toLowerCase() === email);
            } catch {}
        }
        if (existe) {
            return mockResponse({ error: 'Este correo electrónico ya se encuentra registrado. Inicia sesión.' }, 400);
        }
        const nuevo = {
            id: Date.now(),
            run: body.run || '',
            nombre: body.nombre || '',
            apellidos: body.apellidos || '',
            email,
            rol: 'CLIENTE'
        };
        return mockResponse({
            token: `mock-jwt-${email}`,
            usuario: nuevo
        }, 200);
    }

    // Productos
    if (urlStr.includes('/productos') && method === 'GET') {
        if (urlStr.includes('/ofertas')) {
            return mockResponse(DEMO_PRODUCTOS.filter(p => p.oferta), 200);
        }
        if (urlStr.includes('/criticos')) {
            return mockResponse(DEMO_PRODUCTOS.filter(p => p.stock <= 5), 200);
        }
        const matchId = urlStr.match(/\/productos\/(\d+)(?:\/|$)/);
        if (matchId) {
            const prod = DEMO_PRODUCTOS.find(p => p.id === Number(matchId[1]));
            return prod ? mockResponse(prod, 200) : mockResponse({ error: 'No encontrado' }, 404);
        }
        return mockResponse(DEMO_PRODUCTOS, 200);
    }

    if (urlStr.includes('/productos') && method === 'POST') {
        return mockResponse({ ...body, id: Date.now() }, 201);
    }

    if (urlStr.includes('/productos/') && (method === 'PUT' || method === 'DELETE')) {
        return method === 'DELETE' ? mockResponse(null, 204) : mockResponse(body, 200);
    }

    if (urlStr.includes('/reponer-stock') && method === 'PATCH') {
        return mockResponse({ ok: true }, 200);
    }

    // Categorías
    if (urlStr.includes('/categorias') && method === 'GET') {
        if (urlStr.match(/\/categorias\/\d+(?:\/|$)/)) {
            return mockResponse(DEMO_CATEGORIAS[0], 200);
        }
        return mockResponse(DEMO_CATEGORIAS, 200);
    }

    if (urlStr.includes('/categorias') && method === 'POST') {
        return mockResponse({ ...body, id: Date.now() }, 201);
    }

    if (urlStr.includes('/categorias/') && (method === 'PUT' || method === 'DELETE')) {
        return method === 'DELETE' ? mockResponse(null, 204) : mockResponse(body, 200);
    }

    // Boletas
    if (urlStr.includes('/boletas') && method === 'GET') {
        return mockResponse([], 200);
    }

    if (urlStr.includes('/boletas') && method === 'POST') {
        return mockResponse({ numeroBoleta: 'BOL-MOCK', fecha: new Date().toISOString(), total: 0, estado: 'PAGADO', detalles: [] }, 201);
    }

    // Usuarios
    if (urlStr.includes('/usuarios') && method === 'GET') {
        return mockResponse(DEMO_USERS, 200);
    }

    return mockResponse([], 200);
};

// Limpia el árbol del DOM después de cada prueba individual
afterEach(() => {
    cleanup();
});
