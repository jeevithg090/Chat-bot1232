import { createError, type H3Error } from 'h3'
import { ValidationError } from './assistant'
import { TodoStoreError } from './todo-store'

/** Maps known errors to HTTP errors without leaking internals to the client. */
export function toHttpError(error: unknown, fallbackMessage: string): H3Error {
  if (error instanceof ValidationError) {
    return createError({ statusCode: 400, statusMessage: 'Bad Request', message: error.message })
  }
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error as H3Error
  }
  console.error(`[convo-todo] ${fallbackMessage}:`, error)
  if (error instanceof TodoStoreError) {
    return createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: 'The database request failed. Please try again.',
    })
  }
  return createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: fallbackMessage,
  })
}
