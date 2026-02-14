import { describe, expect, it, vi } from 'vitest'
import { submitReviewDecisions } from './submitReviewDecisions'

describe('submitReviewDecisions', () => {
  it('returns all ids directly when source is not API', async () => {
    const submitAssetDecision = vi.fn()
    const result = await submitReviewDecisions({
      isApiAssetSource: false,
      targetIds: ['A-001', 'A-002'],
      action: 'KEEP',
      submitAssetDecision,
      mapErrorToMessage: () => 'error',
    })

    expect(result).toEqual({
      successIds: ['A-001', 'A-002'],
      firstErrorMessage: null,
    })
    expect(submitAssetDecision).not.toHaveBeenCalled()
  })

  it('collects success ids and first mapped error when API calls fail', async () => {
    const submitAssetDecision = vi.fn(async (id: string) => {
      if (id === 'A-002') {
        throw new Error('fail')
      }
    })
    const result = await submitReviewDecisions({
      isApiAssetSource: true,
      targetIds: ['A-001', 'A-002', 'A-003'],
      action: 'REJECT',
      submitAssetDecision,
      mapErrorToMessage: () => 'mapped-error',
    })

    expect(result).toEqual({
      successIds: ['A-001', 'A-003'],
      firstErrorMessage: 'mapped-error',
    })
    expect(submitAssetDecision).toHaveBeenCalledTimes(3)
  })
})

