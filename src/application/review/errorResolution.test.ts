import { describe, expect, it } from 'vitest'
import { ApiError } from '../../api/client'
import { resolveReviewApiError } from './errorResolution'

const t = (key: string) => key

describe('resolveReviewApiError', () => {
  it('flags STATE_CONFLICT errors for selected asset refresh', () => {
    const result = resolveReviewApiError(
      new ApiError(409, 'conflict', {
        code: 'STATE_CONFLICT',
        message: 'conflict',
        retryable: false,
        correlation_id: 'cid',
      }),
      t,
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      shouldRefreshSelectedAsset: true,
    })
  })

  it('keeps refresh flag disabled for non-conflict errors', () => {
    const result = resolveReviewApiError(new Error('boom'), t)

    expect(result).toEqual({
      message: 'error.fallback',
      shouldRefreshSelectedAsset: false,
    })
  })

  it('can disable refresh signal for state conflict errors', () => {
    const result = resolveReviewApiError(
      new ApiError(409, 'conflict', {
        code: 'STATE_CONFLICT',
        message: 'conflict',
        retryable: false,
        correlation_id: 'cid',
      }),
      t,
      { flagStateConflictForRefresh: false },
    )

    expect(result).toEqual({
      message: 'error.stateConflict',
      shouldRefreshSelectedAsset: false,
    })
  })
})
