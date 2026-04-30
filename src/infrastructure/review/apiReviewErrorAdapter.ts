import { mapApiErrorToMessage } from '../../api/errorMapping'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string
const LOCK_CODES = new Set(['LOCK_REQUIRED', 'LOCK_INVALID', 'STALE_LOCK_TOKEN'])

export type ReviewRefreshReason =
  | 'state_conflict'
  | 'precondition_required'
  | 'precondition_failed'
  | 'lock'

export function mapReviewApiErrorToMessage(error: unknown, t: TranslateFn): string {
  return mapApiErrorToMessage(error, t)
}

export function resolveReviewRefreshReason(error: unknown): ReviewRefreshReason | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  const payload = (error as { payload?: unknown }).payload
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const code = String((payload as { code?: unknown }).code ?? '')
  if (code === 'STATE_CONFLICT') {
    return 'state_conflict'
  }
  if (code === 'PRECONDITION_REQUIRED') {
    return 'precondition_required'
  }
  if (code === 'PRECONDITION_FAILED') {
    return 'precondition_failed'
  }
  if (LOCK_CODES.has(code)) {
    return 'lock'
  }
  return null
}

export function isStateConflictApiError(error: unknown): boolean {
  const reason = resolveReviewRefreshReason(error)
  return (
    reason === 'state_conflict'
    || reason === 'precondition_required'
    || reason === 'precondition_failed'
  )
}

export function isReviewRefreshRecommendedApiError(error: unknown): boolean {
  return resolveReviewRefreshReason(error) !== null
}
