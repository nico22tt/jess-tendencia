import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@jess/shared/contexts/auth-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin - Jess Tendencia",
  description: "Panel de administración",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        {/* Variables CSS para tu tema oscuro */}
        <style>{`
          :root {
            --background: 18 7% 8%;        /* ≈ bg-zinc-950 en HSL (tailwind estándar) */
            --foreground: 0 0% 98%;        /* ≈ text-zinc-100 */
            --card: 240 4% 16%;
            --card-foreground: 0 0% 98%;
            --popover: 240 4% 16%;
            --popover-foreground: 0 0% 98%;
            --primary: 291 89% 68%;
            --primary-foreground: 0 0% 100%;
            --secondary: 220 13% 18%;
            --secondary-foreground: 0 0% 98%;
            --muted: 240 4% 20%;
            --muted-foreground: 225 5% 70%;
            --accent: 291 89% 68%;
            --accent-foreground: 0 0% 100%;
            --destructive: 0 80% 60%;
            --destructive-foreground: 0 0% 98%;
            --border: 240 4% 20%;
            --input: 240 4% 22%;
            --ring: 291 89% 68%;
            --radius: 1rem;
            --chart-1: 265 85% 77%;
            --chart-2: 152 62% 51%;
            --chart-3: 42 90% 60%;
            --chart-4: 340 82% 52%;
            --chart-5: 198 89% 48%;
          }
        `}</style>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
