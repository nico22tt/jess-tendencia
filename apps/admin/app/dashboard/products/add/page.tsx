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
import { Upload, X, Check } from "lucide-react"
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
      isMain: uploadedImages.length === 0 // Primera imagen es la principal
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
      
      // Si eliminamos la principal, hacer la primera como principal
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true
      }
      
      return filtered
    })
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
      // Preparar array de imágenes para JSON
      const imagesArray = uploadedImages.map(img => ({
        url: img.url,
        isMain: img.isMain
      }))

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
        alert("✅ Producto creado exitosamente")
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
              {/* Left Column - Main Information */}
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
                  
                  {/* Agregar imagen por URL */}
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
                    <p className="text-xs text-zinc-600">
                      Por ahora ingresa URLs de imágenes. Presiona Enter o click en Agregar
                    </p>
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
                              <button
                                onClick={() => handleRemoveImage(image.id)}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                                aria-label="Eliminar imagen"
                              >
                                <X className="h-4 w-4" />
                              </button>
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
                                  Imagen Principal
                                </span>
                              ) : (
                                "Establecer como Principal"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column - Inventory and Classification */}
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
                      <p className="text-sm text-zinc-500 mt-1">Opcional - Deja vacío si no hay oferta</p>
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-zinc-300">Cantidad en Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
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
