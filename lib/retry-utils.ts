/**
 * Utility for retrying async operations with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (error: Error, attempt: number, nextDelayMs: number) => void
}

export class RetryableError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message)
    this.name = 'RetryableError'
  }
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns The result of the successful operation
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: Error | undefined
  let delayMs = initialDelayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate next delay with exponential backoff
      const currentDelay = Math.min(delayMs, maxDelayMs)

      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1, currentDelay)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay))

      // Increase delay for next iteration
      delayMs *= backoffMultiplier
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Helper to determine if an error is retryable (e.g., network errors, 502, 503, 504)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof RetryableError) {
    return true
  }

  // Check for common retryable HTTP status codes
  if (error && typeof error === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error objects have dynamic properties
    const errorObj = error as any

    // Check status code
    if (errorObj.status || errorObj.statusCode) {
      const status = errorObj.status || errorObj.statusCode
      // Retry on 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
      if ([502, 503, 504].includes(status)) {
        return true
      }
    }

    // Check error message for known retryable patterns
    const message = errorObj.message || String(error)
    const retryablePatterns = [
      /bad gateway/i,
      /service unavailable/i,
      /gateway timeout/i,
      /timeout/i,
      /network error/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
    ]

    return retryablePatterns.some(pattern => pattern.test(message))
  }

  return false
}
