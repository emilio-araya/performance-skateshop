import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Shared shell for every public store page: Navbar and Footer are declared once.
const LayoutTienda = () => (
    <>
        <Navbar />
        <Outlet />
        <Footer />
    </>
);

export default LayoutTienda;
