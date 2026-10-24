import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container container">
                <div className="footer-col brand-col">
                    <div className="footer-logo">PERFORMANCE</div>
                    <p><i className="fa-solid fa-comment-dots"></i> Whatsapp: +56 9 7396 9195</p>
                    <p><i className="fa-solid fa-envelope"></i> contacto@performancesb.cl</p>
                    <div className="social-links">
                        <a href="#!"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#!"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#!"><i className="fa-brands fa-tiktok"></i></a>
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Sobre Nosotros</h4>
                    <ul>
                        <li><a href="#!">Términos y Condiciones</a></li>
                        <li><a href="#!">Política de Privacidad</a></li>
                        <li><a href="#!">Cambios y Devoluciones</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Categorías</h4>
                    <ul>
                        <li><a href="#!">Skateboard</a></li>
                        <li><a href="#!">Hardwares</a></li>
                        <li><a href="#!">Poleras y Polerones</a></li>
                    </ul>
                </div>

                <div className="footer-col newsletter-col">
                    <h4>Suscríbete y Ahorra 10%</h4>
                    <p>Entérate de los lanzamientos y novedades en tu primera compra.</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Ingresa tu email" required />
                        <button type="submit">SUSCRIBIRME</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container footer-bottom-flex">
                    <p>Copyright © PERFORMANCE SKATESHOP 2026 - Todos los derechos reservados.</p>
                    <div className="payment-methods">
                        <i className="fa-brands fa-cc-visa"></i>
                        <i className="fa-brands fa-cc-mastercard"></i>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;