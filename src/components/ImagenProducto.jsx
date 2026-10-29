import React from 'react';

const IMAGEN_DEFAULT = "/img/sin-imagen.svg";

const ImagenProducto = ({ src, alt, className }) => {
    return (
        <img 
            src={src || IMAGEN_DEFAULT} 
            alt={alt || "Imagen de producto"} 
            className={className || "product-img"}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = IMAGEN_DEFAULT;
            }}
        />
    );
};

export default ImagenProducto;