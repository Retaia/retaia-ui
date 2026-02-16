import { describe, expect, it } from 'vitest'
import { resolveReviewApiError } from './errorResolution'

describe('resolveReviewApiError', () => {
  it('flags STATE_CONFLICT errors for selected asset refresh', () => {
    const result = resolveReviewApiError(
      {
        payload: {
          code: 'STATE_CONFLICT',
        },
      },
      {
        mapErrorToMessage: () => 'error.stateConflict',
        isStateConflictError: (error) =>
          typeof error === 'object' &&
          error !== null &&
          typeof (error as { payload?: unknown }).payload === 'object' &&
          (error as { payload: { code?: unknown } }).payload.code === 'STATE_CONFLICT',
      },
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      shouldRefreshSelectedAsset: true,
    })
  })

  it('keeps refresh flag disabled for non-conflict errors', () => {
    const result = resolveReviewApiError(new Error('boom'), {
      mapErrorToMessage: () => 'error.fallback',
      isStateConflictError: () => false,
    })

    expect(result).toEqual({
      message: 'error.fallback',
      shouldRefreshSelectedAsset: false,
    })
  })

  it('can disable refresh signal for state conflict errors', () => {
    const result = resolveReviewApiError(
      {
        payload: {
          code: 'STATE_CONFLICT',
        },
      },
      {
        mapErrorToMessage: () => 'error.stateConflict',
        isStateConflictError: () => true,
        flagStateConflictForRefresh: false,
      },
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      shouldRefreshSelectedAsset: false,
    })
  })
})
