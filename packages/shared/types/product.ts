export interface Product {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  images?: string[]
  label?: string
  labelType?: "new" | "sale"
  rating?: number
  reviewCount?: number
  variants?: { id: number; image: string; color: string }[]
  sku?: string
  seller?: string
}
