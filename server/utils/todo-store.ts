import type { SupabaseClient } from '@supabase/supabase-js'
import type { Todo } from '../../types/todo'

/** Persistence layer for todos. Implemented by Supabase and an in-memory store. */
export interface TodoStore {
  readonly kind: 'supabase' | 'memory'
  list(): Promise<Todo[]>
  create(content: string): Promise<Todo>
  /** Returns the removed todo, or `null` when no todo has that id. */
  remove(id: number): Promise<Todo | null>
  /** Returns the updated todo, or `null` when no todo has that id. */
  setCompleted(id: number, completed: boolean): Promise<Todo | null>
}

export class TodoStoreError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'TodoStoreError'
  }
}

const byCreatedAt = (a: Todo, b: Todo) => a.created_at.localeCompare(b.created_at) || a.id - b.id

/** Volatile store used for local development, tests and the keyless demo mode. */
export function createMemoryStore(seed: Array<Omit<Todo, 'id' | 'created_at'>> = []): TodoStore {
  const todos = new Map<number, Todo>()
  let nextId = 1
  let clock = Date.now()

  const insert = (content: string, completed = false): Todo => {
    // Strictly increasing timestamps keep ordering deterministic.
    clock = Math.max(clock + 1, Date.now())
    const todo: Todo = {
      id: nextId++,
      content,
      completed,
      created_at: new Date(clock).toISOString(),
    }
    todos.set(todo.id, todo)
    return todo
  }

  seed.forEach((t) => insert(t.content, t.completed))

  return {
    kind: 'memory',
    async list() {
      return [...todos.values()].map((t) => ({ ...t })).sort(byCreatedAt)
    },
    async create(content) {
      return { ...insert(content) }
    },
    async remove(id) {
      const todo = todos.get(id)
      if (!todo) return null
      todos.delete(id)
      return { ...todo }
    },
    async setCompleted(id, completed) {
      const todo = todos.get(id)
      if (!todo) return null
      todo.completed = completed
      return { ...todo }
    },
  }
}

/** Store backed by a Supabase (Postgres) table with columns id, content, completed, created_at. */
export function createSupabaseStore(client: SupabaseClient, table = 'todos'): TodoStore {
  const fail = (op: string, cause: { message: string }) =>
    new TodoStoreError(`Failed to ${op} todo: ${cause.message}`, { cause })

  return {
    kind: 'supabase',
    async list() {
      const { data, error } = await client
        .from(table)
        .select('id, content, completed, created_at')
        .order('created_at', { ascending: true })
      if (error) throw fail('list', error)
      return (data ?? []) as Todo[]
    },
    async create(content) {
      const { data, error } = await client
        .from(table)
        .insert({ content, completed: false })
        .select('id, content, completed, created_at')
        .single()
      if (error) throw fail('create', error)
      return data as Todo
    },
    async remove(id) {
      const { data, error } = await client
        .from(table)
        .delete()
        .eq('id', id)
        .select('id, content, completed, created_at')
      if (error) throw fail('delete', error)
      return (data?.[0] as Todo | undefined) ?? null
    },
    async setCompleted(id, completed) {
      const { data, error } = await client
        .from(table)
        .update({ completed })
        .eq('id', id)
        .select('id, content, completed, created_at')
      if (error) throw fail('update', error)
      return (data?.[0] as Todo | undefined) ?? null
    },
  }
}
