import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ClientLayout } from "./client-layout"
import { Sidebar } from "@jess/shared/components/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://jesstendencia.cl"),
  title: {
    default: "Jess Tendencia - Moda y Calzado para Mujer",
    template: "%s | Jess Tendencia",
  },
  description:
    "Descubre la última moda en zapatillas, botas, botines, pantuflas y jeans para mujer. Envío gratis en compras sobre $50.000. Las mejores marcas y tendencias en Jess Tendencia.",
  keywords: [
    "zapatillas mujer",
    "botas mujer",
    "botines",
    "pantuflas",
    "jeans mujer",
    "moda femenina",
    "calzado mujer",
    "ropa mujer",
    "tendencias",
  ],
  authors: [{ name: "Jess Tendencia" }],
  creator: "Jess Tendencia",
  publisher: "Jess Tendencia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://jesstendencia.cl",
    siteName: "Jess Tendencia",
    title: "Jess Tendencia - Moda y Calzado para Mujer",
    description:
      "Descubre la última moda en zapatillas, botas, botines, pantuflas y jeans para mujer. Envío gratis en compras sobre $50.000.",
    images: [
      {
        url: "/jess-tendencia-logo.png",
        width: 1200,
        height: 630,
        alt: "Jess Tendencia Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jess Tendencia - Moda y Calzado para Mujer",
    description:
      "Descubre la última moda en zapatillas, botas, botines, pantuflas y jeans para mujer. Envío gratis en compras sobre $50.000.",
    images: ["/jess-tendencia-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className="font-body bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen">
        <ClientLayout>
          <div className="flex min-h-screen">
            {/* Sidebar siempre visible en desktop */}
            <Sidebar />
            {/* Contenido principal con margen para sidebar */}
            <main className="flex-1 lg:ml-72 pt-4 lg:pt-0 w-full">
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}
