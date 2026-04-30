import { describe, expect, it } from 'vitest'
import {
  isReviewRefreshRecommendedApiError,
  isStateConflictApiError,
  resolveReviewRefreshReason,
} from './apiReviewErrorAdapter'

describe('apiReviewErrorAdapter', () => {
  it('detects state conflict API payloads', () => {
    expect(
      isStateConflictApiError({
        payload: {
          code: 'STATE_CONFLICT',
        },
      }),
    ).toBe(true)
  })

  it('detects optimistic concurrency precondition payloads', () => {
    expect(
      isStateConflictApiError({
        payload: {
          code: 'PRECONDITION_FAILED',
        },
      }),
    ).toBe(true)
    expect(
      isStateConflictApiError({
        payload: {
          code: 'PRECONDITION_REQUIRED',
        },
      }),
    ).toBe(true)
  })

  it('maps lock payloads to an explicit refresh reason', () => {
    expect(
      resolveReviewRefreshReason({
        payload: {
          code: 'LOCK_REQUIRED',
        },
      }),
    ).toBe('lock')
    expect(
      isReviewRefreshRecommendedApiError({
        payload: {
          code: 'LOCK_INVALID',
        },
      }),
    ).toBe(true)
  })

  it('returns false for non-matching payloads', () => {
    expect(isStateConflictApiError(new Error('boom'))).toBe(false)
    expect(resolveReviewRefreshReason(new Error('boom'))).toBeNull()
  })
})
