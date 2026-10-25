import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProveedorSesion } from '../context/Contexto_sesion';
import RutaAdmin from '../components/RutaAdmin';
import Dashboard from '../Pages/Admin/Dashboard';
import ProductosAdmin from '../Pages/Admin/Productos';
import ProductosCriticos from '../Pages/Admin/Productos_criticos';
import DetalleProductosAdmin from '../Pages/Admin/Detalle_productos';
import GestionCategorias from '../Pages/Admin/Gestion_categorias';
import GestionUsuarios from '../Pages/Admin/Gestion_usuarios';
import RegistroCompras from '../Pages/Admin/Registro_compras';

// Same admin route tree as App.jsx, rendered with a logged-in administrator.
const renderAdmin = (ruta) => {
    localStorage.setItem('usuario_logueado', JSON.stringify({
        nombre: 'Administrador', apellidos: 'Performance', email: 'admin@performance.cl', rol: 'Administrador'
    }));
    return render(
        <ProveedorSesion>
            <MemoryRouter initialEntries={[ruta]}>
                <Routes>
                    <Route path="/admin" element={<RutaAdmin />}>
                        <Route index element={<Dashboard />} />
                        <Route path="productos" element={<ProductosAdmin />} />
                        <Route path="productos/criticos" element={<ProductosCriticos />} />
                        <Route path="producto/:id" element={<DetalleProductosAdmin />} />
                        <Route path="categorias" element={<GestionCategorias />} />
                        <Route path="usuarios" element={<GestionUsuarios />} />
                        <Route path="pedidos" element={<RegistroCompras />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </ProveedorSesion>
    );
};

describe('Admin - shared panel layout', () => {
    beforeEach(() => localStorage.clear());

    it.each([
        ['/admin', 'Dashboard Principal'],
        ['/admin/productos', 'Gestión de Productos'],
        ['/admin/productos/criticos', 'Listado de Productos Críticos'],
        ['/admin/producto/tabla-maple-pro-825', 'Detalle del Producto: Tabla Maple Pro 8.25'],
        ['/admin/categorias', 'Gestión de Categorías'],
        ['/admin/usuarios', 'Gestión de Usuarios'],
        ['/admin/pedidos', 'Historial de Compras y Boletas']
    ])('%s shows its page inside one sidebar layout', (ruta, titulo) => {
        const { container } = renderAdmin(ruta);

        expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeTruthy();
        expect(container.querySelectorAll('aside.sidebar')).toHaveLength(1);
        expect(container.querySelector('.admin-body > .admin-main h1').textContent).toBe(titulo);
    });

    it('keeps the layout when the product does not exist', () => {
        const { container } = renderAdmin('/admin/producto/no-existe');

        expect(container.querySelectorAll('aside.sidebar')).toHaveLength(1);
        expect(container.querySelector('.admin-main')).toBeTruthy();
    });
});

describe('Admin - Gestión de categorías', () => {
    beforeEach(() => localStorage.clear());

    it('adds the new category to the table and clears the input', () => {
        render(<MemoryRouter><GestionCategorias /></MemoryRouter>);
        const campo = screen.getByPlaceholderText('Ej: Calzado Skate');

        fireEvent.change(campo, { target: { value: '  Calzado Skate  ' } });
        fireEvent.click(screen.getByRole('button', { name: /Guardar Categoría/ }));

        expect(within(screen.getByRole('table')).getByText('Calzado Skate')).toBeTruthy();
        expect(campo.value).toBe('');
        expect(JSON.parse(localStorage.getItem('admin_categorias'))).toContain('Calzado Skate');
    });
});

const renderCriticos = () => render(
    <MemoryRouter initialEntries={['/admin/productos/criticos']}>
        <ProductosCriticos />
    </MemoryRouter>
);

describe('Admin - Productos críticos', () => {
    beforeEach(() => localStorage.clear());

    it('lists only products with stock <= 5', () => {
        renderCriticos();
        const tabla = screen.getByRole('table');

        expect(within(tabla).getByText('Tabla Maple Pro 8.25')).toBeTruthy();
        expect(within(tabla).getByText('Polera Oversize "Street"')).toBeTruthy();
        expect(within(tabla).queryByText('Lija Premium Black')).toBeNull();
    });

    it('shows a placeholder image instead of the alt text when the image fails to load', () => {
        renderCriticos();
        const imagen = screen.getByRole('img', { name: 'Tabla Maple Pro 8.25' });

        fireEvent.error(imagen);

        expect(imagen.getAttribute('src')).toBe('/img/sin-imagen.svg');
    });

    it('marks only "Stock Crítico" as active in the sidebar', () => {
        renderAdmin('/admin/productos/criticos');

        expect(screen.getByRole('link', { name: /Stock Crítico/ }).className).toContain('active');
        expect(screen.getByRole('link', { name: /^\s*Productos$/ }).className).not.toContain('active');
    });
});
