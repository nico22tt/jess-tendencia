// lib/product-helpers.ts
export function shouldShowSizeSelector(categoryName?: string): boolean {
  if (!categoryName) return false
  const cat = categoryName.toLowerCase()
  // Agrega las categorías que SÍ usan tallas
  return ["jeans", "zapatillas", "botas", "botines", "pantuflas"].includes(cat)
}
