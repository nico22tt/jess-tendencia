"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AdminHeader } from "@/components/admin-header"

import { Button } from "@jess/ui/button"
import { Card } from "@jess/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@jess/ui/utils"
// Mock events data
const mockEvents = [
  { id: 1, date: 15, title: "Reunión de equipo", type: "meeting", color: "bg-blue-500" },
  { id: 2, date: 15, title: "Lanzamiento de producto", type: "launch", color: "bg-purple-500" },
  { id: 3, date: 22, title: "Revisión de ventas", type: "review", color: "bg-green-500" },
  { id: 4, date: 28, title: "Capacitación", type: "training", color: "bg-yellow-500" },
]

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(15)
  const [currentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())

  // Generate calendar days (simplified - always 31 days for demo)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)

  // Get events for selected day
  const selectedDayEvents = mockEvents.filter((event) => event.date === selectedDay)

  // Check if a day has events
  const hasEvents = (day: number) => mockEvents.some((event) => event.date === day)

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Calendario de Eventos</h1>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Evento
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Filters Sidebar */}
              <Card className="col-span-3 bg-zinc-900 border-zinc-800 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Tipo de Evento</h3>
                  <div className="space-y-2">
                    {["Todos", "Reuniones", "Lanzamientos", "Revisiones", "Capacitaciones"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-zinc-700" />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-sm font-semibold text-white mb-3">Mis Tareas</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>3 eventos pendientes</span>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>2 completados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Calendar */}
              <div className="col-span-9 space-y-4">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold text-white">
                      {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-zinc-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "aspect-square p-2 rounded-lg text-sm font-medium transition-colors relative",
                          selectedDay === day
                            ? "bg-purple-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                        )}
                      >
                        {day}
                        {hasEvents(day) && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {mockEvents
                              .filter((e) => e.date === day)
                              .map((event) => (
                                <div key={event.id} className={cn("w-1 h-1 rounded-full", event.color)} />
                              ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Selected Day Events */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Eventos del {selectedDay} de {monthNames[currentMonth]}
                  </h3>
                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700"
                        >
                          <div className={cn("w-3 h-3 rounded-full", event.color)} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="text-xs text-zinc-500 capitalize">{event.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No hay eventos programados para este día.</p>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
