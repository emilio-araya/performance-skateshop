import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOGS_DATA } from './Blogs';

const IMAGEN_DEFAULT_BLOG = "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=800&q=80";

const DetalleBlog = () => {
    const { id } = useParams();
    const blog = BLOGS_DATA.find(b => b.id === Number(id));

    if (!blog) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Artículo no encontrado</h2>
                <Link to="/blogs" className="btn-back-link-subtle" style={{ marginTop: '20px' }}>
                    <i className="fas fa-arrow-left"></i> Volver a Blogs
                </Link>
            </div>
        );
    }

    return (
        <main className="container" style={{ paddingTop: '110px', paddingBottom: '60px', minHeight: '80vh' }}>
            {/* Botón sutil en la esquina superior izquierda */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                <Link to="/blogs" className="btn-back-link-subtle">
                    <i className="fas fa-arrow-left"></i> Volver a Blogs
                </Link>
            </div>

            <article className="blog-detail-container">
                <h1 className="blog-detail-title">{blog.titulo}</h1>
                
                <div className="blog-detail-img-wrapper">
                    <img 
                        src={blog.img} 
                        alt={blog.titulo} 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = IMAGEN_DEFAULT_BLOG;
                        }}
                    />
                </div>

                <p className="blog-detail-text">{blog.desc}</p>
            </article>
        </main>
    );
};

export default DetalleBlog;