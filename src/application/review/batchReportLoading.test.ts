import { describe, expect, it, vi } from 'vitest'
import { loadBatchReport } from './batchReportLoading'

const t = (key: string, values?: Record<string, unknown>) => {
  if (!values) {
    return key
  }
  return `${key}:${JSON.stringify(values)}`
}

describe('loadBatchReport', () => {
  it('returns success payload and translated ready status', async () => {
    const result = await loadBatchReport({
      getMoveBatchReport: vi.fn(async () => ({ id: 'b-1' })),
      batchId: 'b-1',
      t,
      mapErrorToMessage: vi.fn(() => 'error'),
    })

    expect(result).toEqual({
      kind: 'success',
      report: { id: 'b-1' },
      statusMessage: 'actions.reportReady:{"batchId":"b-1"}',
    })
  })

  it('maps errors to translated error status', async () => {
    const mapErrorToMessage = vi.fn(() => 'mapped')
    const result = await loadBatchReport({
      getMoveBatchReport: vi.fn(async () => {
        throw new Error('boom')
      }),
      batchId: 'b-2',
      t,
      mapErrorToMessage,
    })

    expect(result).toEqual({
      kind: 'error',
      statusMessage: 'actions.reportError:{"message":"mapped"}',
    })
    expect(mapErrorToMessage).toHaveBeenCalled()
  })
})
