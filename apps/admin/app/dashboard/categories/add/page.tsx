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
import { Upload } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
}

export default function AddCategoryPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [description, setDescription] = useState("")
  const [urlSlug, setUrlSlug] = useState("")
  const [parentCategory, setParentCategory] = useState("")
  const [displayOrder, setDisplayOrder] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [categoryImage, setCategoryImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Cargar categorías para el selector de padre
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
    setCategoryName(name)
    
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    setUrlSlug(slug)
  }

  const handleSaveCategory = async () => {
    if (!categoryName.trim() || !urlSlug.trim()) {
      alert("El nombre y el slug son obligatorios")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryName,
          description: description || null,
          slug: urlSlug,
          imageUrl: categoryImage || null,
          parentId: parentCategory && parentCategory !== "none" ? parentCategory : null,
          displayOrder: displayOrder ? parseInt(displayOrder) : 0,
          isActive
        })
      })

      const data = await res.json()

      if (data.success) {
        alert("✅ Categoría creada exitosamente")
        router.push('/dashboard/products')
      } else {
        alert("❌ Error: " + data.error)
      }
    } catch (error) {
      console.error('Error al crear categoría:', error)
      alert("❌ Error al crear la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold  text-foreground">Crear Nueva Categoría</h1>
                <p className="text-muted-foreground mt-1">Organiza tus productos en categorías</p>
              </div>
              <Button 
                onClick={handleSaveCategory} 
                disabled={isLoading}
                className="bg-pink-600 hover:bg-pink-700  text-foreground disabled:bg-gray-600"
              >
                {isLoading ? 'Guardando...' : 'Guardar Categoría'}
              </Button>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-card border-border p-6">
                <h2 className="text-xl font-semibold  text-foreground mb-4">Información Básica</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName" className="text-foreground">
                      Nombre de la Categoría *
                    </Label>
                    <Input
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej: Ropa de Mujer"
                      className="bg-muted border-border  text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="urlSlug" className="text-foreground">
                      URL Slug *
                    </Label>
                    <Input
                      id="urlSlug"
                      value={urlSlug}
                      onChange={(e) => setUrlSlug(e.target.value)}
                      placeholder="ropa-de-mujer"
                      className="bg-muted border-border  text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Se genera automáticamente, pero puedes editarlo
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe la categoría..."
                      rows={4}
                      className="bg-muted border-border  text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </Card>

              {/* Category Image */}
              <Card className="bg-card border-border p-6">
                <h2 className="text-xl font-semibold  text-foreground mb-4">Imagen de Categoría</h2>

                <div className="flex items-start gap-6">
                  {/* Image Preview */}
                  <div className="w-48 h-48 rounded-lg bg-mutedoverflow-hidden flex-shrink-0">
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
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-foreground">
                        URL de la Imagen
                      </Label>
                      <Input
                        id="imageUrl"
                        value={categoryImage}
                        onChange={(e) => setCategoryImage(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="bg-muted border-border  text-foreground placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Por ahora ingresa una URL de imagen. Recomendado: 800x800px
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Organization */}
              <Card className="bg-card border-border p-6">
                <h2 className="text-xl font-semibold  text-foreground mb-4">Organización</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parentCategory" className="text-foreground">
                      Categoría Padre (Opcional)
                    </Label>
                    <Select value={parentCategory} onValueChange={setParentCategory}>
                      <SelectTrigger className="bg-muted border-border  text-foreground">
                        <SelectValue placeholder="Ninguna (Categoría principal)" />
                      </SelectTrigger>
                      <SelectContent className="bg-mutedborder-border">
                        <SelectItem value="none" className=" text-foreground">
                          Ninguna (Categoría principal)
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className=" text-foreground">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selecciona una categoría padre para crear una subcategoría
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="displayOrder" className="text-foreground">
                      Orden de Visualización
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      placeholder="0"
                      className="bg-muted border-border  text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Número menor aparece primero en el menú (ej: 1, 2, 3...)
                    </p>
                  </div>
                </div>
              </Card>

              {/* Visibility */}
              <Card className="bg-card border-border p-6">
                <h2 className="text-xl font-semibold  text-foreground mb-4">Visibilidad</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active" className="text-foreground">
                      Estado de la Categoría
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
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
