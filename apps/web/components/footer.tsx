import { Instagram, Music } from "lucide-react"
import { Button } from "@jess/ui/button"


export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo y descripción */}
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold text-primary">Jess Tendencia</h3>
              <p className="text-muted-foreground">
                Tu destino para la moda femenina más actual. Encuentra tu estilo único con nuestras colecciones
                cuidadosamente seleccionadas.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-semibold text-foreground">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Política de Envíos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Devoluciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="space-y-4">
              <h4 className="font-heading text-lg font-semibold text-foreground">Síguenos</h4>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  <Music className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Mantente al día con las últimas tendencias y ofertas especiales.
              </p>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2025 Jess Tendencia. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
