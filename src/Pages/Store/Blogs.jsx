import React from 'react';
import { Link } from 'react-router-dom';

export const BLOGS_DATA = [
    { id: 1, titulo: "Guía Definitiva: Cómo elegir tu primera tabla de skate", desc: "Aprende todo sobre maderas, cóncavos y medidas ideales.", img: "/img/Caso1.jpg" },
    { id: 2, titulo: "Ruedas blandas vs. Ruedas duras", desc: "Conoce la dureza adecuada según la superficie sobre la que patinas.", img: "/img/Caso2.webp" }
];

const Blogs = () => {
    return (
        <main className="blog-section" style={{ paddingTop: '110px' }}>
            <h2 className="section-title">Noticias & Blog</h2>
            <div className="blog-grid">
                {BLOGS_DATA.map(blog => (
                    <article key={blog.id} className="blog-card">
                        <div className="blog-content">
                            <div>
                                <h3>{blog.titulo}</h3>
                                <p>{blog.desc}</p>
                            </div>
                            <Link to={`/blog/${blog.id}`} className="btn-ver-caso">Ver caso</Link>
                        </div>
                        <div className="blog-image-wrapper">
                            <img src={blog.img} alt={blog.titulo} />
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default Blogs;