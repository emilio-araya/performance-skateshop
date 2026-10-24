import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test:
  {
    globals: true, // crear pruebas sin la importancion de los comandos 
    environment: 'jsdom', //levantar un navegador simulado para pruebas de componentes de React
    setupFiles: './src/configuracion_vitest.js', //ejecutar un archivo antes de cada prueba para configurar el entorno de pruebas 
  },
})


