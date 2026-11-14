import type { HealthResponse } from '../../types/todo'
import { useAssistant, useTodoStore } from '../utils/services'

/** Reports which storage and assistant backends are active. */
export default defineEventHandler((event): HealthResponse => ({
  status: 'ok',
  storage: useTodoStore(event).kind,
  assistant: useAssistant(event).kind,
}))
