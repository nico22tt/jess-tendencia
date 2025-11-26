// components/size-guide.tsx
interface SizeGuideProps {
  categoryName?: string
}

export function SizeGuide({ categoryName }: SizeGuideProps) {
  const cat = categoryName?.toLowerCase()
  if (!cat) return null

  if (cat === "jeans") {
    return (
      <div className="mb-4">
        {/* ...tu tabla y tips guía para jeans... */}
        <div className="font-bold mb-2">Guía de Tallas Jeans</div>
        {/* Tabla aquí */}
      </div>
    )
  }

  if (["zapatillas", "botas", "botines"].includes(cat)) {
    return (
      <div className="mb-4">
        {/* ...tu tabla y tips guía para calzado... */}
        <div className="font-bold mb-2">Guía de Tallas Calzado</div>
        {/* Tabla aquí */}
      </div>
    )
  }

  // Si no requiere guía, mensaje corto:
  return <p className="text-gray-500">Este producto no requiere guía de tallas.</p>
}
