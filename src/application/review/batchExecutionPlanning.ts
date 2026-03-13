export const BATCH_EXECUTION_UNDO_WINDOW_MS = 6000

type PendingBatchExecution = {
  assetIds: string[]
  expiresAt: number
}

type BatchExecutionPlanInput = {
  executingBatch: boolean
  pendingBatchExecution: PendingBatchExecution | null
  batchIds: string[]
  now: number
  undoWindowMs?: number
}

export type BatchExecutionPlan =
  | { kind: 'ignore' }
  | { kind: 'run-now'; selection: string[] }
  | { kind: 'queue'; selection: string[]; expiresAt: number; undoSeconds: number }

export function planBatchExecution({
  executingBatch,
  pendingBatchExecution,
  batchIds,
  now,
  undoWindowMs = BATCH_EXECUTION_UNDO_WINDOW_MS,
}: BatchExecutionPlanInput): BatchExecutionPlan {
  if (executingBatch) {
    return { kind: 'ignore' }
  }

  if (pendingBatchExecution) {
    return {
      kind: 'run-now',
      selection: pendingBatchExecution.assetIds,
    }
  }

  if (batchIds.length === 0) {
    return { kind: 'ignore' }
  }

  return {
    kind: 'queue',
    selection: [...batchIds],
    expiresAt: now + undoWindowMs,
    undoSeconds: Math.round(undoWindowMs / 1000),
  }
}
