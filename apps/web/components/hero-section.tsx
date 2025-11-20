"use client"

import { Button } 

from "@jess/ui/button"
import { useAuth } 
from "@jess/shared/contexts/auth"



export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/elegant-fashion-model-wearing-trendy-outfit-in-sof.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20 my-0 mt-0" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-6 max-w-2xl mt-32">
        {user ? (
          <>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">¡Hola, {user.name}!</h2>
            <p className="text-2xl md:text-3xl mb-6 text-white/95 font-medium">¿Lista para renovar tu estilo?</p>
            <p className="text-lg mb-8 text-white/80">
              Descubre las últimas tendencias seleccionadas especialmente para ti
            </p>
          </>
        ) : (
          <>
            <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Moda con
              <span className="block text-primary">Personalidad</span>
            </h2>
            <p className="text-xl mb-8 text-white/90 font-medium">
              Descubre las últimas tendencias que reflejan tu estilo único
            </p>
          </>
        )}
        {/* </CHANGE> */}

        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3 text-lg"
        >
          Explorar Colección
        </Button>
      </div>
    </section>
  )
}
