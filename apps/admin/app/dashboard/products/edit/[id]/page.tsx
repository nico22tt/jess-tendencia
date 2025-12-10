"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Label } from "@jess/ui/label"
import { Textarea } from "@jess/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"
import { Switch } from "@jess/ui/switch"
import { Card } from "@jess/ui/card"
import { Upload, X, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@utils/supabase/client"

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id?: string
  url: string
  isMain: boolean
}

interface Product {
  id: string
  name: string
  description: string
  urlSlug: string
  sku: string
  basePrice: number
  salePrice: number | null
  stock: number
  categoryId: string
  subcategory: string | null
  brand: string
  isPublished: boolean
  images: ProductImage[]
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Product form data
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

  // Cargar producto
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()

        if (data.success) {
          const product: Product = data.data
          setProductName(product.name)
          setDescription(product.description)
          setUrlSlug(product.urlSlug)
          setSku(product.sku)
          setBasePrice(product.basePrice.toString())
          setSalePrice(product.salePrice ? product.salePrice.toString() : "")
          setStock(product.stock.toString())
          setCategory(product.categoryId)
          setSubcategory(product.subcategory || "")
          setBrand(product.brand)
          setIsPublished(product.isPublished)
          // Asegura IDs únicos locales
          const imagesWithIds = (product.images || []).map((img, idx) => ({
            ...img,
            id: img.id || `existing-${idx}-${Date.now()}`
          }))
          setUploadedImages(imagesWithIds)
        } else {
          alert("Error al cargar el producto")
          router.push("/dashboard/products")
        }
      } catch (error) {
        console.error("Error al cargar producto:", error)
        alert("Error al cargar el producto")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id, router])

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

  // Agregar imagen por URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return

    const newImage: ProductImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      isMain: uploadedImages.length === 0,
    }
    setUploadedImages([...uploadedImages, newImage])
    setNewImageUrl("")
  }

  // Subir imagen desde PC (Supabase)
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
    const handleToggleVisibility = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
      })

      if (!res.ok) {
        console.error("Error al cambiar visibilidad")
        return
      }

      const data = await res.json()
      if (data.success) {
        setIsPublished(data.data.isPublished)
      }
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error)
    }
  }

  

  // Guardar cambios
  const handleSaveProduct = async () => {
    // Validaciones
    if (!productName.trim() || !description.trim() || !urlSlug.trim() || !sku.trim() || !category || !brand.trim()) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    if (!basePrice || parseFloat(basePrice) <= 0) {
      alert("El precio base debe ser mayor a 0")
      return
    }

    if (uploadedImages.length === 0) {
      alert("Debes agregar al menos una imagen")
      return
    }

    setIsSaving(true)

    try {
      const imagesArray = uploadedImages.map(img => ({
        url: img.url,
        isMain: img.isMain
      }))

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
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
        alert("✅ Producto actualizado exitosamente")
        router.push('/dashboard/products')
      } else {
        alert("❌ Error: " + data.error)
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      alert("❌ Error al actualizar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background


">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground


">Cargando producto...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background


">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/products">
                  <Button
                    variant="outline"
                    size="sm"
                    className=" border-border


 text-foreground


 hover:bg-muted


 bg-transparent"
                    aria-label="Volver a productos"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground


">Editar Producto</h1>
                  <p className="text-muted-foreground


 mt-1">Actualiza la información del producto</p>
                </div>
              </div>
              <Button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="bg-pink-600 hover:bg-pink-700 text-foreground


 disabled:bg-gray-600"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>

            {/* Two Column Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Main Information */}
              <div className="space-y-6">
                {/* General Information */}
                <Card className="bg-card


  border-border


p-6">
                  <h2 className="text-xl font-semibold text-foreground


 mb-4">Información General</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productName" className="text-foreground


">
                        Nombre del Producto *
                      </Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ej: Zapatillas Urbanas Blancas"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-foreground


">
                        Descripción Larga *
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el producto en detalle..."
                        rows={6}
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="urlSlug" className="text-foreground


">
                        URL Slug *
                      </Label>
                      <Input
                        id="urlSlug"
                        value={urlSlug}
                        onChange={(e) => setUrlSlug(e.target.value)}
                        placeholder="zapatillas-urbanas-blancas"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>
                  </div>
                </Card>

                {/* Images and Gallery */}
                <Card className="bg-card  border-border


p-6">
                  <h2 className="text-xl font-semibold text-foreground


 mb-4">Imágenes y Galería</h2>

                  {/* Input para subir imágenes desde PC */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="imageFile" className="text-foreground


">
                      Subir Imagen desde tu equipo
                    </Label>
                    <input
                      title="subir imagen"
                      type="file"
                      accept="image/*"
                      id="imageFile"
                      className="bg-muted


  border-border


 text-foreground


 px-2 py-1 rounded w-full"
                      onChange={handleFileInputChange}
                    />
                  </div>

                  {/* Agregar imagen por URL */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="imageUrl" className="text-foreground


">
                      O agrega una URL de Imagen
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
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
                    <h3 className="text-sm font-medium text-foreground


 mb-3">
                      Imágenes Subidas ({uploadedImages.length})
                    </h3>
                    {uploadedImages.length === 0 ? (
                      <p className="text-muted-foreground


 text-sm text-center py-8">
                        No hay imágenes. Agrega al menos una imagen.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg bg-muted


 overflow-hidden relative">
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
                                onClick={() => handleRemoveImage(image.id!)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                aria-label="Eliminar imagen"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(image.id!)}
                              className={`mt-2 w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                                image.isMain
                                  ? "bg-pink-600 text-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-zinc-700"
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
                <Card className="bg-card


  border-border


p-6">
                  <h2 className="text-xl font-semibold text-foreground


 mb-4">Inventario y Precios</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sku" className="text-foreground


">SKU *</Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="ZAP-001"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="basePrice" className="text-foreground


">
                        Precio Base (CLP) *
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="45990"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="salePrice" className="text-foreground


">
                        Precio de Oferta (CLP)
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="39990"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                      />
                      <p className="text-sm text-muted-foreground


 mt-1">Opcional</p>
                    </div>

                    <div>
                      <Label htmlFor="stock" className="text-foreground


">Cantidad en Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-card


  border-border


p-6">
                  <h2 className="text-xl font-semibold text-foreground


 mb-4">Clasificación</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category" className="text-foreground


">
                        Categoría Principal *
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-muted


  border-border


 text-foreground


">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-muted


  border-border


">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-foreground


">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subcategory" className="text-foreground


">
                        Subcategoría
                      </Label>
                      <Input
                        id="subcategory"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Ej: Urbanas, Deportivas"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                      />
                    </div>

                    <div>
                      <Label htmlFor="brand" className="text-foreground


">Marca *</Label>
                      <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ej: Nike, Adidas"
                        className="bg-muted


  border-border


 text-foreground


 placeholder:text-muted-foreground


"
                        required
                      />
                    </div>
                  </div>
                </Card>

                <Card className="bg-card


  border-border


p-6">
                  <h2 className="text-xl font-semibold text-foreground


 mb-4">Visibilidad</h2>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label htmlFor="published" className="text-foreground


">
                        Estado del Producto
                      </Label>
                      <p className="text-sm text-muted-foreground


 mt-1">
                        {isPublished
                          ? "El producto está publicado y visible"
                          : "El producto está en borrador"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch
                        id="published"
                        checked={isPublished}
                        onCheckedChange={setIsPublished}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className={isPublished ? "bg-zinc-700 hover:bg-zinc-600" : "bg-pink-600 hover:bg-pink-700"}
                        onClick={handleToggleVisibility}
                      >
                        {isPublished ? "Ocultar producto" : "Publicar producto"}
                      </Button>
                    </div>
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
