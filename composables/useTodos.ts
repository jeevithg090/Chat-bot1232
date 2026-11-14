import type { Todo } from '~/types/todo'

/** Shared todo list state plus helpers for the REST API. */
export function useTodos() {
  const todos = useState<Todo[]>('todos', () => [])
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('todos-status', () => 'idle')
  const error = useState<string | null>('todos-error', () => null)
  const pending = useState<number[]>('todos-pending', () => [])

  const counts = computed(() => {
    const done = todos.value.filter((t) => t.completed).length
    return { total: todos.value.length, done, open: todos.value.length - done }
  })

  async function refresh() {
    status.value = 'loading'
    error.value = null
    try {
      const res = await $fetch<{ todos: Todo[] }>('/api/todos')
      todos.value = res.todos
      status.value = 'ready'
    } catch (e) {
      error.value = getErrorMessage(e, 'Could not load your tasks.')
      status.value = 'error'
    }
  }

  async function withPending<T>(id: number, fn: () => Promise<T>) {
    pending.value = [...pending.value, id]
    try {
      return await fn()
    } finally {
      pending.value = pending.value.filter((p) => p !== id)
    }
  }

  async function add(content: string) {
    const res = await $fetch<{ todo: Todo }>('/api/todos', { method: 'POST', body: { content } })
    todos.value = [...todos.value, res.todo]
  }

  async function toggle(todo: Todo) {
    await withPending(todo.id, async () => {
      const res = await $fetch<{ todo: Todo }>(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: { completed: !todo.completed },
      })
      todos.value = todos.value.map((t) => (t.id === todo.id ? res.todo : t))
    })
  }

  async function remove(todo: Todo) {
    await withPending(todo.id, async () => {
      await $fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
      todos.value = todos.value.filter((t) => t.id !== todo.id)
    })
  }

  return { todos, status, error, pending, counts, refresh, add, toggle, remove }
}
