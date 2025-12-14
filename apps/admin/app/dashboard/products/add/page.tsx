"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Textarea } from "@jess/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"
import { Card } from "@jess/ui/card"
import { Upload, X, Check, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

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
  id: string
  size: string
  color?: string
  stock: number
  priceAdjustment: number
}

export default function AddProductPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
  }

  // Cargar categorías
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

  // Agregar imagen por URL
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

  // Subir imagen desde PC
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split(".").pop()
    const filename = `product-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filename, file)

    if (error) {
      alert("Error al subir imagen: " + error.message)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename)

    if (publicUrlData?.publicUrl) {
      setUploadedImages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          url: publicUrlData.publicUrl,
          isMain: prev.length === 0,
        },
      ])
    } else {
      alert("No se pudo obtener la URL pública de la imagen.")
    }
    e.target.value = "" // limpiar input file
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground ">Crear Nuevo Producto</h1>
            <p className="text-muted-foreground mt-1">Completa la información del producto</p>
          </div>
          <Button 
            onClick={handleSaveProduct} 
            disabled={isLoading}
            className="bg-pink-600 hover:bg-pink-700 text-foreground disabled:bg-gray-600"
          >
            {isLoading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>

        {/* Two Column Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Información General</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName" className=" text-foreground">
                    Nombre del Producto *
                  </Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Zapatillas Urbanas Blancas"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description" className=" text-foreground">
                    Descripción Larga *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe el producto en detalle..."
                    rows={6}
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="urlSlug" className=" text-foreground">
                    URL Slug *
                  </Label>
                  <Input
                    id="urlSlug"
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(e.target.value)}
                    placeholder="zapatillas-urbanas-blancas"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Se genera automáticamente, pero puedes editarlo
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Imágenes y Galería</h2>
              
              {/* Input para subir imágenes desde PC */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="imageFile" className=" text-foreground">
                  Subir Imagen desde tu equipo
                </Label>
                <input
                  title="subir imagen"
                  type="file"
                  accept="image/*"
                  id="imageFile"
                  className=" bg-muted border-border text-foreground px-2 py-1 rounded w-full"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Input para agregar imagen por URL */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="imageUrl" className=" text-foreground">
                  O agrega una URL de Imagen
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
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
                    className="flex-content bg-pink-600 hover:bg-pink-700"
                  >
                    Agregar
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium  text-foreground mb-3">
                  Imágenes Subidas ({uploadedImages.length})
                </h3>
                {uploadedImages.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No hay imágenes. Agrega al menos una imagen.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg  bg-muted overflow-hidden relative">
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
                            className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            aria-label="Eliminar imagen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(image.id)}
                          className={`mt-2 w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                            image.isMain 
                              ? "bg-pink-600 text-foreground" 
                              : " bg-muted text-muted-foreground hover:bg-zinc-700"
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
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Inventario y Precios</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sku" className=" text-foreground">SKU *</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ZAP-001"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice" className=" text-foreground">
                    Precio Base (CLP) *
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="45990"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice" className=" text-foreground">
                    Precio de Oferta (CLP)
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="39990"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </Card>

            {/* Variantes */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Variantes de Producto (Opcional)
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega tallas, colores y stock específico para cada variante
              </p>

              {/* Formulario para agregar variante */}
              <div className="space-y-3 mb-4 p-4  bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className=" text-foreground text-sm">Talla *</Label>
                    <Input
                      value={newVariantSize}
                      onChange={(e) => setNewVariantSize(e.target.value)}
                      placeholder="S, M, L, 38, 40..."
                      className=" bg-muted border-border text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <Label className=" text-foreground text-sm">Color</Label>
                    <Input
                      value={newVariantColor}
                      onChange={(e) => setNewVariantColor(e.target.value)}
                      placeholder="Negro, Blanco..."
                      className=" bg-muted border-border text-foreground text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className=" text-foreground text-sm">Ajuste Precio</Label>
                    <Input
                      type="number"
                      value={newVariantPriceAdj}
                      onChange={(e) => setNewVariantPriceAdj(e.target.value)}
                      placeholder="0"
                      className=" bg-muted border-border text-foreground text-sm"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full bg-green-700 hover:bg-zinc-600 text-foreground"
                  size="sm"
                >
                 
                  Agregar Variante
                </Button>
              </div>

              {/* Lista de variantes */}
              {variants.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium  text-foreground">
                    Variantes agregadas ({variants.length})
                  </h3>
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3  bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-foreground font-medium text-sm">
                          Talla: {variant.size}
                          {variant.color && ` - ${variant.color}`}
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

            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Clasificación</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category" className=" text-foreground">
                    Categoría Principal *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className=" bg-muted border-border text-foreground ">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent className=" bg-muted border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory" className=" text-foreground">
                    Subcategoría
                  </Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Ej: Urbanas, Deportivas"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <Label htmlFor="brand" className=" text-foreground">Marca *</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej: Nike, Adidas"
                    className=" bg-muted border-border text-foreground placeholder:text-zinc-500"
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Visibilidad</h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className=" text-foreground">
                    Estado del Producto
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
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
    </AdminDashboardLayout>
  )
}
