import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite todas las imágenes locales en /public
    localPatterns: [
      { pathname: '/**' }
    ],
    // Permite imágenes externas de estos dominios
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.adidas.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // TEMPORAL: Permitir cualquier dominio HTTPS (solo desarrollo)
      // Elimina esto en producción y agrega dominios específicos
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  transpilePackages: ['@jess/ui', '@jess/shared'],
}

export default nextConfig
