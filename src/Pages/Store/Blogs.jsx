import React from 'react';
import { Link } from 'react-router-dom';

// Same four articles as fase 1 (js/blogs.js of the original project).
export const BLOGS_DATA = [
    {
        id: 1,
        titulo: "Guía Definitiva: Cómo elegir tu primera tabla de skate (y no morir en el intento)",
        desc: "Si estás pensando en armar tu primer setup pero te abruman los tecnicismos, esta guía es para ti",
        img: "/img/Caso1.jpg"
    },
    {
        id: 2,
        titulo: "Ruedas blandas vs. Ruedas duras: ¿Cuáles necesitas para dominar la ciudad?",
        desc: "No todas las ruedas se comportan igual sobre el asfalto. Si tu objetivo es recorrer las calles de tu ciudad sin que tus pies terminen vibrando por el pavimento rugoso, necesitas conocer el durómetro de tus ruedas.",
        img: "/img/Caso2.webp"
    },
    {
        id: 3,
        titulo: "El Arte sobre la Madera: Los gráficos de skate más icónicos de la historia",
        desc: "El skateboarding es tanto un deporte como una forma de expresión artística. Desde los míticos diseños de Powell-Peralta y Santa Cruz en los años 80 hasta las colaboraciones modernas de Supreme, repasamos las ilustraciones que definieron a generaciones enteras.",
        img: "/img/Caso3.jpg"
    },
    {
        id: 4,
        titulo: "¿Necesitas renovar tu setup?",
        desc: "En nuestra tienda online contamos con stock permanente de tablas, trucks, ruedas, rulemanes y accesorios de las marcas más respetadas de la escena.",
        img: "/img/Caso4.webp"
    }
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