import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import { createRuleBasedAssistant, type Assistant } from './assistant'
import { createGeminiAssistant } from './gemini'
import { createMemoryStore, createSupabaseStore, type TodoStore } from './todo-store'

let store: TodoStore | undefined
let assistant: Assistant | undefined

/**
 * Returns the todo store. Uses Supabase when NUXT_SUPABASE_URL and
 * NUXT_SUPABASE_KEY are set, otherwise a volatile in-memory store.
 */
export function useTodoStore(event?: H3Event): TodoStore {
  if (store) return store
  const config = useRuntimeConfig(event)
  if (config.supabaseUrl && config.supabaseKey) {
    const client = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    store = createSupabaseStore(client, config.supabaseTable || 'todos')
  } else {
    console.warn(
      '[convo-todo] Supabase is not configured (NUXT_SUPABASE_URL / NUXT_SUPABASE_KEY). ' +
        'Using an in-memory store: todos will be lost when the server restarts.',
    )
    store = createMemoryStore([
      { content: 'Water the plants', completed: false },
      { content: 'Explore Convo-Todo', completed: true },
    ])
  }
  return store
}

/**
 * Returns the assistant. Uses Gemini when NUXT_GEMINI_API_KEY is set,
 * otherwise a keyword-based demo assistant.
 */
export function useAssistant(event?: H3Event): Assistant {
  if (assistant) return assistant
  const config = useRuntimeConfig(event)
  if (config.geminiApiKey) {
    assistant = createGeminiAssistant(config.geminiApiKey, config.geminiModel || 'gemini-2.5-flash')
  } else {
    console.warn(
      '[convo-todo] NUXT_GEMINI_API_KEY is not set. Using the keyword-based demo assistant.',
    )
    assistant = createRuleBasedAssistant()
  }
  return assistant
}
