import { ApiError } from '../../api/client'
import { mapApiErrorToMessage } from '../../api/errorMapping'

type TranslateFn = (key: string, params?: Record<string, string | number>) => string

export function resolveReviewApiError(
  error: unknown,
  t: TranslateFn,
  options?: { flagStateConflictForRefresh?: boolean },
) {
  const shouldRefreshSelectedAsset =
    options?.flagStateConflictForRefresh !== false &&
    error instanceof ApiError &&
    error.payload?.code === 'STATE_CONFLICT'

  return {
    message: mapApiErrorToMessage(error, t),
    shouldRefreshSelectedAsset,
  }
}
