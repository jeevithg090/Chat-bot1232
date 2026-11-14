import type { ChatResponse } from '~/types/todo'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  error?: boolean
}

export const MAX_MESSAGE_LENGTH = 1000

let nextId = 1

/** Conversation state: sends messages to `/api/chat` and keeps the todo list in sync. */
export function useChat() {
  const messages = useState<ChatMessage[]>('chat-messages', () => [])
  const isSending = useState('chat-sending', () => false)
  const { todos } = useTodos()

  async function send(text: string) {
    const message = text.trim()
    if (!message || isSending.value) return

    const history = messages.value
      .filter((m) => !m.error)
      .slice(-10)
      .map(({ role, text }) => ({ role, text }))

    messages.value = [...messages.value, { id: nextId++, role: 'user', text: message }]
    isSending.value = true
    try {
      const res = await $fetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: { message, history },
      })
      todos.value = res.todos
      messages.value = [...messages.value, { id: nextId++, role: 'assistant', text: res.reply }]
    } catch (e) {
      messages.value = [
        ...messages.value,
        { id: nextId++, role: 'assistant', text: getErrorMessage(e), error: true },
      ]
    } finally {
      isSending.value = false
    }
  }

  function clear() {
    messages.value = []
  }

  return { messages, isSending, send, clear }
}
