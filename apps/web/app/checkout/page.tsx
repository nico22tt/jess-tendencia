"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Textarea } from "@jess/ui/textarea"
import Link from "next/link"
import { useCheckoutCart } from "@jess/shared/hooks/useCheckoutCart"
import { useUserAddresses, Address } from "@jess/shared/hooks/useUserAddresses"
import { createClient } from "@utils/supabase/client"

// Hook para obtener el user real de Supabase
function useSupabaseUser() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [supabase])

  return { user, loading }
}

async function saveAddress(
  userId: string,
  data: Omit<Address, "id" | "is_default">,
) {
  const resp = await fetch(`/api/user/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, user_id: userId }),
  })
  if (!resp.ok) throw new Error("Error guardando dirección")
  return await resp.json()
}

async function createOrder(orderData: any) {
  const resp = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  })
  if (!resp.ok) {
    const error = await resp.json()
    throw new Error(error.error || "Error creando la orden")
  }
  return await resp.json()
}

async function clearCartInDb(userId: string, items: any[]) {
  await Promise.all(
    items.map((item) =>
      fetch(`/api/cart?userId=${userId}&productId=${item.product_id}`, {
        method: "DELETE",
      }),
    ),
  )
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useSupabaseUser()
  const userId = user?.id
  const router = useRouter()

  const { items, total, loading: cartLoading, getCartItemPrice } =
    useCheckoutCart(userId)
  const { addresses, selectedAddress, setSelectedAddress, setAddresses } =
    useUserAddresses(userId)

  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "is_default">>({
    alias: "",
    recipient_name: "",
    phone_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    region: "",
    zip_code: "",
  })
  const [shippingMethod, setShippingMethod] =
    useState<"delivery" | "retiro_loja">("delivery")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  // Proteger la página: redirigir si no hay usuario
  useEffect(() => {
    if (authLoading) return
    if (!user || !user.id) {
      alert("Debes iniciar sesión para acceder al checkout.")
      router.push("/login")
    }
  }, [user, authLoading, router])

  // cuando llega el user, rellenar datos si aún están vacíos
  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.user_metadata?.full_name || user.name || "",
      email: prev.email || user.email || "",
    }))
  }, [user])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))

  const handleNewAddr = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewAddr((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleCreateAddress = async () => {
    if (!userId) {
      alert("Debes iniciar sesión para continuar.")
      return
    }
    try {
      const addr = await saveAddress(userId, newAddr)
      setAddresses((prev: Address[]) => [...prev, addr])
      setSelectedAddress(addr.id)
      setShowNewAddress(false)
      setNewAddr({
        alias: "",
        recipient_name: "",
        phone_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        region: "",
        zip_code: "",
      })
    } catch (err) {
      console.error("Error guardando dirección:", err)
      alert("Error al guardar la dirección. Intenta de nuevo.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Revalidar sesión fresca con Supabase (importante en producción)
    const supabase = createClient()
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser || !currentUser.id) {
      alert("Tu sesión ha expirado. Por favor inicia sesión de nuevo.")
      router.push("/login")
      return
    }

    const realUserId = currentUser.id

    // Validación anti-usuario sincronizado/hardcoded
    if (realUserId === "25f597bd-fd93-4aa7-b50d-4900199cf474") {
      alert("Sesión inválida. Por favor cierra sesión y vuelve a iniciar.")
      router.push("/login")
      return
    }

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      (shippingMethod === "delivery" && !selectedAddress)
    ) {
      alert("Por favor completa todos los campos obligatorios.")
      return
    }

    if (!items.length) {
      alert("Tu carrito está vacío.")
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        user_id: realUserId,
        user_address_id: shippingMethod === "delivery" ? selectedAddress : null,
        shipping_method: shippingMethod,
        client_name: form.name,
        client_email: form.email,
        client_phone: form.phone,
        notes: form.notes,
        total,
        items: items.map((it: any) => ({
          product_id: it.product_id,
          name: it.products?.name,
          price: getCartItemPrice(it.products),
          quantity: it.quantity,
          size: it.size || null,
        })),
      }

      console.log("📦 Creando orden con user_id:", realUserId)
      console.log("📧 Email del usuario:", form.email)

      const { order_id } = await createOrder(orderData)
      await clearCartInDb(realUserId, items)
      router.push(`/checkout/${order_id}`)
    } catch (err: any) {
      console.error("Error en checkout:", err)
      alert(err.message || "Error creando la orden. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Verificando sesión...</div>
          <div className="text-sm text-gray-500">Por favor espera</div>
        </div>
      </main>
    )
  }

  if (!user || !userId) {
    return null
  }

  if (cartLoading) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl mb-6">Finalizar compra</h1>
        <p>Cargando tu carrito...</p>
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl mb-6">Finalizar compra</h1>
        <p className="mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="text-pink-600 underline">
          Volver a la tienda
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 mt-40">
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>

      {/* Resumen carrito */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Resumen del pedido</h2>
        <ul className="divide-y divide-gray-200">
          {items.map((item: any) => (
            <li
              key={`${item.product_id}-${item.size ?? "nosize"}`}
              className="flex justify-between py-2"
            >
              <span>
                {item.products?.name || "Producto"}{" "}
                {item.size && `(Talla: ${item.size})`} x{item.quantity}
              </span>
              <span className="font-semibold text-pink-600">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(
                  getCartItemPrice(item.products) * (item.quantity || 1),
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="text-right font-bold text-xl mt-2">
          Total:{" "}
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
          }).format(total)}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos cliente */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Tus datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Nombre completo *</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleForm}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Correo electrónico *</label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleForm}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Teléfono *</label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleForm}
                required
              />
            </div>
          </div>
        </section>

        {/* Envío */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Envío</h2>
          <div className="space-y-2 mb-2">
            <label>
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === "delivery"}
                onChange={() => setShippingMethod("delivery")}
              />{" "}
              Envío a domicilio
            </label>
            <label>
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === "retiro_loja"}
                onChange={() => setShippingMethod("retiro_loja")}
              />{" "}
              Retiro en local
            </label>
          </div>

          {shippingMethod === "delivery" && (
            <div>
              <label
                htmlFor="shipping-address"
                className="block mb-1 font-medium"
              >
                Dirección de envío *
              </label>
              {addresses.length > 0 ? (
                <div>
                  <select
                    id="shipping-address"
                    aria-label="Dirección de envío"
                    className="w-full border px-2 py-2 rounded"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.alias ? `${addr.alias} - ` : ""}
                        {addr.address_line_1}, {addr.city}, {addr.region}{" "}
                        {addr.zip_code}
                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 text-pink-600 border-pink-200"
                    onClick={() => setShowNewAddress((v) => !v)}
                  >
                    {showNewAddress ? "Cancelar" : "Crear nueva dirección"}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="text-pink-600 border-pink-200"
                  onClick={() => setShowNewAddress(true)}
                >
                  Agregar dirección
                </Button>
              )}

              {showNewAddress && (
                <div className="mt-2 space-y-2 bg-pink-25 p-4 rounded">
                  <div>
                    <label className="block mb-1">Alias *</label>
                    <Input
                      name="alias"
                      value={newAddr.alias}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Destinatario *</label>
                    <Input
                      name="recipient_name"
                      value={newAddr.recipient_name}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">
                      Teléfono contacto *
                    </label>
                    <Input
                      name="phone_number"
                      value={newAddr.phone_number}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Dirección *</label>
                    <Input
                      name="address_line_1"
                      value={newAddr.address_line_1}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">
                      Depto, of, piso... (opcional)
                    </label>
                    <Input
                      name="address_line_2"
                      value={newAddr.address_line_2}
                      onChange={handleNewAddr}
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Ciudad *</label>
                    <Input
                      name="city"
                      value={newAddr.city}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Región *</label>
                    <Input
                      name="region"
                      value={newAddr.region}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Código postal *</label>
                    <Input
                      name="zip_code"
                      value={newAddr.zip_code}
                      onChange={handleNewAddr}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleCreateAddress}
                  >
                    Guardar dirección
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Notas pedido */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Observaciones</h2>
          <Textarea
            name="notes"
            rows={2}
            placeholder="Ej: Favor entregar después de las 15:00"
            value={form.notes}
            onChange={handleForm}
          />
        </section>

        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 text-white px-10 py-4 text-lg w-full font-bold flex items-center justify-center"
          >
            {isSubmitting ? "Procesando..." : "Pagar con WebPay"}
          </Button>
        </div>
      </form>
    </main>
  )
}
