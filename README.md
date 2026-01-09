#  Jess Tendencia - E-commerce Platform

Plataforma de comercio electrónico B2C construida con arquitectura monorepo moderna y stack full-stack escalable. Desarrollada como proyecto de título para un emprendimiento familiar real especializado en moda femenina

#  🚀 Stack Tecnológico

Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui

Backend: Next.js API Routes, FastAPI (ML Service)

Base de Datos: PostgreSQL con Prisma ORM

Auth & Storage: Supabase (Auth + Storage Buckets)

Monorepo: Turborepo con pnpm workspaces

#  ✨ Características Principales

Panel Administrativo: Gestión completa de productos, categorías, inventario y órdenes

Catálogo Inteligente: Búsqueda avanzada, filtros por categoría, gestión de imágenes

Sistema de Recomendaciones: ML integrado para sugerencias personalizadas de productos

Autenticación Segura: Login/registro con validación de dominios y gestión de roles

Gestión de Inventario: Actualización en tiempo real con sincronización automática

Arquitectura Modular: Monorepo con apps y paquetes compartidos

#  📦 Estructura del Proyecto

apps/

├── admin/          # Panel de administración

├── web/            # Tienda pública (cliente)

packages/

├── @jess/ui/       # Componentes compartidos

├── @jess/shared/   # Lógica y utilidades

├── @jess/prisma/   # Schema y cliente de BD

🛠️ Inicio Rápido

# Clonar repositorio
git clone https://github.com/nico22tt/jess-tendencia.git
cd jess-tendencia

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar base de datos
cd packages/prisma
pnpm exec prisma generate
pnpm exec prisma db push

# Iniciar desarrollo
cd ../..
pnpm dev
URLs locales:

Admin: http://localhost:3000

Cliente: http://localhost:3001

#  📝 Scripts Útiles

pnpm dev                      # Desarrollo (todas las apps)

pnpm dev --filter=admin       # Solo admin

pnpm build                    # Build producción

pnpm exec prisma studio       # Visualizar BD

#  🔐 Autenticación

Admin: Acceso restringido vía /login

Cliente: Registro público con validación de email

Gestión de sesiones y permisos con Supabase Auth

#  🚢 Deploy
Vercel (Recomendado)

Conectar repositorio

Configurar variables de entorno:

DATABASE_URL

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Deploy automático en cada push a main

#  👥 Autores
Nicolás Medina - @nico22tt

Licencia: Privado - Proyecto de Título
Año: 2025
