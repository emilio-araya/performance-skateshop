import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSesion } from '../../context/Contexto_sesion';
import Campo from '../../components/Campo';

const LOGIN_INICIAL = { email: '', password: '' };
const REGISTRO_INICIAL = { run: '', nombre: '', apellidos: '', email: '', password: '' };

const CAMPOS_LOGIN = [
    { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'ejemplo@correo.cl', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' }
];

const CAMPOS_REGISTRO = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Tu nombre', autoComplete: 'given-name' },
    { name: 'apellidos', label: 'Apellidos', placeholder: 'Tus apellidos', autoComplete: 'family-name' },
    { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'ejemplo@correo.cl', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres', minLength: 6, autoComplete: 'new-password' }
];

const Formulario = ({ campos, valores, onChange, onSubmit, gap, textoBoton }) => (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {campos.map((campo) => (
            <Campo
                key={campo.name}
                {...campo}
                value={valores[campo.name] || ''}
                onChange={onChange}
            />
        ))}
        <button type="submit" className="btn-main w-100">{textoBoton}</button>
    </form>
);

const Login = () => {
    const navigate = useNavigate();
    const { iniciarSesion, registrarse } = useSesion();
    const [modo, setModo] = useState('login');
    const [error, setError] = useState('');
    const [loginForm, setLoginForm] = useState(LOGIN_INICIAL);
    const [regForm, setRegForm] = useState(REGISTRO_INICIAL);

    const cambiarModo = (nuevoModo) => {
        setModo(nuevoModo);
        setError('');
    };

    const irSegunRol = (usuario) => {
        navigate(usuario.rol === 'Administrador' ? '/admin' : '/');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        const { ok, usuario, error } = iniciarSesion(loginForm.email, loginForm.password);
        if (ok) {
            irSegunRol(usuario);
        } else {
            setError(error);
        }
    };

    const handleRegistro = (e) => {
        e.preventDefault();
        setError('');
        const { ok, usuario, error } = registrarse(regForm);
        if (!ok) {
            setError(error);
            return;
        }
        irSegunRol(usuario);
    };

    return (
        <main className="login-page">
            <div className="container login-container">
                <div className="form-container">
                    <div className="login-tabs">
                        <button
                            type="button"
                            className={`user-tab-btn ${modo === 'login' ? 'active' : ''}`}
                            onClick={() => cambiarModo('login')}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            className={`user-tab-btn ${modo === 'registro' ? 'active' : ''}`}
                            onClick={() => cambiarModo('registro')}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    {error && <div className="alert-box alert-error" role="alert">{error}</div>}

                    {modo === 'login' ? (
                        <Formulario
                            campos={CAMPOS_LOGIN}
                            valores={loginForm}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                            onSubmit={handleLogin}
                            gap="15px"
                            textoBoton="Ingresar"
                        />
                    ) : (
                        <Formulario
                            campos={CAMPOS_REGISTRO}
                            valores={regForm}
                            onChange={(e) => setRegForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                            onSubmit={handleRegistro}
                            gap="12px"
                            textoBoton="Registrarme"
                        />
                    )}
                </div>
            </div>
        </main>
    );
};

export default Login;