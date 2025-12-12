"use client"

import { Suspense } from "react"
import BuscarClient from "./buscar-client"

export default function BuscarPage() {
  return (
    <Suspense fallback={<main className="pt-40 px-4">Cargando búsqueda...</main>}>
      <BuscarClient />
    </Suspense>
  )
}
