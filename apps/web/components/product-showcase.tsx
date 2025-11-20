import { Button } 

from "@jess/ui/button"
import { Card, CardContent } 

from "@jess/ui/card"

interface Product {
  id: string
  name: string
  price: string
  image: string
  category: string
}

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Zapatillas Urban Style",
    price: "$89.99",
    image: "/trendy-white-sneakers-for-women.png",
    category: "Calzado",
  },
  {
    id: "2",
    name: "Botas Chelsea Elegantes",
    price: "$129.99",
    image: "/elegant-black-chelsea-boots-for-women.png",
    category: "Calzado",
  },
  {
    id: "3",
    name: "Jeans Skinny Fit",
    price: "$69.99",
    image: "/stylish-blue-skinny-jeans-for-women.png",
    category: "Jeans",
  },
  {
    id: "4",
    name: "Botines con Tacón",
    price: "$99.99",
    image: "/fashionable-heeled-ankle-boots-in-beige.png",
    category: "Calzado",
  },
  {
    id: "5",
    name: "Jeans Mom Fit",
    price: "$74.99",
    image: "/trendy-mom-fit-jeans-in-light-blue-wash.png",
    category: "Jeans",
  },
  {
    id: "6",
    name: "Zapatillas Deportivas",
    price: "$94.99",
    image: "/modern-athletic-sneakers-in-pink-and-white.png",
    category: "Calzado",
  },
]

export function ProductShowcase() {
  return (
    <section className="py-16 px-6 mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl font-bold text-foreground mb-4">Productos Destacados</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre nuestra selección especial de productos que están marcando tendencia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-border bg-card">
              <CardContent className="p-0">
                <div className="aspect-[4/5] overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-accent">{product.price}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                    >
                      Ver más
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
