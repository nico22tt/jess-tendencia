export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div>
        <p className="mt-4 text-zinc-400">Cargando usuarios...</p>
      </div>
    </div>
  )
}
