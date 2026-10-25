// Datos iniciales demo
const PRODUCTOS_DEMO = [
    {
        id: "tabla-maple-pro-825",
        nombre: "Tabla Maple Pro 8.25",
        categoria: "Tablas",
        precio: 45000,
        stock: 3,
        imagen: "/img/tablas.jpg",
        oferta: false
    },
    {
        id: "lija-premium-black",
        nombre: "Lija Premium Black",
        categoria: "Hardwares",
        precio: 8900,
        stock: 12,
        imagen: "/img/lija.jpg",
        oferta: true
    },
    {
        id: "polera-oversize-street",
        nombre: 'Polera Oversize "Street"',
        categoria: "Poleras y Polerones",
        precio: 22000,
        stock: 2,
        imagen: "/img/polera.jpg",
        oferta: false
    }
];

// Demo accounts always exist so the app can never be locked out, even when
// the browser already holds other users. Credentials are visible to anyone:
// a real application must keep them on a backend.
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
// Placeholder that earlier versions saved for every demo product.
const IMAGEN_PLACEHOLDER = "/img/logo.jpeg";

// Browsers that visited before a demo product got its real photo still hold
// the placeholder. Swap only that placeholder: stock, prices and any image
// set from the admin panel stay untouched.
const actualizarImagenesDemo = (productos) => {
    let cambio = false;
    const actualizados = productos.map((producto) => {
        const demo = PRODUCTOS_DEMO.find((d) => d.id === producto.id);
        if (demo && producto.imagen === IMAGEN_PLACEHOLDER && demo.imagen !== IMAGEN_PLACEHOLDER) {
            cambio = true;
            return { ...producto, imagen: demo.imagen };
        }
        return producto;
    });
    if (cambio) {
        localStorage.setItem("admin_productos", JSON.stringify(actualizados));
    }
    return actualizados;
};

export const getProductos = () => {
    const data = localStorage.getItem("admin_productos");
    if (!data) {
        localStorage.setItem("admin_productos", JSON.stringify(PRODUCTOS_DEMO));
        return [...PRODUCTOS_DEMO];
    }
    return actualizarImagenesDemo(JSON.parse(data));
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

export const getProductosCriticos = (umbral = 5) => {
    return getProductos().filter(p => Number(p.stock) <= umbral);
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

const siguienteIdPedido = () => {
    const contador = parseInt(localStorage.getItem("contador_pedidos") || "0", 10) + 1;
    localStorage.setItem("contador_pedidos", String(contador));
    return `pedido-${contador}`;
};

// Returns the first cart line the catalogue cannot cover, or undefined.
const buscarFaltaDeStock = (productos, items) =>
    items
        .map((item) => ({ item, producto: productos.find((p) => p.id === item.id) }))
        .find(({ item, producto }) => !producto || Number(producto.stock) < item.cantidad);

/**
 * Creates an order in one step. A paid order is checked against stock before
 * anything is written, so it either saves the order and discounts every line,
 * or returns an error and leaves storage untouched.
 * A rejected payment is recorded as is and never touches stock.
 */
export const confirmarPedido = ({ cliente, items, total, exitoso }) => {
    const productos = getProductos();

    if (exitoso) {
        const falta = buscarFaltaDeStock(productos, items);
        if (falta) {
            const quedan = falta.producto ? Number(falta.producto.stock) : 0;
            return { error: `No hay stock suficiente de ${falta.item.nombre} (quedan ${quedan}).` };
        }
    }

    const pedido = {
        id: siguienteIdPedido(),
        fecha: new Date().toLocaleDateString("es-CL"),
        cliente: `${cliente.nombre} ${cliente.apellidos}`,
        correo: cliente.correo,
        direccion: `${cliente.calle}, ${cliente.comuna}, ${cliente.region}`,
        resumenItems: items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", "),
        total,
        items,
        estado: exitoso ? "Aprobado" : "Rechazado"
    };

    if (exitoso) {
        const actualizados = productos.map((producto) => {
            const item = items.find((i) => i.id === producto.id);
            return item ? { ...producto, stock: Number(producto.stock) - item.cantidad } : producto;
        });
        localStorage.setItem("admin_productos", JSON.stringify(actualizados));
    }
    localStorage.setItem("historial_pedidos", JSON.stringify([pedido, ...getPedidos()]));

    return { pedido };
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