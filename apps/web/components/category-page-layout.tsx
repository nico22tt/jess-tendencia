import type { ReactNode } from "react"

interface CategoryPageLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function CategoryPageLayout({ title, description, children }: CategoryPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 to-white">
      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto my-16">
          {/* Page Header */}
          <div className="text-center mb-0.5">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
