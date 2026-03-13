import { mapApiErrorToMessage } from '../../api/errorMapping'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export function mapReviewApiErrorToMessage(error: unknown, t: TranslateFn): string {
  return mapApiErrorToMessage(error, t)
}

export function isStateConflictApiError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const payload = (error as { payload?: unknown }).payload
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  return (payload as { code?: unknown }).code === 'STATE_CONFLICT'
}
