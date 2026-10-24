import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorCarrito } from './context/Contexto_carrito';
import { ProveedorSesion } from './context/Contexto_sesion';

// Layouts
import LayoutTienda from './components/LayoutTienda';
import RutaAdmin from './components/RutaAdmin';

// Páginas Tienda (Store)
import Inicio from './Pages/Store/Inicio';
import Categoria from './Pages/Store/Categoria';
import DetalleCategoria from './Pages/Store/Detalle_categoria';
import DetalleProducto from './Pages/Store/Detalle_producto';
import Ofertas from './Pages/Store/Ofertas';
import Blogs from './Pages/Store/Blogs';
import DetalleBlog from './Pages/Store/Detalle_blog';
import Checkout from './Pages/Store/Checkout';
import PagoCorrecto from './Pages/Store/Pago_correcto';
import PagoError from './Pages/Store/Pago_error';
import Login from './Pages/Store/Login';
import NotFound from './Pages/Store/NotFound';

// Páginas Administración (Admin)
import Dashboard from './Pages/Admin/Dashboard';
import ProductosAdmin from './Pages/Admin/Productos';
import ProductosCriticos from './Pages/Admin/Productos_criticos';
import DetalleProductosAdmin from './Pages/Admin/Detalle_productos';
import GestionCategorias from './Pages/Admin/Gestion_categorias';
import GestionUsuarios from './Pages/Admin/Gestion_usuarios';
import RegistroCompras from './Pages/Admin/Registro_compras';

// Archivos de estilos
import './assets/styles/main.css';
import './assets/styles/admin.css';
import './assets/styles/carrito.css';

function App() {
  return (
    <ProveedorSesion>
      <ProveedorCarrito>
        <BrowserRouter>
          <Routes>
            {/* Tienda pública: Navbar y Footer viven en LayoutTienda */}
            <Route element={<LayoutTienda />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/categorias" element={<Categoria />} />
              <Route path="/categoria/:nombre" element={<DetalleCategoria />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<DetalleBlog />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pago-correcto" element={<PagoCorrecto />} />
              <Route path="/pago-error" element={<PagoError />} />
            </Route>

            {/* Panel de administración: solo rol Administrador */}
            <Route path="/admin" element={<RutaAdmin />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<ProductosAdmin />} />
              <Route path="productos/criticos" element={<ProductosCriticos />} />
              <Route path="producto/:id" element={<DetalleProductosAdmin />} />
              <Route path="categorias" element={<GestionCategorias />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="pedidos" element={<RegistroCompras />} />
            </Route>

            {/* 404: siempre al final */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProveedorCarrito>
    </ProveedorSesion>
  );
}

export default App;
