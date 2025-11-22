
# Jess Tendencia - E-commerce de Moda Femenina

Plataforma de e-commerce moderna para venta de productos de moda femenina, construida con Next.js 15, Turborepo, Prisma y Supabase.

## 🚀 Características

- ✅ Panel de administración completo (CRUD de productos y categorías)
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Gestión de inventario en tiempo real
- ✅ Autenticación con Supabase Auth
- ✅ Base de datos PostgreSQL en Supabase
- 🔄 Carrito de compras (en desarrollo)
- 🔄 Sistema de órdenes y checkout (en desarrollo)

## 📦 Estructura del Monorepo

Este proyecto usa Turborepo para gestionar múltiples aplicaciones y paquetes compartidos:

### Aplicaciones (`apps/`)

- **`admin`**: Panel de administración para gestionar productos, categorías y órdenes
- **`client`**: Tienda pública donde los clientes navegan y compran productos

### Paquetes (`packages/`)

- **`@jess/ui`**: Componentes de UI compartidos (basados en shadcn/ui)
- **`@jess/shared`**: Lógica compartida, utilidades y configuración de Prisma
- **`@jess/prisma`**: Esquema de base de datos y cliente de Prisma
- **`@jess/eslint-config`**: Configuración de ESLint
- **`@jess/typescript-config`**: Configuración de TypeScript

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: Supabase Auth
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

## 🚦 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- pnpm 8+

### Instalación

1. **Clonar el repositorio**
git clone https://github.com/nico22tt/jess-tendencia.git
cd jess-tendencia

text

2. **Instalar dependencias**
pnpm install

text

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

Supabase
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

text

4. **Configurar Prisma**
cd packages/prisma
pnpm exec prisma generate
pnpm exec prisma db push

text

5. **Iniciar el servidor de desarrollo**
cd ../..
pnpm dev

text

Las aplicaciones estarán disponibles en:
- Admin: http://localhost:3000
- Client: http://localhost:3001

## 📝 Scripts Disponibles

### Desarrollo

Iniciar todas las apps en modo desarrollo
pnpm dev

Iniciar solo el admin
pnpm dev --filter=admin

Iniciar solo el cliente
pnpm dev --filter=client

text

### Build

Construir todas las apps
pnpm build

Construir solo el admin
pnpm build --filter=admin

text

### Base de Datos

Generar cliente de Prisma
cd packages/prisma
pnpm exec prisma generate

Aplicar cambios al schema
pnpm exec prisma db push

Abrir Prisma Studio
pnpm exec prisma studio

text

### Linting y Formato

Linting
pnpm lint

Formatear código
pnpm format

text

## 🗄️ Estructura de la Base de Datos

### Modelos principales

- **User**: Usuarios del sistema (admin y clientes)
- **Category**: Categorías de productos (con soporte para subcategorías)
- **Product**: Productos de la tienda
- **Order**: Órdenes de compra (próximamente)
- **OrderItem**: Items de las órdenes (próximamente)

Ver el esquema completo en [`packages/prisma/schema.prisma`](packages/prisma/schema.prisma)

## 🔐 Autenticación

El proyecto usa Supabase Auth para la autenticación:

- **Admin**: Login en `/login` (admin)
- **Cliente**: Registro/Login en la app cliente

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

### Variables de entorno necesarias

DATABASE_URL=tu_database_url
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

text

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turborepo.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Contribuir

Este es un proyecto privado. Para contribuir, contacta al owner del repositorio.

## 📄 Licencia

Privado - Todos los derechos reservados

## 👨‍💻 Autor

Nicolás - [@nico22tt](https://github.com/nico22tt)

---

Desarrollado usando Next.js y Turborepo