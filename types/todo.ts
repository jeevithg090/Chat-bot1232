/** A single to-do item, mirroring a row of the `todos` table. */
export interface Todo {
  id: number
  content: string
  completed: boolean
  created_at: string
}

export type TodoAction =
  'add_todo' | 'delete_todo' | 'mark_todo_completed' | 'mark_todo_uncompleted' | 'list_todos'

/** Response body of `POST /api/chat`. */
export interface ChatResponse {
  /** Markdown reply to show in the conversation. */
  reply: string
  /** The CRUD action that was executed, or `null` for a plain chat reply. */
  action: TodoAction | null
  /** The up-to-date list of todos after the action ran. */
  todos: Todo[]
}

/** Response body of `GET /api/health`. */
export interface HealthResponse {
  status: 'ok'
  storage: 'supabase' | 'memory'
  assistant: 'gemini' | 'demo'
}
