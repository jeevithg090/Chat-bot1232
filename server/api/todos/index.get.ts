import type { Todo } from '../../../types/todo'
import { toHttpError } from '../../utils/errors'
import { useTodoStore } from '../../utils/services'

export default defineEventHandler(async (event): Promise<{ todos: Todo[] }> => {
  try {
    return { todos: await useTodoStore(event).list() }
  } catch (error) {
    throw toHttpError(error, 'Could not load your tasks.')
  }
})
