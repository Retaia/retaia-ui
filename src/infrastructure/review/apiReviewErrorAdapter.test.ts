import { describe, expect, it } from 'vitest'
import { isStateConflictApiError } from './apiReviewErrorAdapter'

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

  it('returns false for non-matching payloads', () => {
    expect(isStateConflictApiError(new Error('boom'))).toBe(false)
  })
})
