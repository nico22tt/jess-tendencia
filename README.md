Jess Tendencia - E-commerce de Moda Femenina
Plataforma de e-commerce para productos de moda femenina, construida con Next.js 15, Turborepo, Prisma y Supabase.

Características principales
Panel de administración completo: gestión de productos, categorías y órdenes.

Catálogo de productos con filtros, búsqueda, imágenes y navegación por categorías.

Gestión de inventario en tiempo real.

Autenticación robusta con Supabase Auth: validación restrictiva de emails aceptados.

Registro y login con validación de dominios populares (gmail, hotmail, outlook, yahoo).

Edición y alta de productos permite subir imágenes directamente desde el equipo del usuario (almacenadas en bucket Supabase).

Checkout y resumen de compra funcionales (pendiente: sincronizar ubicaciones y mostrar historial de compras del cliente).

Perfil de usuario (admin y cliente) sincronizado con la base de datos y edición desde la UI.

Búsqueda avanzada y calendario administrativo propio en el panel.

Sincronización automática de BD tras cambios con Prisma.

Estructura monorepo moderna y modular (Turborepo).

Estructura del Monorepo
Aplicaciones (apps/):

admin: Panel para gestión, reportes y administración de productos, usuarios y órdenes.

web: Tienda pública, orientada al cliente.

Paquetes (packages/):

@jess/ui: Componentes visuales compartidos (basados en shadcn/ui).

@jess/shared: Lógica, helpers y configuración compartida.

@jess/prisma: Esquema y cliente de Prisma.

Configuraciones propias de ESLint y TypeScript para todo el monorepo.

Stack Tecnológico
Frontend: Next.js 15 (App Router), React 19, TypeScript

UI/UX: Tailwind CSS, shadcn/ui, Radix UI

Backend: Next.js API Routes

Base de Datos y Auth: PostgreSQL y Supabase Auth

ORM: Prisma

Monorepo: Turborepo, pnpm

Inicio rápido
Prerrequisitos
Node.js 18+

pnpm 8+

Instalación
Clonar el repositorio:

bash
git clone https://github.com/nico22tt/jess-tendencia.git
cd jess-tendencia
Instalar dependencias:

bash
pnpm install
Crear archivo .env y configurar variables (ver ejemplo incluido).

Configurar Prisma:

bash
cd packages/prisma
pnpm exec prisma generate
pnpm exec prisma db push
Iniciar el servidor de desarrollo:

bash
cd ../..
pnpm dev
Admin: http://localhost:3000

Cliente: http://localhost:3001

Scripts útiles
pnpm dev: Levanta todo el monorepo en modo desarrollo.

pnpm dev --filter=admin: Solo admin.

pnpm dev --filter=web: Solo cliente.

pnpm build: Build de todas las apps.

pnpm lint: Corre linter.

pnpm format: Formatea el código.

Base de Datos
pnpm exec prisma generate: Generar cliente Prisma.

pnpm exec prisma db push: Aplicar cambios de schema.

pnpm exec prisma studio: Visualización editable de la BD.

Modelos principales de la base de datos
User (usuarios, admin y clientes)

Category (categorías y subcategorías)

Product (productos de la tienda)

Order y OrderItem (órdenes de compra y sus ítems; próximos lanzamientos)

Ver schema.prisma para detalles completos.

Autenticación
Admin: Login exclusivo en /login.

Cliente: Registro/Login en la web pública con validación de dominio popular.

Manejo de sesión y cuentas via Supabase Auth.

Deploy
Vercel (recomendado)
Conecta a tu repositorio

Declara tus variables de entorno (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

Deploy automático en cada push a main.

Documentación adicional
Next.js Documentation

Turborepo Documentation

Prisma Documentation

Supabase Documentation

Contribuir
Proyecto privado. Para colaborar, contactar al owner por GitHub.

Licencia
Privado – Todos los derechos reservados

Autor
Nicolás — @nico22tt

Desarrollado con Next.js y Turborepo.