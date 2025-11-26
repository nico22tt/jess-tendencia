"use client"
import { useState } from "react"
import { Card } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Calendar } from "lucide-react"

export function TodoList() {
  const [task, setTask] = useState("")
  const [tasks, setTasks] = useState<string[]>([])

  // Fecha dinámica
  const fechaHoy = new Date().toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric"
  })

  const agregarTarea = () => {
    if (task.trim().length === 0) return
    setTasks([...tasks, task])
    setTask("")
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-5 h-full flex flex-col justify-between">
      <header>
        <h3 className="text-lg font-semibold text-white mb-2">Lista de tareas</h3>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
          <Calendar className="h-4 w-4" />
          <span>{fechaHoy}</span>
        </div>
      </header>
      <div className="flex-1 flex flex-col justify-center space-y-5 mb-4">
        <textarea
          className="w-full min-h-[350px] max-h-[110px] bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          placeholder="Escribe tu tarea pendiente..."
          value={task}
          onChange={e => setTask(e.target.value)}
        />
        <Button className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold text-[15px] shadow"
                onClick={agregarTarea}>
          Agregar tarea
        </Button>
        <ul className="mt-2 space-y-2 max-h-[80px] overflow-auto pr-1">
          {tasks.map((t, i) => (
            <li key={i} className="bg-zinc-800 rounded px-3 py-2 text-zinc-300 text-sm">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
