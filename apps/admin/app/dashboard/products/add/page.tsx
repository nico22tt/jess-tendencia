"use client"

import { useState } from "react"
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

interface UploadedImage {
  id: string
  url: string
  isMain: boolean
}

export default function AddProductPage() {
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
  const [isPublished, setIsPublished] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([
    { id: "1", url: "/white-sneakers-for-women.png", isMain: true },
    { id: "2", url: "/pink-casual-sneakers-for-women.png", isMain: false },
    { id: "3", url: "/black-running-sneakers-for-women.png", isMain: false },
  ])

  const handleSetMainImage = (imageId: string) => {
    setUploadedImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === imageId })))
  }

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleSaveProduct = () => {
    console.log("[v0] Saving product:", {
      productName,
      description,
      urlSlug,
      sku,
      basePrice,
      salePrice,
      stock,
      category,
      subcategory,
      brand,
      isPublished,
      uploadedImages,
    })
    alert("Producto guardado exitosamente (simulación)")
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
              <Button onClick={handleSaveProduct} className="bg-pink-600 hover:bg-pink-700 text-white">
                Guardar Producto
              </Button>
            </div>

            {/* Two Column Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Main Information */}
              <div className="space-y-6">
                {/* General Information */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Información General</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productName" className="text-zinc-300">
                        Nombre del Producto
                      </Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ej: Zapatillas Urbanas Blancas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-zinc-300">
                        Descripción Larga
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el producto en detalle..."
                        rows={6}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="urlSlug" className="text-zinc-300">
                        URL Slug
                      </Label>
                      <Input
                        id="urlSlug"
                        value={urlSlug}
                        onChange={(e) => setUrlSlug(e.target.value)}
                        placeholder="zapatillas-urbanas-blancas"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </Card>

                {/* Images and Gallery */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Imágenes y Galería</h2>

                  {/* Drag and Drop Area */}
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-pink-600 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                    <p className="text-zinc-400 mb-1">Arrastra y suelta imágenes aquí</p>
                    <p className="text-sm text-zinc-500">o haz clic para seleccionar archivos</p>
                  </div>

                  {/* Uploaded Images Thumbnails */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Imágenes Subidas</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square rounded-lg bg-zinc-800 overflow-hidden">
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt="Product"
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Remove Button */}
                              <Button variant="ghost" size="icon" aria-label="Eliminar imagen">
                                <X className="h-4 w-4" />
                              </Button>


                          {/* Set as Main Button */}
                          <button
                            onClick={() => handleSetMainImage(image.id)}
                            className={`mt-2 w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                              image.isMain ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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
                  </div>
                </Card>
              </div>

              {/* Right Column - Inventory and Classification */}
              <div className="space-y-6">
                {/* Inventory and Pricing */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Inventario y Precios</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sku" className="text-zinc-300">
                        SKU
                      </Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="ZAP-001"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="basePrice" className="text-zinc-300">
                        Precio Base (CLP)
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="45990"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
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
                      <Label htmlFor="stock" className="text-zinc-300">
                        Cantidad en Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="25"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </Card>

                {/* Classification */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Clasificación</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category" className="text-zinc-300">
                        Categoría Principal
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="zapatillas" className="text-white">
                            Zapatillas
                          </SelectItem>
                          <SelectItem value="botas" className="text-white">
                            Botas
                          </SelectItem>
                          <SelectItem value="botines" className="text-white">
                            Botines
                          </SelectItem>
                          <SelectItem value="jeans" className="text-white">
                            Jeans
                          </SelectItem>
                          <SelectItem value="pantuflas" className="text-white">
                            Pantuflas
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subcategory" className="text-zinc-300">
                        Subcategoría
                      </Label>
                      <Select value={subcategory} onValueChange={setSubcategory}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="urbanas" className="text-white">
                            Urbanas
                          </SelectItem>
                          <SelectItem value="deportivas" className="text-white">
                            Deportivas
                          </SelectItem>
                          <SelectItem value="casuales" className="text-white">
                            Casuales
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="brand" className="text-zinc-300">
                        Marca
                      </Label>
                      <Select value={brand} onValueChange={setBrand}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecciona una marca" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="nike" className="text-white">
                            Nike
                          </SelectItem>
                          <SelectItem value="adidas" className="text-white">
                            Adidas
                          </SelectItem>
                          <SelectItem value="puma" className="text-white">
                            Puma
                          </SelectItem>
                          <SelectItem value="vans" className="text-white">
                            Vans
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Visibility */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Visibilidad</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="published" className="text-zinc-300">
                        Estado del Producto
                      </Label>
                      <p className="text-sm text-zinc-500 mt-1">
                        {isPublished ? "El producto está publicado y visible" : "El producto está en borrador"}
                      </p>
                    </div>
                    <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
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
