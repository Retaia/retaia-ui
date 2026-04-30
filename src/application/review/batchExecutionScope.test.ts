import { describe, expect, it } from 'vitest'
import { resolveBatchExecutionScope } from './batchExecutionScope'

describe('resolveBatchExecutionScope', () => {
  it('splits selected batch ids into eligible and ineligible execution buckets', () => {
    const scope = resolveBatchExecutionScope(
      [
        { id: 'a-1', name: 'a', state: 'DECIDED_KEEP' },
        { id: 'a-2', name: 'b', state: 'DECIDED_REJECT' },
        { id: 'a-3', name: 'c', state: 'DECISION_PENDING' },
        { id: 'a-4', name: 'd', state: 'ARCHIVED' },
        { id: 'a-5', name: 'e', state: 'READY' },
      ],
      ['a-1', 'a-2', 'a-3', 'a-4', 'a-5'],
    )

    expect(scope).toEqual({
      selected: 5,
      eligible: 2,
      archived: 1,
      rejected: 1,
      pendingDecision: 1,
      alreadyMoved: 1,
      otherStates: 1,
      ineligible: 3,
    })
  })

  it('returns zeros when the current batch selection is empty', () => {
    expect(resolveBatchExecutionScope([], [])).toEqual({
      selected: 0,
      eligible: 0,
      archived: 0,
      rejected: 0,
      pendingDecision: 0,
      alreadyMoved: 0,
      otherStates: 0,
      ineligible: 0,
    })
  })
})
