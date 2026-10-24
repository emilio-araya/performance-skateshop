import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

it('opens a WhatsApp chat from the footer and shows the WhatsApp logo', () => {
    render(<Footer />);

    const whatsapp = screen.getByRole('link', { name: /whatsapp: \+56 9 7396 9195/i });

    expect(whatsapp.getAttribute('href')).toBe('https://wa.me/56973969195');
    expect(whatsapp.querySelector('i').className).toBe('fa-brands fa-whatsapp');
});

it('opens the mail client from the footer email address', () => {
    render(<Footer />);

    const correo = screen.getByRole('link', { name: /contacto@performancesb\.cl/i });

    expect(correo.getAttribute('href')).toBe('mailto:contacto@performancesb.cl');
    expect(correo.querySelector('i').className).toBe('fa-solid fa-envelope');
});
