export type BulkDecisionFinalizationInput = {
  action: 'KEEP' | 'REJECT'
  targetIds: string[]
  successIds: string[]
  firstErrorMessage: string | null
}

type BulkDecisionState = 'DECIDED_KEEP' | 'DECIDED_REJECT'

export type BulkDecisionFinalizationResult =
  | { kind: 'none' }
  | { kind: 'error'; errorMessage: string }
  | {
      kind: 'partial'
      successIds: string[]
      successCount: number
      failedCount: number
      errorMessage: string
      nextState: BulkDecisionState
    }
  | {
      kind: 'success'
      successIds: string[]
      successCount: number
      nextState: BulkDecisionState
    }

export function finalizeBulkDecisionResult({
  action,
  targetIds,
  successIds,
  firstErrorMessage,
}: BulkDecisionFinalizationInput): BulkDecisionFinalizationResult {
  if (successIds.length === 0) {
    if (!firstErrorMessage) {
      return { kind: 'none' }
    }
    return {
      kind: 'error',
      errorMessage: firstErrorMessage,
    }
  }

  const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
  const failedCount = targetIds.length - successIds.length
  if (failedCount > 0 && firstErrorMessage) {
    return {
      kind: 'partial',
      successIds,
      successCount: successIds.length,
      failedCount,
      errorMessage: firstErrorMessage,
      nextState,
    }
  }

  return {
    kind: 'success',
    successIds,
    successCount: successIds.length,
    nextState,
  }
}
