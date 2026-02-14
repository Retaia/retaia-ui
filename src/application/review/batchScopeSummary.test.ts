import { describe, expect, it } from 'vitest'
import type { Asset } from '../../domain/assets'
import { summarizeBatchScope } from './batchScopeSummary'

const assets: Asset[] = [
  {
    id: 'a-1',
    name: 'one.mp4',
    state: 'DECISION_PENDING',
  },
  {
    id: 'a-2',
    name: 'two.mp4',
    state: 'DECIDED_KEEP',
  },
  {
    id: 'a-3',
    name: 'three.mp4',
    state: 'DECIDED_REJECT',
  },
]

describe('summarizeBatchScope', () => {
  it('counts only ids that belong to current batch selection', () => {
    expect(summarizeBatchScope(assets, ['a-1', 'a-3'])).toEqual({
      pending: 1,
      keep: 0,
      reject: 1,
    })
  })

  it('returns zero counts for empty selection', () => {
    expect(summarizeBatchScope(assets, [])).toEqual({
      pending: 0,
      keep: 0,
      reject: 0,
    })
  })
})
