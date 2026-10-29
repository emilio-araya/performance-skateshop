import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProductos } from '../services/mockStorage';

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

const CarritoContext = createContext();

export const ProveedorCarrito = ({ children }) => {
    // 1. Lectura segura desde localStorage
    const [carrito, setCarrito] = useState(() => {
        try {
            const guardado = localStorage.getItem('carrito');
            return guardado ? JSON.parse(guardado) : [];
        } catch (error) {
            console.error("Error al leer el carrito desde localStorage:", error);
            return [];
        }
    });

    // 2. Persistencia automática
    useEffect(() => {
        try {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        } catch (error) {
            console.error("Error al guardar el carrito en localStorage:", error);
        }
    }, [carrito]);

    // 3. Agregar productos con validación estricta de stock
    const agregarAlCarrito = (producto, cantidadAgregar = 1) => {
        const productosBodega = getProductos();
        const prodBodega = productosBodega.find(p => p.id === producto.id);
        const stockDisponible = prodBodega ? Number(prodBodega.stock) : Number(producto.stock || 0);

        const itemExistente = carrito.find(item => item.id === producto.id);
        const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
        const nuevaCantidadTotal = cantidadActual + cantidadAgregar;

        // Si la cantidad total supera el stock existente, se bloquea la acción
        if (nuevaCantidadTotal > stockDisponible) {
            alert(`Stock insuficiente para "${producto.nombre}". Solicitaste ${nuevaCantidadTotal} unidad(es), pero la cantidad límite disponible en bodega es ${stockDisponible} unidad(es).`);
            return false;
        }

        setCarrito(prev => {
            const existe = prev.find(item => item.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.id === producto.id 
                        ? { ...item, cantidad: nuevaCantidadTotal } 
                        : item
                );
            }
            return [...prev, { ...producto, cantidad: cantidadAgregar }];
        });
        return true;
    };

    // 4. Disminuir cantidad o remover si llega a 0
    const disminuirCantidad = (id) => {
        setCarrito(prev =>
            prev
                .map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
                .filter(item => item.cantidad > 0)
        );
    };

    // 5. Eliminar un producto específico
    const eliminarDelCarrito = (id) => {
        setCarrito(prev => prev.filter(item => item.id !== id));
    };

    // 6. Limpiar todo el carrito
    const vaciarCarrito = () => {
        setCarrito([]);
    };

    // 7. Cálculos dinámicos
    const totalProductos = carrito.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
    const totalPagar = carrito.reduce((sum, item) => sum + ((Number(item.precio) || 0) * (Number(item.cantidad) || 0)), 0);

    return (
        <CarritoContext.Provider value={{
            carrito,
            agregarAlCarrito,
            disminuirCantidad,
            eliminarDelCarrito,
            vaciarCarrito,
            totalProductos,
            totalPagar,
            // Aliases de compatibilidad para Navbar y Checkout
            cantidadTotal: totalProductos,
            precioTotal: totalPagar
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

// Hook personalizado con fallback de seguridad
export const useCarrito = () => {
    const contexto = useContext(CarritoContext);
    if (!contexto) {
        return {
            carrito: [],
            agregarAlCarrito: () => {},
            disminuirCantidad: () => {},
            eliminarDelCarrito: () => {},
            vaciarCarrito: () => {},
            totalProductos: 0,
            totalPagar: 0,
            cantidadTotal: 0,
            precioTotal: 0
        };
    }
    return contexto;
};

export default ProveedorCarrito;