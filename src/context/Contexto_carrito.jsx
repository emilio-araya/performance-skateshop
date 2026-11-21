import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProductos } from '../services/api';

const CarritoContext = createContext();

export const ProveedorCarrito = ({ children }) => {
    // 1. Lectura segura desde localStorage (IDs normalizados a Number)
    const [carrito, setCarrito] = useState(() => {
        try {
            const guardado = localStorage.getItem('carrito');
            return guardado
                ? JSON.parse(guardado).map(item => ({ ...item, id: Number(item.id) }))
                : [];
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

    // 3. Agregar productos con validación de stock contra la API
    const agregarAlCarrito = async (producto, cantidadAgregar = 1) => {
        const productosBodega = await getProductos();
        const prodBodega = productosBodega.find(p => Number(p.id) === Number(producto.id));
        const stockDisponible = prodBodega ? Number(prodBodega.stock) : Number(producto.stock || 0);

        const itemExistente = carrito.find(item => item.id === producto.id);
        const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
        const nuevaCantidadTotal = cantidadActual + cantidadAgregar;

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
            return [...prev, { ...producto, id: Number(producto.id), cantidad: cantidadAgregar }];
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
            agregarAlCarrito: async () => false,
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
