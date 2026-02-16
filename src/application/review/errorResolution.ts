type ErrorMessageResolver = (error: unknown) => string
type StateConflictDetector = (error: unknown) => boolean

export function resolveReviewApiError(
  error: unknown,
  options: {
    mapErrorToMessage: ErrorMessageResolver
    isStateConflictError: StateConflictDetector
    flagStateConflictForRefresh?: boolean
  },
) {
  const shouldRefreshSelectedAsset =
    options?.flagStateConflictForRefresh !== false &&
    options.isStateConflictError(error)

  return {
    message: options.mapErrorToMessage(error),
    shouldRefreshSelectedAsset,
  }
}
