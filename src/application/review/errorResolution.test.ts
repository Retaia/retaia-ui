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
        resolveRefreshReason: (error) =>
          typeof error === 'object' &&
          error !== null &&
          typeof (error as { payload?: unknown }).payload === 'object' &&
          (error as { payload: { code?: unknown } }).payload.code === 'STATE_CONFLICT'
            ? 'state_conflict'
            : null,
      },
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      refreshReason: 'state_conflict',
      shouldRefreshSelectedAsset: true,
    })
  })

  it('keeps refresh flag disabled for non-conflict errors', () => {
    const result = resolveReviewApiError(new Error('boom'), {
      mapErrorToMessage: () => 'error.fallback',
      resolveRefreshReason: () => null,
    })

    expect(result).toEqual({
      message: 'error.fallback',
      refreshReason: null,
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
        resolveRefreshReason: () => 'state_conflict',
        flagRefreshForResolution: false,
      },
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      refreshReason: 'state_conflict',
      shouldRefreshSelectedAsset: false,
    })
  })
})
