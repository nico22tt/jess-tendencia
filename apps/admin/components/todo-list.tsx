"use client"

import { Card } from "@jess/ui/card"
import { Button } from "@jess/ui/button"
import { Calendar } from "lucide-react"

export function TodoList() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Todo List</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4" />
          <span>September 17th, 2025</span>
        </div>

        <textarea
          className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Add your tasks here..."
        />

        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Add Task</Button>
      </div>
    </Card>
  )
}
