"use client"
import { useState } from "react"
import { Card } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Calendar } from "lucide-react"

export function TodoList() {
  const [task, setTask] = useState("")
  const [tasks, setTasks] = useState<string[]>([])

  const fechaHoy = new Date().toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const agregarTarea = () => {
    if (task.trim().length === 0) return
    setTasks([...tasks, task])
    setTask("")
  }

  return (
    <Card className="bg-card border border-border p-5 h-full flex flex-col justify-between">
      <header>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Lista de tareas
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span>{fechaHoy}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center space-y-5 mb-4">
        <textarea
          className="w-full min-h-[350px] max-h-[110px] bg-muted border border-border rounded-md p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Escribe tu tarea pendiente..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <Button
          className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-semibold text-[15px] shadow"
          onClick={agregarTarea}
        >
          Agregar tarea
        </Button>

        <ul className="mt-2 space-y-2 max-h-[80px] overflow-auto pr-1">
          {tasks.map((t, i) => (
            <li
              key={i}
              className="bg-muted rounded px-3 py-2 text-sm text-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
