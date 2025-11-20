"use client"

import { useState } from "react"
import { Button } from "@jess/ui/button"
import { ScrollArea } from "@jess/ui/scroll-area"
import { Badge } from "@jess/ui/badge"
import { Input } from "@jess/ui/input"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Reply, Archive, CheckCircle, Plus, Trash2, Search, Star, Tag, Filter, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jess/ui/select"

interface Message {
  id: string
  sender: string
  subject: string
  body: string
  date: string
  time: string
  isRead: boolean
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "María González",
    subject: "Consulta sobre pedido #1234",
    body: "Hola, quisiera saber el estado de mi pedido realizado hace 3 días. El número de orden es #1234. Agradezco su pronta respuesta.",
    date: "15 Ene",
    time: "10:30 AM",
    isRead: false,
  },
  {
    id: "2",
    sender: "Carlos Ramírez",
    subject: "Problema con el pago",
    body: "Buenos días, tuve un inconveniente al procesar el pago de mi compra. La transacción fue rechazada pero se descontó el dinero de mi cuenta. ¿Pueden ayudarme?",
    date: "15 Ene",
    time: "09:15 AM",
    isRead: false,
  },
  {
    id: "3",
    sender: "Ana Martínez",
    subject: "Solicitud de cambio de talla",
    body: "Hola, recibí mi pedido pero la talla no es la correcta. Necesito cambiar unas botas de talla 38 a talla 39. ¿Cuál es el procedimiento?",
    date: "14 Ene",
    time: "04:20 PM",
    isRead: true,
  },
  {
    id: "4",
    sender: "Pedro Sánchez",
    subject: "¿Cuándo llega mi pedido?",
    body: "Buenas tardes, realicé una compra hace una semana y aún no recibo información sobre el envío. ¿Podrían darme un estimado de entrega?",
    date: "14 Ene",
    time: "02:45 PM",
    isRead: true,
  },
  {
    id: "5",
    sender: "Laura Fernández",
    subject: "Excelente servicio",
    body: "Quiero felicitarlos por el excelente servicio. Recibí mi pedido en tiempo y forma, y la calidad de los productos es excepcional. ¡Seguiré comprando!",
    date: "13 Ene",
    time: "11:00 AM",
    isRead: true,
  },
  {
    id: "6",
    sender: "Roberto Torres",
    subject: "Consulta sobre devolución",
    body: "Hola, necesito información sobre la política de devoluciones. Compré unos jeans pero no me quedan bien. ¿Puedo devolverlos?",
    date: "13 Ene",
    time: "09:30 AM",
    isRead: true,
  },
  {
    id: "7",
    sender: "Valentina López",
    subject: "Producto defectuoso",
    body: "Buenos días, recibí unas zapatillas pero tienen un defecto en la suela. Me gustaría solicitar un cambio o reembolso. Adjunto fotos del problema.",
    date: "12 Ene",
    time: "03:15 PM",
    isRead: true,
  },
  {
    id: "8",
    sender: "Diego Morales",
    subject: "Pregunta sobre envío internacional",
    body: "Hola, estoy interesado en realizar una compra pero vivo en el extranjero. ¿Realizan envíos internacionales? ¿Cuáles son los costos adicionales?",
    date: "12 Ene",
    time: "10:20 AM",
    isRead: true,
  },
  {
    id: "9",
    sender: "Sofía Ruiz",
    subject: "Código de descuento no funciona",
    body: "Buenas tardes, intenté usar el código de descuento VERANO2025 pero me dice que no es válido. ¿Podrían verificar si aún está activo?",
    date: "11 Ene",
    time: "05:45 PM",
    isRead: true,
  },
  {
    id: "10",
    sender: "Javier Castro",
    subject: "Solicitud de factura",
    body: "Hola, realicé una compra la semana pasada (orden #5678) y necesito la factura para mi empresa. ¿Pueden enviarla a mi correo?",
    date: "11 Ene",
    time: "01:30 PM",
    isRead: true,
  },
]

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message>(mockMessages[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const handleMarkAsRead = () => {
    setMessages(messages.map((msg) => (msg.id === selectedMessage.id ? { ...msg, isRead: true } : msg)))
    setSelectedMessage({ ...selectedMessage, isRead: true })
  }

  const handleArchive = () => {
    setMessages(messages.filter((msg) => msg.id !== selectedMessage.id))
    if (messages.length > 1) {
      const nextMessage = messages.find((msg) => msg.id !== selectedMessage.id)
      if (nextMessage) setSelectedMessage(nextMessage)
    }
  }

  const handleDelete = () => {
    setMessages(messages.filter((msg) => msg.id !== selectedMessage.id))
    if (messages.length > 1) {
      const nextMessage = messages.find((msg) => msg.id !== selectedMessage.id)
      if (nextMessage) setSelectedMessage(nextMessage)
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "unread") return matchesSearch && !msg.isRead
    if (filterStatus === "read") return matchesSearch && msg.isRead
    return matchesSearch
  })

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Message List */}
          <div className="w-[30%] border-r border-zinc-800 bg-zinc-900 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-white">Bandeja de Entrada</h1>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo
                </Button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Buscar mensajes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-pink-600"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white">
                      Todos los mensajes
                    </SelectItem>
                    <SelectItem value="unread" className="text-white">
                      No leídos
                    </SelectItem>
                    <SelectItem value="read" className="text-white">
                      Leídos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 border-b border-zinc-800 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                <Mail className="h-4 w-4 mr-1" />
                No leídos
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                <Star className="h-4 w-4 mr-1" />
                Destacados
              </Button>
            </div>

            {/* Message List */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-zinc-800">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full text-left p-4 transition-colors hover:bg-zinc-800 ${
                      selectedMessage.id === message.id ? "bg-zinc-800 border-l-4 border-pink-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`font-semibold text-sm ${!message.isRead ? "text-white" : "text-zinc-400"}`}>
                        {message.sender}
                      </span>
                      <span className="text-xs text-zinc-500">{message.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm truncate flex-1 ${!message.isRead ? "text-zinc-300" : "text-zinc-500"}`}>
                        {message.subject}
                      </p>
                      {!message.isRead && <Badge className="bg-pink-600 text-white text-xs px-1.5 py-0">Nuevo</Badge>}
                    </div>
                    <p className="text-xs text-zinc-600">{message.date}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Message View */}
          <div className="flex-1 flex flex-col bg-zinc-950">
            {/* Action Buttons */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900">
              <div className="flex gap-3">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Reply className="h-4 w-4 mr-2" />
                  Responder
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                  onClick={handleArchive}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archivar
                </Button>
                {!selectedMessage.isRead && (
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    onClick={handleMarkAsRead}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Leído
                  </Button>
                )}
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                  <Star className="h-4 w-4 mr-2" />
                  Destacar
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                  <Tag className="h-4 w-4 mr-2" />
                  Etiquetar
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-red-400 hover:bg-zinc-800 hover:text-red-300 bg-transparent ml-auto"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Message Header */}
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-semibold text-white mb-3">{selectedMessage.subject}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {selectedMessage.sender.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedMessage.sender}</p>
                    <p className="text-xs text-zinc-500">
                      {selectedMessage.date} a las {selectedMessage.time}
                    </p>
                  </div>
                </div>
                {!selectedMessage.isRead && <Badge className="bg-pink-600 text-white">Nuevo</Badge>}
              </div>
            </div>

            {/* Message Body */}
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
