import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useBatchExecution } from './useBatchExecution'

describe('useBatchExecution', () => {
  it('recommends refreshing assets after a batch conflict', async () => {
    const apiClient = {
      submitAssetDecision: vi.fn().mockRejectedValue({
        status: 412,
        payload: { code: 'PRECONDITION_FAILED' },
      }),
    }
    const onBatchExecutionApplied = vi.fn()
    const t = vi.fn((key: string) => key)

    const { result } = renderHook(() =>
      useBatchExecution({
        apiClient,
        assets: [
          {
            id: 'asset-1',
            state: 'DECIDED_KEEP',
            revisionEtag: '"etag-1"',
          },
        ] as never,
        batchIds: ['asset-1'],
        isApiAssetSource: true,
        t,
        setRetryStatus: vi.fn(),
        mapErrorToMessage: () => 'error.preconditionFailed',
        isRefreshRecommendedError: (error) =>
          Boolean(
            typeof error === 'object'
              && error
              && 'payload' in error
              && (error as { payload?: { code?: string } }).payload?.code === 'PRECONDITION_FAILED',
          ),
        onBatchExecutionApplied,
      }),
    )

    await act(async () => {
      await result.current.executeBatchMove()
    })

    await waitFor(() => {
      expect(result.current.pendingBatchExecution).not.toBeNull()
    })

    await act(async () => {
      await result.current.executeBatchMove()
    })

    await waitFor(() => {
      expect(result.current.shouldRefreshAssetsAfterConflict).toBe(true)
    })

    expect(apiClient.submitAssetDecision).toHaveBeenCalledWith(
      'asset-1',
      { state: 'ARCHIVED' },
      undefined,
      '"etag-1"',
    )
    expect(onBatchExecutionApplied).not.toHaveBeenCalled()
    expect(result.current.executeStatus?.kind).toBe('error')
    expect(result.current.executeStatus?.message).toBe('actions.executeError')

    act(() => {
      result.current.acknowledgeBatchRefreshRecommendation()
    })

    expect(result.current.shouldRefreshAssetsAfterConflict).toBe(false)
  })
})
