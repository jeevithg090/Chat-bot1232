import type { Todo } from '../../../types/todo'
import { parseTodoId } from '../../utils/assistant'
import { toHttpError } from '../../utils/errors'
import { useTodoStore } from '../../utils/services'

export default defineEventHandler(async (event): Promise<{ todo: Todo }> => {
  try {
    const id = parseTodoId(getRouterParam(event, 'id'))
    const todo = await useTodoStore(event).remove(id)
    if (!todo)
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Task not found.' })
    return { todo }
  } catch (error) {
    throw toHttpError(error, 'Could not delete the task.')
  }
})
