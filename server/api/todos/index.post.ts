import type { Todo } from '../../../types/todo'
import { parseTaskContent } from '../../utils/assistant'
import { toHttpError } from '../../utils/errors'
import { useTodoStore } from '../../utils/services'

export default defineEventHandler(async (event): Promise<{ todo: Todo }> => {
  try {
    const body = await readBody<{ content?: unknown }>(event)
    const content = parseTaskContent(body?.content)
    const todo = await useTodoStore(event).create(content)
    setResponseStatus(event, 201)
    return { todo }
  } catch (error) {
    throw toHttpError(error, 'Could not add the task.')
  }
})
