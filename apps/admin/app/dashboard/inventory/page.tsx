"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@utils/supabase/client"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Badge } from "@jess/ui/badge"
import { ScrollArea } from "@jess/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@jess/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jess/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jess/ui/select"
import {
  Package,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  History,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Loader2,
  Boxes,
} from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  category: string
  lastUpdated: string
  minStock: number
}

interface ProductVariant {
  id: string
  productId: string
  productName: string
  sku: string
  size: string | null
  color: string | null
  stock: number
  priceAdjustment: number
  isActive: boolean
}

type StockStatus = "available" | "low" | "critical" | "out"

const getStockStatus = (stock: number, minStock: number): StockStatus => {
  if (stock === 0) return "out"
  if (stock <= minStock * 0.3) return "critical"
  if (stock <= minStock) return "low"
  return "available"
}

const statusConfig = {
  available: { label: "Disponible", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  low: { label: "Stock Bajo", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  critical: { label: "Stock Crítico", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  out: { label: "Agotado", color: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export default function InventoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  
  // Estados para productos
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [productFilterStatus, setProductFilterStatus] = useState<string>("all")
  const [productFilterCategory, setProductFilterCategory] = useState<string>("all")

  // Estados para variantes
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [variantSearchQuery, setVariantSearchQuery] = useState("")
  const [variantFilterSize, setVariantFilterSize] = useState<string>("all")
  const [variantFilterColor, setVariantFilterColor] = useState<string>("all")
  const [variantFilterStatus, setVariantFilterStatus] = useState<string>("all")

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (activeTab === "variants" && variants.length === 0) {
      fetchVariants()
    }
  }, [activeTab])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(user)
    setLoading(false)
  }

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const res = await fetch("/api/inventory")
      const data = await res.json()

      if (data.success) {
        setProducts(data.data)
      } else {
        alert("Error al cargar productos")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar productos")
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchVariants = async () => {
    try {
      setVariantsLoading(true)
      const res = await fetch("/api/inventory/variants")
      const data = await res.json()

      if (data.success) {
        setVariants(data.data)
      } else {
        alert("Error al cargar variantes")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar variantes")
    } finally {
      setVariantsLoading(false)
    }
  }

  const getVariantStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-red-500/10 text-red-400 border-red-500/20" }
    if (stock <= 5) return { label: "Bajo", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" }
    return { label: "Disponible", color: "bg-green-500/10 text-green-400 border-green-500/20" }
  }

  // Filtrado de productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearchQuery.toLowerCase())

    const status = getStockStatus(product.stock, product.minStock)
    const matchesStatus = productFilterStatus === "all" || status === productFilterStatus
    const matchesCategory = productFilterCategory === "all" || product.category === productFilterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Filtrado de variantes
  const filteredVariants = variants.filter((variant) => {
    const matchesSearch =
      variant.productName.toLowerCase().includes(variantSearchQuery.toLowerCase()) ||
      variant.sku.toLowerCase().includes(variantSearchQuery.toLowerCase()) ||
      variant.size?.toLowerCase().includes(variantSearchQuery.toLowerCase()) ||
      variant.color?.toLowerCase().includes(variantSearchQuery.toLowerCase())

    const matchesSize = variantFilterSize === "all" || variant.size === variantFilterSize
    const matchesColor = variantFilterColor === "all" || variant.color === variantFilterColor

    const status = getVariantStockStatus(variant.stock).label
    const matchesStatus = variantFilterStatus === "all" || status === variantFilterStatus

    return matchesSearch && matchesSize && matchesColor && matchesStatus
  })

  const categories = Array.from(new Set(products.map((p) => p.category)))
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))

  // Stats para productos
  const productStats = {
    available: products.filter((p) => getStockStatus(p.stock, p.minStock) === "available").length,
    low: products.filter((p) => getStockStatus(p.stock, p.minStock) === "low").length,
    critical: products.filter((p) => getStockStatus(p.stock, p.minStock) === "critical").length,
    out: products.filter((p) => getStockStatus(p.stock, p.minStock) === "out").length,
  }

  // Stats para variantes
  const variantStats = {
    available: variants.filter((v) => getVariantStockStatus(v.stock).label === "Disponible").length,
    low: variants.filter((v) => getVariantStockStatus(v.stock).label === "Bajo").length,
    out: variants.filter((v) => getVariantStockStatus(v.stock).label === "Agotado").length,
  }

  if (loading || productsLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
      </div>
    )
  }

  return (
    <AdminDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-600/10 rounded-lg">
              <Package className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestionar Inventario</h1>
              <p className="text-muted-foreground mt-1">Monitorea y ajusta el stock de tus productos</p>
            </div>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar Inventario
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Por Producto
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            >
              <Boxes className="h-4 w-4 mr-2" />
              Por Tallas/Colores
            </TabsTrigger>
          </TabsList>

          {/* Tab: Vista por Producto */}
          <TabsContent value="products" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                    <p className="text-2xl font-bold text-green-400">{productStats.available}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-400">{productStats.low}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Crítico</p>
                    <p className="text-2xl font-bold text-orange-400">{productStats.critical}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Agotados</p>
                    <p className="text-2xl font-bold text-red-400">{productStats.out}</p>
                  </div>
                  <Package className="h-8 w-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="pl-9 bg-muted border-border text-foreground"
                  />
                </div>
                <Select value={productFilterStatus} onValueChange={setProductFilterStatus}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="low">Stock Bajo</SelectItem>
                    <SelectItem value="critical">Stock Crítico</SelectItem>
                    <SelectItem value="out">Agotado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productFilterCategory} onValueChange={setProductFilterCategory}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-card">
                      <TableHead className="text-foreground">Producto</TableHead>
                      <TableHead className="text-foreground">SKU</TableHead>
                      <TableHead className="text-foreground">Categoría</TableHead>
                      <TableHead className="text-foreground">Stock Actual</TableHead>
                      <TableHead className="text-foreground">Estado</TableHead>
                      <TableHead className="text-foreground">Última Act.</TableHead>
                      <TableHead className="text-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock, product.minStock)
                      const config = statusConfig[status]

                      return (
                        <TableRow key={product.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <span className="text-foreground font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{product.sku}</TableCell>
                          <TableCell className="text-foreground">{product.category}</TableCell>
                          <TableCell>
                            <span className="text-foreground font-semibold">{product.stock}</span>
                            <span className="text-muted-foreground text-sm ml-1">unidades</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{product.lastUpdated}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted"
                                onClick={() => router.push(`/dashboard/inventory/${product.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted"
                                onClick={() => router.push(`/dashboard/inventory/${product.id}/history`)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted"
                                onClick={() => router.push(`/dashboard/products/edit/${product.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab: Vista por Variantes */}
          <TabsContent value="variants" className="space-y-6 mt-6">
            {variantsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Disponibles</p>
                        <p className="text-2xl font-bold text-green-400">{variantStats.available}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Stock Bajo</p>
                        <p className="text-2xl font-bold text-yellow-400">{variantStats.low}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Agotados</p>
                        <p className="text-2xl font-bold text-red-400">{variantStats.out}</p>
                      </div>
                      <Package className="h-8 w-8 text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar variante..."
                        value={variantSearchQuery}
                        onChange={(e) => setVariantSearchQuery(e.target.value)}
                        className="pl-9 bg-muted border-border text-foreground"
                      />
                    </div>
                    <Select value={variantFilterSize} onValueChange={setVariantFilterSize}>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue placeholder="Filtrar por talla" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        <SelectItem value="all">Todas las tallas</SelectItem>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size!}>
                            Talla {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={variantFilterColor} onValueChange={setVariantFilterColor}>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue placeholder="Filtrar por color" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        <SelectItem value="all">Todos los colores</SelectItem>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color!}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={variantFilterStatus} onValueChange={setVariantFilterStatus}>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Bajo">Bajo</SelectItem>
                        <SelectItem value="Agotado">Agotado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-card">
                          <TableHead className="text-foreground">Producto</TableHead>
                          <TableHead className="text-foreground">SKU</TableHead>
                          <TableHead className="text-foreground">Talla</TableHead>
                          <TableHead className="text-foreground">Color</TableHead>
                          <TableHead className="text-foreground">Stock</TableHead>
                          <TableHead className="text-foreground">Estado</TableHead>
                          <TableHead className="text-foreground">Ajuste Precio</TableHead>
                          <TableHead className="text-foreground text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVariants.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                              No se encontraron variantes
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredVariants.map((variant) => {
                            const status = getVariantStockStatus(variant.stock)

                            return (
                              <TableRow key={variant.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                      <Boxes className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="text-foreground font-medium">{variant.productName}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-foreground">{variant.sku}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-border text-foreground">
                                    {variant.size || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {variant.color ? (
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border border-border"
                                        style={{ backgroundColor: variant.color.toLowerCase() }}
                                      />
                                      <span className="text-foreground">{variant.color}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-foreground font-semibold">{variant.stock}</span>
                                  <span className="text-muted-foreground text-sm ml-1">und</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={status.color}>
                                    {status.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {variant.priceAdjustment > 0 ? "+" : ""}
                                  ${variant.priceAdjustment}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-border text-foreground hover:bg-muted"
                                      onClick={() =>
                                        router.push(`/dashboard/inventory/variants/${variant.id}/edit`)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  )
}
