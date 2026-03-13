import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useReviewHistory } from './useReviewHistory'

describe('useReviewHistory', () => {
  it('records snapshots and activity labels', () => {
    const setAssets = vi.fn()
    const setSelectedAssetId = vi.fn()
    const setBatchIds = vi.fn()
    const assets = [{ id: 'A-001', name: 'a.mov', state: 'DECISION_PENDING' as const }]

    const { result } = renderHook(() =>
      useReviewHistory({
        assets,
        selectedAssetId: 'A-001',
        batchIds: [],
        setAssets,
        setSelectedAssetId,
        setBatchIds,
        t: (key) => key,
      }),
    )

    act(() => {
      result.current.recordAction('action-1')
    })

    expect(result.current.undoStack).toHaveLength(1)
    expect(result.current.activityLog[0]?.label).toBe('action-1')
  })

  it('restores last snapshot on undo', () => {
    const setAssets = vi.fn()
    const setSelectedAssetId = vi.fn()
    const setBatchIds = vi.fn()
    const assets = [{ id: 'A-001', name: 'a.mov', state: 'DECISION_PENDING' as const }]

    const { result } = renderHook(() =>
      useReviewHistory({
        assets,
        selectedAssetId: 'A-001',
        batchIds: ['A-001'],
        setAssets,
        setSelectedAssetId,
        setBatchIds,
        t: () => 'Undo',
      }),
    )

    act(() => {
      result.current.recordAction('action-1')
      result.current.undoLastAction()
    })

    expect(setAssets).toHaveBeenCalledWith(assets)
    expect(setSelectedAssetId).toHaveBeenCalledWith('A-001')
    expect(setBatchIds).toHaveBeenCalledWith(['A-001'])
  })
})

