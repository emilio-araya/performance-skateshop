const IMAGEN_RESPALDO = '/img/sin-imagen.svg';

// Product image that falls back to a neutral placeholder when the file is
// missing, instead of letting the browser render the alt text in its place.
const ImagenProducto = ({ src, alt, ...props }) => {
    const usarRespaldo = (e) => {
        // Guard against an endless error loop if the fallback is missing too.
        if (!e.currentTarget.src.endsWith(IMAGEN_RESPALDO)) {
            e.currentTarget.src = IMAGEN_RESPALDO;
        }
    };

    return <img src={src || IMAGEN_RESPALDO} alt={alt} onError={usarRespaldo} {...props} />;
};

export default ImagenProducto;
