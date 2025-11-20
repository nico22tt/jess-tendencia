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
import { Upload } from "lucide-react"
import Image from "next/image"

export default function AddCategoryPage() {
  const [categoryName, setCategoryName] = useState("")
  const [description, setDescription] = useState("")
  const [urlSlug, setUrlSlug] = useState("")
  const [parentCategory, setParentCategory] = useState("")
  const [displayOrder, setDisplayOrder] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [categoryImage, setCategoryImage] = useState("/placeholder.svg?height=200&width=200")

  const handleSaveCategory = () => {
    console.log("[v0] Saving category:", {
      categoryName,
      description,
      urlSlug,
      parentCategory,
      displayOrder,
      isActive,
      categoryImage,
    })
    alert("Categoría guardada exitosamente (simulación)")
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Crear Nueva Categoría</h1>
                <p className="text-zinc-400 mt-1">Organiza tus productos en categorías</p>
              </div>
              <Button onClick={handleSaveCategory} className="bg-pink-600 hover:bg-pink-700 text-white">
                Guardar Categoría
              </Button>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Información Básica</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName" className="text-zinc-300">
                      Nombre de la Categoría
                    </Label>
                    <Input
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Ej: Zapatillas"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-zinc-300">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe la categoría..."
                      rows={4}
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
                      placeholder="zapatillas"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Category Image */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Imagen de Categoría</h2>

                <div className="flex items-start gap-6">
                  {/* Image Preview */}
                  <div className="w-48 h-48 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                    <Image
                      src={categoryImage || "/placeholder.svg"}
                      alt="Category"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Upload Area */}
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-pink-600 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                      <p className="text-zinc-400 mb-1">Arrastra y suelta una imagen aquí</p>
                      <p className="text-sm text-zinc-500">o haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-zinc-600 mt-2">Recomendado: 800x800px, formato JPG o PNG</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Organization */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Organización</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parentCategory" className="text-zinc-300">
                      Categoría Padre (Opcional)
                    </Label>
                    <Select value={parentCategory} onValueChange={setParentCategory}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Ninguna (Categoría principal)" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="none" className="text-white">
                          Ninguna (Categoría principal)
                        </SelectItem>
                        <SelectItem value="calzado" className="text-white">
                          Calzado
                        </SelectItem>
                        <SelectItem value="ropa" className="text-white">
                          Ropa
                        </SelectItem>
                        <SelectItem value="accesorios" className="text-white">
                          Accesorios
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-zinc-500 mt-1">
                      Selecciona una categoría padre para crear una subcategoría
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="displayOrder" className="text-zinc-300">
                      Orden de Visualización
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      placeholder="1"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <p className="text-sm text-zinc-500 mt-1">
                      Número menor aparece primero en el menú (ej: 1, 2, 3...)
                    </p>
                  </div>
                </div>
              </Card>

              {/* Visibility */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Visibilidad</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active" className="text-zinc-300">
                      Estado de la Categoría
                    </Label>
                    <p className="text-sm text-zinc-500 mt-1">
                      {isActive ? "La categoría está activa y visible" : "La categoría está oculta"}
                    </p>
                  </div>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
