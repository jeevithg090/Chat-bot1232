import type { Todo } from '../../../types/todo'
import { parseTodoId, ValidationError } from '../../utils/assistant'
import { toHttpError } from '../../utils/errors'
import { useTodoStore } from '../../utils/services'

export default defineEventHandler(async (event): Promise<{ todo: Todo }> => {
  try {
    const id = parseTodoId(getRouterParam(event, 'id'))
    const body = await readBody<{ completed?: unknown }>(event)
    if (typeof body?.completed !== 'boolean') {
      throw new ValidationError('"completed" must be true or false.')
    }
    const todo = await useTodoStore(event).setCompleted(id, body.completed)
    if (!todo)
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Task not found.' })
    return { todo }
  } catch (error) {
    throw toHttpError(error, 'Could not update the task.')
  }
})
