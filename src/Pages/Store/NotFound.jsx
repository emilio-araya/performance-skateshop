import { Link } from 'react-router-dom';

const NotFound = () => (
    <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh', textAlign: 'center' }}>
        <div className="container">
            <h1>Página no encontrada</h1>
            <p>La dirección que buscas no existe.</p>
            <Link to="/" className="btn-main" style={{ marginTop: '20px', display: 'inline-block' }}>
                Volver a la tienda
            </Link>
        </div>
    </main>
);

export default NotFound;
