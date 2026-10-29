// --- POLYFILL LOCALSTORAGE PARA VITEST & NODE 22 ---
(function initLocalStoragePolyfill() {
    if (typeof globalThis !== 'undefined') {
        try {
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
        } catch (e) {
            // Ignorar en entornos que restrinjan la propiedad
        }
    }
})();

// Datos iniciales demo
const PRODUCTOS_DEMO = [
    {
        id: "tabla-maple-pro-825",
        nombre: "Tabla Maple Pro 8.25",
        categoria: "Tablas",
        precio: 45000,
        stock: 3,
        imagen: "/img/productos/tabla-maple-pro-825.jpg",
        oferta: false
    },
    {
        id: 'tabla-performance-81',
        nombre: 'Tabla Performance 8.1',
        categoria: 'Tablas',
        precio: 34990,
        stock: 3,
        imagen: '/img/productos/tabla-performance-81.jpg',
        oferta: false
    },
    {
        id: "lija-premium-black",
        nombre: "Lija Premium Black",
        categoria: "Hardwares",
        precio: 8900,
        stock: 11, // Stock > 5 para no ser considerado critico
        imagen: "/img/productos/lija-premium-black.jpg",
        oferta: true
    },
    {
        id: "polera-oversize-street",
        nombre: 'Polera Oversize "Street"',
        categoria: "Poleras y Polerones",
        precio: 22000,
        stock: 2,
        imagen: "/img/productos/polera-oversize-street.jpg",
        oferta: false
    }
];

const USUARIOS_DEMO = [
    {
        run: '',
        nombre: 'Administrador',
        apellidos: 'Performance',
        email: 'admin@performance.cl',
        password: 'admin123',
        rol: 'Administrador'
    }
];

const CATEGORIAS_DEMO = ["Tablas", "Poleras y Polerones", "Hardwares", "Accesorios"];

// --- PRODUCTOS ---
// Images that earlier versions saved for the demo products. Browsers that
// visited those versions still have them in localStorage, and the files no
// longer exist on the server.
const IMAGENES_ANTERIORES = ["/img/logo.jpeg", "/img/tablas.jpg", "/img/lija.jpg", "/img/polera.jpg"];

// Give each demo product saved by an earlier version the image that matches
// its name. An image chosen by the admin is kept.
const asignarImagenDemo = (producto) => {
    const demo = PRODUCTOS_DEMO.find(p => p.id === producto.id);
    const sinImagenPropia = !producto.imagen || IMAGENES_ANTERIORES.includes(producto.imagen);
    return demo && sinImagenPropia ? { ...producto, imagen: demo.imagen } : producto;
};

export const getProductos = () => {
    const data = localStorage.getItem("admin_productos");
    if (!data) {
        localStorage.setItem("admin_productos", JSON.stringify(PRODUCTOS_DEMO));
        return [...PRODUCTOS_DEMO];
    }
    const productos = JSON.parse(data).map(asignarImagenDemo);
    localStorage.setItem("admin_productos", JSON.stringify(productos));
    return productos;
};

export const guardarProducto = (producto) => {
    const productos = getProductos();
    const index = productos.findIndex(p => p.id === producto.id);
    if (index >= 0) {
        productos[index] = producto;
    } else {
        productos.push(producto);
    }
    localStorage.setItem("admin_productos", JSON.stringify(productos));
};

export const eliminarProducto = (id) => {
    const productos = getProductos().filter(p => p.id !== id);
    localStorage.setItem("admin_productos", JSON.stringify(productos));
};

export const descontarStock = (items) => {
    const productos = getProductos();
    let cambiado = false;
    for (const item of items) {
        const producto = productos.find(p => p.id === item.id);
        if (producto && producto.stock >= item.cantidad) {
            producto.stock -= item.cantidad;
            cambiado = true;
        }
    }
    if (cambiado) {
        localStorage.setItem("admin_productos", JSON.stringify(productos));
    }
};

