import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite todas las imágenes en /public para src="/placeholder.svg" y similares
    localPatterns: [
      { pathname: '/**' }
    ]
  }
}

export default nextConfig
