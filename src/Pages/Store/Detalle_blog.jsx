import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOGS_DATA } from './Blogs';

const DetalleBlog = () => {
    const { id } = useParams();
    const blog = BLOGS_DATA.find(b => b.id === Number(id));

    if (!blog) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2>Artículo no encontrado</h2>
                <Link to="/blogs" className="btn-main">Volver a Blogs</Link>
            </div>
        );
    }

    return (
        <main style={{ paddingTop: '110px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>{blog.titulo}</h1>
                <img src={blog.img} alt={blog.titulo} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
                <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>{blog.desc}</p>
                <Link to="/blogs" className="btn-main" style={{ marginTop: '30px', display: 'inline-block' }}>&larr; Volver a Blogs</Link>
            </div>
        </main>
    );
};

export default DetalleBlog;