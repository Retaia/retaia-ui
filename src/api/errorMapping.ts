import { ApiError } from './client'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

const AUTHZ_CODES = new Set(['FORBIDDEN_SCOPE', 'FORBIDDEN_ACTOR'])

export function mapApiErrorToMessage(error: unknown, t: TranslateFn) {
  if (!(error instanceof ApiError)) {
    return t('error.fallback', { message: 'UNKNOWN' })
  }

  const code = error.payload?.code
  if (code && AUTHZ_CODES.has(code)) {
    return t('error.scope')
  }
  if (code === 'STATE_CONFLICT') {
    return t('error.stateConflict')
  }
  if (code === 'IDEMPOTENCY_CONFLICT') {
    return t('error.idempotency')
  }
  if (code === 'TEMPORARY_UNAVAILABLE' || error.status >= 500) {
    return t('error.temporary')
  }

  const fallback = code ? `${code} (${error.status})` : `HTTP ${error.status}`
  return t('error.fallback', { message: fallback })
}
