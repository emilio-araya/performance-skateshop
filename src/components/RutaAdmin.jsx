import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '../context/Contexto_sesion';
import SidebarAdmin from './SidebarAdmin';

// Layout route for the admin panel: without a session it sends the user to
// /login; with a non-admin role it sends them back to the store. Admin pages
// render only their content; the sidebar and frame are declared here once.
const RutaAdmin = () => {
    const { usuario } = useSesion();
    const location = useLocation();

    if (!usuario) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (usuario.rol !== 'Administrador') {
        return <Navigate to="/" replace />;
    }
    return (
        <div className="admin-body">
            <SidebarAdmin />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default RutaAdmin;
