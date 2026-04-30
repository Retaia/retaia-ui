type ErrorMessageResolver = (error: unknown) => string
type RefreshReasonResolver = (
  error: unknown,
) => 'state_conflict' | 'precondition_required' | 'precondition_failed' | 'lock' | null

export function resolveReviewApiError(
  error: unknown,
  options: {
    mapErrorToMessage: ErrorMessageResolver
    resolveRefreshReason: RefreshReasonResolver
    flagRefreshForResolution?: boolean
  },
) {
  const refreshReason = options.resolveRefreshReason(error)
  const shouldRefreshSelectedAsset =
    options?.flagRefreshForResolution !== false &&
    refreshReason !== null

  return {
    message: options.mapErrorToMessage(error),
    shouldRefreshSelectedAsset,
    refreshReason,
  }
}
