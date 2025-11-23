"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Textarea } from "@jess/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"
import { Card } from "@jess/ui/card"
import { Upload, X, Check, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id: string
  url: string
  isMain: boolean
}

interface ProductVariant {
  id: string        // ← añade esta línea
  size: string
  color?: string
  stock: number
  priceAdjustment: number
}

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [urlSlug, setUrlSlug] = useState("")
  const [sku, setSku] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [brand, setBrand] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Estados para variantes
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariantSize, setNewVariantSize] = useState("")
  const [newVariantColor, setNewVariantColor] = useState("")
  const [newVariantStock, setNewVariantStock] = useState("")
  const [newVariantPriceAdj, setNewVariantPriceAdj] = useState("")

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }
    fetchCategories()
  }, [])

  // Generar slug automáticamente
  const handleNameChange = (name: string) => {
    setProductName(name)
    
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    setUrlSlug(slug)
  }

  // Agregar imagen
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return

    const newImage: ProductImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      isMain: uploadedImages.length === 0
    }

    setUploadedImages([...uploadedImages, newImage])
    setNewImageUrl("")
  }

  // Establecer imagen principal
  const handleSetMainImage = (imageId: string) => {
    setUploadedImages((prev) => 
      prev.map((img) => ({ ...img, isMain: img.id === imageId }))
    )
  }

  // Eliminar imagen
  const handleRemoveImage = (imageId: string) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId)
      
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true
      }
      
      return filtered
    })
  }

  // Agregar variante
  const handleAddVariant = () => {
    if (!newVariantSize.trim()) {
      alert("La talla es obligatoria")
      return
    }

    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      size: newVariantSize,
      color: newVariantColor || "",
      stock: parseInt(newVariantStock) || 0,
      priceAdjustment: parseInt(newVariantPriceAdj) || 0
    }

    setVariants([...variants, newVariant])
    
    // Limpiar campos
    setNewVariantSize("")
    setNewVariantColor("")
    setNewVariantStock("")
    setNewVariantPriceAdj("")
  }

  // Eliminar variante
  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId))
  }

  // Guardar producto
  const handleSaveProduct = async () => {
    // Validaciones
    if (!productName.trim()) {
      alert("El nombre del producto es obligatorio")
      return
    }

    if (!description.trim()) {
      alert("La descripción es obligatoria")
      return
    }

    if (!urlSlug.trim()) {
      alert("El URL slug es obligatorio")
      return
    }

    if (!sku.trim()) {
      alert("El SKU es obligatorio")
      return
    }

    if (!basePrice || parseFloat(basePrice) <= 0) {
      alert("El precio base debe ser mayor a 0")
      return
    }

    if (!category) {
      alert("Debes seleccionar una categoría")
      return
    }

    if (!brand.trim()) {
      alert("La marca es obligatoria")
      return
    }

    if (uploadedImages.length === 0) {
      alert("Debes agregar al menos una imagen")
      return
    }

    setIsLoading(true)

    try {
      // Preparar array de imágenes
      const imagesArray = uploadedImages.map(img => ({
        url: img.url,
        isMain: img.isMain
      }))

      // Crear producto
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description,
          urlSlug,
          sku,
          basePrice: parseInt(basePrice),
          salePrice: salePrice ? parseInt(salePrice) : null,
          stock: stock ? parseInt(stock) : 0,
          categoryId: category,
          subcategory: subcategory || null,
          brand,
          isPublished,
          images: imagesArray
        })
      })

      const data = await res.json()

      if (data.success) {
        const productId = data.data.id

        // Si hay variantes, crearlas
        if (variants.length > 0) {
          for (const variant of variants) {
            await fetch(`/api/products/${productId}/variants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                size: variant.size,
                color: variant.color || null,
                stock: variant.stock,
                priceAdjustment: variant.priceAdjustment,
                sku: `${sku}-${variant.size}${variant.color ? `-${variant.color}` : ''}`
              })
            })
          }
        }

        alert("✅ Producto creado exitosamente" + (variants.length > 0 ? ` con ${variants.length} variantes` : ""))
        router.push('/dashboard/products')
      } else {
        alert("❌ Error: " + data.error)
      }
    } catch (error) {
      console.error('Error al crear producto:', error)
      alert("❌ Error al crear el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Crear Nuevo Producto</h1>
                <p className="text-zinc-400 mt-1">Completa la información del producto</p>
              </div>
              <Button 
                onClick={handleSaveProduct} 
                disabled={isLoading}
                className="bg-pink-600 hover:bg-pink-700 text-white disabled:bg-gray-600"
              >
                {isLoading ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </div>

            {/* Two Column Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Información General</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productName" className="text-zinc-300">
                        Nombre del Producto *
                      </Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ej: Zapatillas Urbanas Blancas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-zinc-300">
                        Descripción Larga *
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el producto en detalle..."
                        rows={6}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="urlSlug" className="text-zinc-300">
                        URL Slug *
                      </Label>
                      <Input
                        id="urlSlug"
                        value={urlSlug}
                        onChange={(e) => setUrlSlug(e.target.value)}
                        placeholder="zapatillas-urbanas-blancas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                      <p className="text-sm text-zinc-500 mt-1">
                        Se genera automáticamente, pero puedes editarlo
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Imágenes y Galería</h2>
                  
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="imageUrl" className="text-zinc-300">
                      URL de Imagen
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddImage()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddImage}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">
                      Imágenes Subidas ({uploadedImages.length})
                    </h3>
                    {uploadedImages.length === 0 ? (
                      <p className="text-zinc-500 text-sm text-center py-8">
                        No hay imágenes. Agrega al menos una imagen.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg bg-zinc-800 overflow-hidden relative">
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt="Product"
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveImage(image.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  aria-label="Eliminar variante"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                            </div>
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(image.id)}
                              className={`mt-2 w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                                image.isMain 
                                  ? "bg-pink-600 text-white" 
                                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                              }`}
                            >
                              {image.isMain ? (
                                <span className="flex items-center justify-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Principal
                                </span>
                              ) : (
                                "Establecer Principal"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Inventario y Precios</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sku" className="text-zinc-300">SKU *</Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="ZAP-001"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="basePrice" className="text-zinc-300">
                        Precio Base (CLP) *
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="45990"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="salePrice" className="text-zinc-300">
                        Precio de Oferta (CLP)
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="39990"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-zinc-300">Stock General</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        Si tienes variantes, el stock se gestiona por talla
                      </p>
                    </div>
                  </div>
                </Card>

                {/* NUEVA SECCIÓN: Variantes */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Variantes de Producto (Opcional)
                  </h2>
                  <p className="text-sm text-zinc-400 mb-4">
                    Agrega tallas, colores y stock específico para cada variante
                  </p>

                  {/* Formulario para agregar variante */}
                  <div className="space-y-3 mb-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm">Talla *</Label>
                        <Input
                          value={newVariantSize}
                          onChange={(e) => setNewVariantSize(e.target.value)}
                          placeholder="S, M, L, 38, 40..."
                          className="bg-zinc-800 border-zinc-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm">Color</Label>
                        <Input
                          value={newVariantColor}
                          onChange={(e) => setNewVariantColor(e.target.value)}
                          placeholder="Negro, Blanco..."
                          className="bg-zinc-800 border-zinc-700 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-300 text-sm">Stock</Label>
                        <Input
                          type="number"
                          value={newVariantStock}
                          onChange={(e) => setNewVariantStock(e.target.value)}
                          placeholder="10"
                          className="bg-zinc-800 border-zinc-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm">Ajuste Precio</Label>
                        <Input
                          type="number"
                          value={newVariantPriceAdj}
                          onChange={(e) => setNewVariantPriceAdj(e.target.value)}
                          placeholder="0"
                          className="bg-zinc-800 border-zinc-700 text-white text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Variante
                    </Button>
                  </div>

                  {/* Lista de variantes */}
                  {variants.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-zinc-300">
                        Variantes agregadas ({variants.length})
                      </h3>
                      {variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">
                              Talla: {variant.size}
                              {variant.color && ` - ${variant.color}`}
                            </p>
                            <p className="text-xs text-zinc-400">
                              Stock: {variant.stock} unidades
                              {variant.priceAdjustment !== 0 && ` | Ajuste: $${variant.priceAdjustment}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Clasificación</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category" className="text-zinc-300">
                        Categoría Principal *
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-white">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory" className="text-zinc-300">
                        Subcategoría
                      </Label>
                      <Input
                        id="subcategory"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Ej: Urbanas, Deportivas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand" className="text-zinc-300">Marca *</Label>
                      <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ej: Nike, Adidas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Visibilidad</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="published" className="text-zinc-300">
                        Estado del Producto
                      </Label>
                      <p className="text-sm text-zinc-500 mt-1">
                        {isPublished 
                          ? "El producto está publicado y visible" 
                          : "El producto está en borrador"}
                      </p>
                    </div>
                    <Switch 
                      id="published" 
                      checked={isPublished} 
                      onCheckedChange={setIsPublished} 
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