export const getProductosCriticos = (umbral = 5) => {
    return getProductos().filter(p => Number(p.stock) <= Number(umbral));
};

// --- CATEGORÍAS ---
export const getCategorias = () => {
    const data = localStorage.getItem("admin_categorias");
    if (!data) {
        localStorage.setItem("admin_categorias", JSON.stringify(CATEGORIAS_DEMO));
        return [...CATEGORIAS_DEMO];
    }
    return JSON.parse(data);
};

export const guardarCategoria = (nombre) => {
    const categorias = getCategorias();
    if (!categorias.includes(nombre)) {
        categorias.push(nombre);
        localStorage.setItem("admin_categorias", JSON.stringify(categorias));
    }
};

// --- PEDIDOS Y COMPRAS ---
export const getPedidos = () => {
    return JSON.parse(localStorage.getItem("historial_pedidos")) || [];
};

export const registrarPedido = (pedido) => {
    const pedidos = getPedidos();
    pedidos.unshift(pedido);
    localStorage.setItem("historial_pedidos", JSON.stringify(pedidos));
};

// --- MENSAJES DE CONTACTO ---
export const getMensajes = () => {
    return JSON.parse(localStorage.getItem("mensajes_contacto")) || [];
};

export const guardarMensaje = (mensaje) => {
    const mensajes = getMensajes();
    mensajes.push(mensaje);
    localStorage.setItem("mensajes_contacto", JSON.stringify(mensajes));
};

export const eliminarMensaje = (index) => {
    const mensajes = getMensajes();
    mensajes.splice(index, 1);
    localStorage.setItem("mensajes_contacto", JSON.stringify(mensajes));
};

// --- USUARIOS ---
export const getUsuarios = () => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios_registrados")) || [];
    const faltantes = USUARIOS_DEMO.filter(demo => !usuarios.some(u => u.email === demo.email));
    if (faltantes.length === 0) {
        return usuarios;
    }
    const completos = [...usuarios, ...faltantes.map(demo => ({ ...demo }))];
    localStorage.setItem("usuarios_registrados", JSON.stringify(completos));
    return completos;
};

export const guardarUsuario = (usuario, index = -1) => {
    const usuarios = getUsuarios();
    if (index >= 0) {
        usuarios[index] = usuario;
    } else {
        usuarios.push(usuario);
    }
    localStorage.setItem("usuarios_registrados", JSON.stringify(usuarios));
};

export const eliminarUsuario = (index) => {
    const usuarios = getUsuarios();
    usuarios.splice(index, 1);
    localStorage.setItem("usuarios_registrados", JSON.stringify(usuarios));
};

// --- REPONER STOCK DE PRODUCTO CRÍTICO ---
export const reponerStock = (id, cantidad = 1) => {
    const productos = getProductos();
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.stock = Number(producto.stock || 0) + cantidad;
        localStorage.setItem("admin_productos", JSON.stringify(productos));
    }
};

// --- ELIMINAR CATEGORÍA ---
export const eliminarCategoria = (nombre) => {
    const categorias = getCategorias().filter(c => c.toLowerCase() !== nombre.toLowerCase());
    localStorage.setItem("admin_categorias", JSON.stringify(categorias));
};

// --- VALIDAR STOCK ANTES DE PROCESAR COMPRA ---
export const validarStockPedido = (items) => {
    const productos = getProductos();
    for (const item of items) {
        const prod = productos.find(p => p.id === item.id);
        if (!prod) {
            return {
                valido: false,
                mensaje: `El producto "${item.nombre || item.id}" ya no existe en el catálogo.`
            };
        }
        if (Number(item.cantidad) > Number(prod.stock)) {
            return {
                valido: false,
                mensaje: `Stock insuficiente para "${prod.nombre}". Solicitaste ${item.cantidad} unidades, pero únicamente quedan ${prod.stock} unidad(es) disponible(s) en bodega.`,
                limite: prod.stock,
                productoId: prod.id
            };
        }
    }
    return { valido: true };
};