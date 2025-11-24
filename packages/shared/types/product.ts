export interface Product {
  id: string | number
  name: string
  price?: number            // Opcional para compatibilidad por si aún llega 'price'
  basePrice?: number        // Nuevo: corresponde a tu backend/DB
  salePrice?: number        // Nuevo: para productos en oferta
  originalPrice?: number    // Por si necesitas mostrar el precio tachado
  discount?: number
  image?: string
  images?: string[]
  label?: string
  labelType?: "new" | "sale"
  rating?: number
  reviewCount?: number
  variants?: { id: number; image: string; color: string }[]
  sku?: string
  seller?: string
  [key: string]: any        // Para evitar errores TS si llega algún otro campo inesperado
}
