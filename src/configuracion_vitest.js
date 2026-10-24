import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el árbol del DOM después de cada prueba individual
afterEach(() => {
    cleanup();
});