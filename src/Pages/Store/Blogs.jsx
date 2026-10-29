import React from 'react';
import { Link } from 'react-router-dom';

const IMAGEN_DEFAULT_BLOG = "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=800&q=80";

export const BLOGS_DATA = [
    {
        id: 1, 
        titulo: "Guía Definitiva: Cómo elegir tu primera tabla de skate",
        desc: "Aprende todo sobre maderas, cóncavos y medidas ideales.",
        img: "/img/Caso1.jpg"
    },
    {
        id: 2,
        titulo: "Ruedas blandas vs. Ruedas duras",
        desc: "Conoce la dureza adecuada según la superficie sobre la que patinas.",
        img: "/img/Caso2.webp"
    }
];

const Blogs = () => {
    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            <h1 className="section-title">Noticias & Blog</h1>
            
            <div className="blog-grid">
                {BLOGS_DATA.map(blog => (
                    <article key={blog.id} className="blog-card">
                        <div className="blog-image-wrapper">
                            <img 
                                src={blog.img} 
                                alt={blog.titulo} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = IMAGEN_DEFAULT_BLOG;
                                }}
                            />
                        </div>
                        <div className="blog-content">
                            <h3>{blog.titulo}</h3>
                            <p>{blog.desc}</p>
                            <Link to={`/blog/${blog.id}`} className="btn-ver-caso">
                                Ver caso <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default Blogs;