import type { ChatResponse } from '../../types/todo'
import { executeDecision, parseChatRequest } from '../utils/assistant'
import { toHttpError } from '../utils/errors'
import { useAssistant, useTodoStore } from '../utils/services'

/** Sends a message to the assistant and executes any resulting todo action. */
export default defineEventHandler(async (event): Promise<ChatResponse> => {
  try {
    const { message, history } = parseChatRequest(await readBody(event))
    const store = useTodoStore(event)
    // Always read the list server-side: never trust a client-provided cache.
    const todos = await store.list()
    const decision = await useAssistant(event).decide(message, todos, history)
    return await executeDecision(store, decision, todos)
  } catch (error) {
    throw toHttpError(error, 'The assistant could not answer right now. Please try again.')
  }
})
