import React, { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const ProveedorCarrito = ({ children }) => {
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem('carrito');
        return guardado ? JSON.parse(guardado) : [];
    });

    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const disminuirCantidad = (id) => {
        setCarrito(prev =>
            prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item)
                .filter(item => item.cantidad > 0)
        );
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(prev => prev.filter(item => item.id !== id));
    };

    const vaciarCarrito = () => {
        setCarrito([]);
    };

    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const totalPagar = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    return (
        <CarritoContext.Provider value={{
            carrito,
            agregarAlCarrito,
            disminuirCantidad,
            eliminarDelCarrito,
            vaciarCarrito,
            totalProductos,
            totalPagar
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => useContext(CarritoContext);