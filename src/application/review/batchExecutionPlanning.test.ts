import { describe, expect, it } from 'vitest'
import { BATCH_EXECUTION_UNDO_WINDOW_MS, planBatchExecution } from './batchExecutionPlanning'

describe('planBatchExecution', () => {
  it('ignores request while batch execution is running', () => {
    expect(
      planBatchExecution({
        executingBatch: true,
        pendingBatchExecution: null,
        batchIds: ['a-1'],
        now: 1000,
      }),
    ).toEqual({ kind: 'ignore' })
  })

  it('runs pending selection immediately when already queued', () => {
    expect(
      planBatchExecution({
        executingBatch: false,
        pendingBatchExecution: { assetIds: ['a-1', 'a-2'], expiresAt: 9999 },
        batchIds: ['b-1'],
        now: 1000,
      }),
    ).toEqual({
      kind: 'run-now',
      selection: ['a-1', 'a-2'],
    })
  })

  it('queues current selection with default undo window', () => {
    expect(
      planBatchExecution({
        executingBatch: false,
        pendingBatchExecution: null,
        batchIds: ['a-1'],
        now: 1000,
      }),
    ).toEqual({
      kind: 'queue',
      selection: ['a-1'],
      expiresAt: 1000 + BATCH_EXECUTION_UNDO_WINDOW_MS,
      undoSeconds: 6,
    })
  })
})
