/** Extracts a user-friendly message from a `$fetch` error. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error && typeof error === 'object') {
    const e = error as { data?: { message?: string }; statusCode?: number; message?: string }
    if (e.data?.message) return e.data.message
    if (e.statusCode === undefined && e.message?.includes('fetch')) {
      return 'Could not reach the server. Check your connection and try again.'
    }
  }
  return fallback
}
