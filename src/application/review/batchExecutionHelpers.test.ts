import { describe, expect, it } from 'vitest'
import {
  buildBatchTimeline,
  getPendingBatchUndoSeconds,
  resolveBatchId,
  serializeBatchReportExport,
} from './batchExecutionHelpers'

const t = (key: string) => key

describe('batchExecutionHelpers', () => {
  it('builds timeline states for queued/running/done', () => {
    const queued = buildBatchTimeline({
      pendingBatchExecution: { assetIds: ['A-001'], expiresAt: Date.now() + 5000 },
      executingBatch: false,
      executeStatusKind: null,
      t,
    })
    expect(queued[0]?.active).toBe(true)

    const failed = buildBatchTimeline({
      pendingBatchExecution: null,
      executingBatch: false,
      executeStatusKind: 'error',
      t,
    })
    expect(failed[2]).toMatchObject({
      error: true,
      label: 'actions.timelineError',
    })
  })

  it('computes pending undo seconds safely', () => {
    expect(getPendingBatchUndoSeconds(null, Date.now())).toBe(0)
    expect(
      getPendingBatchUndoSeconds(
        {
          assetIds: ['A-001'],
          expiresAt: 3000,
        },
        1000,
      ),
    ).toBe(2)
  })

  it('resolves batch id from execute response', () => {
    expect(resolveBatchId({ batch_id: 123 })).toBe('123')
    expect(resolveBatchId({})).toBeNull()
    expect(resolveBatchId(null)).toBeNull()
  })

  it('serializes report export payloads as json and csv', () => {
    expect(serializeBatchReportExport('json', { count: 1 })).toEqual({
      content: '{\n  "count": 1\n}\n',
      mimeType: 'application/json',
      extension: 'json',
    })

    const csv = serializeBatchReportExport('csv', { count: 1 })
    expect(csv.mimeType).toBe('text/csv')
    expect(csv.extension).toBe('csv')
    expect(csv.content).toContain('key,value')
  })
})
