"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@jess/shared/contexts/cart"
import { Button } from "@jess/ui/button"
import { Input } from "@jess/ui/input"
import { Textarea } from "@jess/ui/textarea"
import Link from "next/link"

// Simulador para obtener user autenticado
const useUser = () => {
  // Aquí deberías conectar con tu auth real.
  return { user: { id: "c46bde8c-b25e-4db1-b7d4-626afd8ea131", email: "cliente@ejemplo.com", name: "Client Name" } }
}

type Address = {
  id: string
  alias: string
  recipient_name: string
  phone_number: string
  address_line_1: string
  address_line_2?: string
  city: string
  region: string
  zip_code: string
  is_default: boolean
}

// Obtener direcciones reales de la BD mediante API REST
async function fetchUserAddresses(userId: string): Promise<Address[]> {
  const resp = await fetch(`/api/user/addresses?user_id=${userId}`, { cache: 'no-store' })
  if (!resp.ok) return []
  return await resp.json()
}

// Crear nueva dirección en BD vía API REST
async function saveAddress(userId: string, data: Omit<Address, 'id' | 'is_default'>) {
  const resp = await fetch(`/api/user/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, user_id: userId }),
  })
  if (!resp.ok) throw new Error("Error guardando dirección")
  return await resp.json()
}

// Crear una orden nueva vía API REST
async function createOrder(orderData: any) {
  const resp = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  })
  if (!resp.ok) throw new Error("Error creando la orden")
  return await resp.json()
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useUser()
  const router = useRouter()

  // State direcciones
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id' | 'is_default'>>({
    alias: "",
    recipient_name: "",
    phone_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    region: "",
    zip_code: ""
  })
  const [shippingMethod, setShippingMethod] = useState("delivery")
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // Obtener direcciones al montar el componente
  useEffect(() => {
    if (user?.id) {
      fetchUserAddresses(user.id)
        .then(addrs => {
          setAddresses(addrs)
          if (addrs && addrs.length) {
            const def = addrs.find(a => a.is_default) || addrs[0]
            setSelectedAddress(def.id)
          }
        })
    }
  }, [user])

  // Input handlers
  const handleForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleNewAddr = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewAddr(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // Crear nueva dirección
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    const addr = await saveAddress(user.id, newAddr)
    setAddresses(prev => [...prev, addr])
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
      zip_code: ""
    })
  }

  // Confirmar orden y registrar en la BD (redirigir a detalle de orden)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || (shippingMethod === "delivery" && !selectedAddress)) {
      alert("Por favor completa todos los campos obligatorios.")
      return
    }
    setIsSubmitting(true)
    try {
      const orderData = {
        user_id: user.id,
        user_address_id: shippingMethod === "delivery" ? selectedAddress : null,
        shipping_method: shippingMethod,
        client_name: form.name,
        client_email: form.email,
        client_phone: form.phone,
        notes: form.notes,
        total,
        items: items.map(it => ({
          product_id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          size: it.size || null
        }))
      }
      // POST a tu endpoint real
      const { order_id } = await createOrder(orderData)

      clearCart()
      router.push(`/ordenes/${order_id}`) // Redirige a detalle pedido
    } catch (err) {
      alert("Error creando la orden. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  if (!items.length) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl mb-6">Finalizar compra</h1>
        <p className="mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="text-pink-600 underline">Volver a la tienda</Link>
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
          {items.map(item => (
            <li key={item.size ? `${item.id}-${item.size}` : item.id} className="flex justify-between py-2">
              <span>{item.name} {item.size && `(Talla: ${item.size})`} x{item.quantity}</span>
              <span className="font-semibold text-pink-600">{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="text-right font-bold text-xl mt-2">
          Total: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(total)}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Datos cliente */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Tus datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Nombre completo *</label>
              <Input name="name" value={form.name} onChange={handleForm} required />
            </div>
            <div>
              <label className="block mb-1">Correo electrónico *</label>
              <Input name="email" value={form.email} onChange={handleForm} disabled={!!user.email} required />
            </div>
            <div>
              <label className="block mb-1">Teléfono *</label>
              <Input name="phone" value={form.phone} onChange={handleForm} required />
            </div>
          </div>
        </section>

        {/* Envío */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Envío</h2>
          <div className="space-y-2 mb-2">
            <label><input type="radio" name="shipping" checked={shippingMethod === "delivery"} onChange={() => setShippingMethod("delivery")} /> Envío a domicilio</label>
            <label><input type="radio" name="shipping" checked={shippingMethod === "retiro_loja"} onChange={() => setShippingMethod("retiro_loja")} /> Retiro en local</label>
          </div>
          {shippingMethod === "delivery" && (
            <div>
              <label htmlFor="shipping-address" className="block mb-1 font-medium">Dirección de envío *</label>
              {addresses.length > 0 ? (
                <div>
                  <select
                    id="shipping-address"
                    aria-label="Dirección de envío"
                    className="w-full border px-2 py-2 rounded"
                    value={selectedAddress}
                    onChange={e => setSelectedAddress(e.target.value)}
                  >
                    {addresses.map(addr =>
                      <option key={addr.id} value={addr.id}>
                        {addr.alias ? `${addr.alias} - ` : ""}
                        {addr.address_line_1}, {addr.city}, {addr.region} {addr.zip_code}
                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                      </option>
                    )}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 text-pink-600 border-pink-200"
                    onClick={() => setShowNewAddress(v => !v)}
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
                >Agregar dirección</Button>
              )}

              {showNewAddress && (
                <form onSubmit={handleCreateAddress} className="mt-2 space-y-2 bg-pink-25 p-4 rounded">
                  <div>
                    <label className="block mb-1">Alias *</label>
                    <Input name="alias" value={newAddr.alias} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Destinatario *</label>
                    <Input name="recipient_name" value={newAddr.recipient_name} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Teléfono contacto *</label>
                    <Input name="phone_number" value={newAddr.phone_number} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Dirección *</label>
                    <Input name="address_line_1" value={newAddr.address_line_1} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Depto, of, piso... (opcional)</label>
                    <Input name="address_line_2" value={newAddr.address_line_2} onChange={handleNewAddr} />
                  </div>
                  <div>
                    <label className="block mb-1">Ciudad *</label>
                    <Input name="city" value={newAddr.city} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Región *</label>
                    <Input name="region" value={newAddr.region} onChange={handleNewAddr} required />
                  </div>
                  <div>
                    <label className="block mb-1">Código postal *</label>
                    <Input name="zip_code" value={newAddr.zip_code} onChange={handleNewAddr} required />
                  </div>
                  <Button type="submit" className="w-full">Guardar dirección</Button>
                </form>
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
