import { beforeEach, describe, expect, it } from 'vitest'
import { executeDecision } from '../server/utils/assistant'
import { createMemoryStore, type TodoStore } from '../server/utils/todo-store'

let store: TodoStore

beforeEach(() => {
  store = createMemoryStore([
    { content: 'Buy milk', completed: false },
    { content: 'Call mum', completed: true },
  ])
})

describe('memory store', () => {
  it('creates, updates and removes todos', async () => {
    const created = await store.create('Read a book')
    expect(created).toMatchObject({ id: 3, content: 'Read a book', completed: false })
    expect(await store.setCompleted(3, true)).toMatchObject({ completed: true })
    expect(await store.remove(3)).toMatchObject({ id: 3 })
    expect(await store.remove(3)).toBeNull()
    expect(await store.setCompleted(99, true)).toBeNull()
    expect((await store.list()).map((t) => t.content)).toEqual(['Buy milk', 'Call mum'])
  })
  it('returns copies so callers cannot mutate state', async () => {
    const [first] = await store.list()
    first!.content = 'hacked'
    expect((await store.list())[0]!.content).toBe('Buy milk')
  })
})

describe('executeDecision', () => {
  it('passes chat replies through untouched', async () => {
    const todos = await store.list()
    const res = await executeDecision(store, { type: 'chat', reply: 'Hi' }, todos)
    expect(res).toEqual({ reply: 'Hi', action: null, todos })
  })

  it('adds a todo and returns the updated list', async () => {
    const res = await executeDecision(
      store,
      { type: 'action', action: 'add_todo', task: '  Read  a book ', reply: 'Added!' },
      await store.list(),
    )
    expect(res.action).toBe('add_todo')
    expect(res.todos.map((t) => t.content)).toEqual(['Buy milk', 'Call mum', 'Read a book'])
    expect(res.reply).toContain('Added!')
    expect(res.reply).toContain('3. ⬜️ Read a book')
  })

  it('refuses to add an empty task', async () => {
    const res = await executeDecision(
      store,
      { type: 'action', action: 'add_todo', task: ' ', reply: '' },
      await store.list(),
    )
    expect(res.action).toBeNull()
    expect(await store.list()).toHaveLength(2)
  })

  it('marks a todo completed and uncompleted', async () => {
    let res = await executeDecision(
      store,
      { type: 'action', action: 'mark_todo_completed', id: 1, reply: 'Nice' },
      await store.list(),
    )
    expect(res.todos[0]!.completed).toBe(true)
    res = await executeDecision(
      store,
      { type: 'action', action: 'mark_todo_uncompleted', id: 1, reply: 'Back' },
      res.todos,
    )
    expect(res.todos[0]!.completed).toBe(false)
  })

  it('deletes a todo', async () => {
    const res = await executeDecision(
      store,
      { type: 'action', action: 'delete_todo', id: 2, reply: 'Gone' },
      await store.list(),
    )
    expect(res.todos.map((t) => t.id)).toEqual([1])
  })

  it('never acts on ids that are not in the list (hallucinated ids)', async () => {
    const res = await executeDecision(
      store,
      { type: 'action', action: 'delete_todo', id: 42, reply: 'Gone' },
      await store.list(),
    )
    expect(res.action).toBeNull()
    expect(res.reply).toContain("couldn't find that task")
    expect(await store.list()).toHaveLength(2)
  })

  it('handles a missing id', async () => {
    const res = await executeDecision(
      store,
      { type: 'action', action: 'mark_todo_completed', reply: '' },
      await store.list(),
    )
    expect(res.action).toBeNull()
  })

  it('lists todos, with a friendly message when empty', async () => {
    const full = await executeDecision(
      store,
      { type: 'action', action: 'list_todos', reply: 'Here you go' },
      await store.list(),
    )
    expect(full.reply).toBe('Here you go\n\n1. ⬜️ Buy milk\n2. ✅ ~~Call mum~~')
    const empty = await executeDecision(
      store,
      { type: 'action', action: 'list_todos', reply: 'x' },
      [],
    )
    expect(empty.reply).toContain('Your list is empty')
  })
})
