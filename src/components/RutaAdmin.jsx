import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '../context/Contexto_sesion';

// Layout route for the admin panel: without a session it sends the user to
// /login; with a non-admin role it sends them back to the store.
const RutaAdmin = () => {
    const { usuario } = useSesion();
    const location = useLocation();

    if (!usuario) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (usuario.rol !== 'Administrador') {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

export default RutaAdmin;
