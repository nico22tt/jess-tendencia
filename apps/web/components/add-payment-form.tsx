"use client"

import type React from "react"

import { useState } from "react"
import { Button } 

from "@jess/ui/button"
import { Input } 

from "@jess/ui/input"
import { Label } 

from "@jess/ui/label"
import { CreditCard } from "lucide-react"

interface AddPaymentFormProps {
  onSubmit?: (data: PaymentFormData) => void
  onCancel?: () => void
}

interface PaymentFormData {
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

export default function AddPaymentForm({ onSubmit, onCancel }: AddPaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-pink-600 mb-4">Información de la Tarjeta</h3>

        <div className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-sm font-medium">
              Número de Tarjeta
            </Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\s/g, "")
                    .replace(/(\d{4})/g, "$1 ")
                    .trim()
                  setFormData((prev) => ({ ...prev, cardNumber: value }))
                }}
                maxLength={19}
                className="pl-10 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName" className="text-sm font-medium">
              Nombre del Titular
            </Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="NOMBRE APELLIDO"
              value={formData.cardholderName}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
              className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth" className="text-sm font-medium">
                Mes
              </Label>
              <Input
                id="expiryMonth"
                type="text"
                placeholder="MM"
                value={formData.expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                  if (value === "" || (Number.parseInt(value) >= 1 && Number.parseInt(value) <= 12)) {
                    setFormData((prev) => ({ ...prev, expiryMonth: value }))
                  }
                }}
                maxLength={2}
                className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear" className="text-sm font-medium">
                Año
              </Label>
              <Input
                id="expiryYear"
                type="text"
                placeholder="AA"
                value={formData.expiryYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                  setFormData((prev) => ({ ...prev, expiryYear: value }))
                }}
                maxLength={2}
                className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setFormData((prev) => ({ ...prev, cvv: value }))
                }}
                maxLength={4}
                className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium">
          Guardar Tarjeta
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
