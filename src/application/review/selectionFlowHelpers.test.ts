import { describe, expect, it } from 'vitest'
import type { Asset } from '../../domain/assets'
import { mergeUniqueBatchIds, resolveSelectionNavigation } from './selectionFlowHelpers'

const VISIBLE_ASSETS: Asset[] = [
  { id: 'A-001', name: 'a.mp4', state: 'DECISION_PENDING' },
  { id: 'A-002', name: 'b.mp4', state: 'DECISION_PENDING' },
  { id: 'A-003', name: 'c.mp4', state: 'DECISION_PENDING' },
]

describe('selectionFlowHelpers', () => {
  it('returns first visible when no selection exists', () => {
    const result = resolveSelectionNavigation({
      visibleAssets: VISIBLE_ASSETS,
      selectedAssetId: null,
      selectionAnchorId: null,
      offset: 1,
      extendBatchRange: false,
    })

    expect(result).toEqual({
      nextId: 'A-001',
      nextAnchorId: 'A-001',
      rangeIds: [],
    })
  })

  it('moves selection by offset and keeps anchor when extending range', () => {
    const result = resolveSelectionNavigation({
      visibleAssets: VISIBLE_ASSETS,
      selectedAssetId: 'A-002',
      selectionAnchorId: 'A-001',
      offset: 1,
      extendBatchRange: true,
    })

    expect(result).toEqual({
      nextId: 'A-003',
      nextAnchorId: 'A-001',
      rangeIds: ['A-001', 'A-002', 'A-003'],
    })
  })

  it('falls back to next item as anchor when current anchor is invalid', () => {
    const result = resolveSelectionNavigation({
      visibleAssets: VISIBLE_ASSETS,
      selectedAssetId: 'A-002',
      selectionAnchorId: 'A-999',
      offset: -1,
      extendBatchRange: true,
    })

    expect(result).toEqual({
      nextId: 'A-001',
      nextAnchorId: 'A-001',
      rangeIds: [],
    })
  })

  it('merges batch ids uniquely and returns added count', () => {
    const result = mergeUniqueBatchIds(['A-001'], ['A-001', 'A-002', 'A-003'])
    expect(result).toEqual({
      mergedIds: ['A-001', 'A-002', 'A-003'],
      addedCount: 2,
    })
  })
})
