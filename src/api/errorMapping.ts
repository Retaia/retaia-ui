import { ApiError } from './client'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

const AUTHZ_CODES = new Set(['FORBIDDEN_SCOPE', 'FORBIDDEN_ACTOR'])
const TEMPORARY_CODES = new Set(['TEMPORARY_UNAVAILABLE', 'RATE_LIMITED'])
const LOCK_CODES = new Set(['LOCK_REQUIRED', 'LOCK_INVALID', 'STALE_LOCK_TOKEN'])

export function mapApiErrorToMessage(error: unknown, t: TranslateFn) {
  const apiLikeError = error instanceof ApiError
    ? error
    : (
      typeof error === 'object'
      && error !== null
      && 'status' in error
      && 'payload' in error
    )
      ? (error as { status: number; payload?: { code?: string } })
      : null

  if (!apiLikeError) {
    return t('error.fallback', { message: 'UNKNOWN' })
  }

  const code = apiLikeError.payload?.code
  if (code && AUTHZ_CODES.has(code)) {
    return t('error.scope')
  }
  if (code === 'STATE_CONFLICT') {
    return t('error.stateConflict')
  }
  if (code === 'IDEMPOTENCY_CONFLICT') {
    return t('error.idempotency')
  }
  if (code === 'VALIDATION_FAILED') {
    return t('error.validation')
  }
  if (code && LOCK_CODES.has(code)) {
    return t('error.lock')
  }
  if (code && TEMPORARY_CODES.has(code)) {
    return t('error.temporary')
  }
  if (apiLikeError.status >= 500) {
    return t('error.temporary')
  }

  const fallback = code ? `${code} (${apiLikeError.status})` : `HTTP ${apiLikeError.status}`
  return t('error.fallback', { message: fallback })
}
