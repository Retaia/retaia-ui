import { describe, expect, it } from 'vitest'
import { finalizeBulkDecisionResult } from './bulkDecisionFinalization'

describe('finalizeBulkDecisionResult', () => {
  it('returns error when every target fails', () => {
    expect(
      finalizeBulkDecisionResult({
        action: 'KEEP',
        targetIds: ['a-1', 'a-2'],
        successIds: [],
        firstErrorMessage: 'failed',
      }),
    ).toEqual({
      kind: 'error',
      errorMessage: 'failed',
    })
  })

  it('returns partial success when some ids fail', () => {
    expect(
      finalizeBulkDecisionResult({
        action: 'REJECT',
        targetIds: ['a-1', 'a-2'],
        successIds: ['a-2'],
        firstErrorMessage: 'one failed',
      }),
    ).toEqual({
      kind: 'partial',
      successIds: ['a-2'],
      successCount: 1,
      failedCount: 1,
      errorMessage: 'one failed',
      nextState: 'DECIDED_REJECT',
    })
  })

  it('returns success when all ids succeed', () => {
    expect(
      finalizeBulkDecisionResult({
        action: 'KEEP',
        targetIds: ['a-1', 'a-2'],
        successIds: ['a-1', 'a-2'],
        firstErrorMessage: null,
      }),
    ).toEqual({
      kind: 'success',
      successIds: ['a-1', 'a-2'],
      successCount: 2,
      nextState: 'DECIDED_KEEP',
    })
  })
})
