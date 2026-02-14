type ReviewBulkAction = 'KEEP' | 'REJECT'

type SubmitReviewDecisionsArgs = {
  isApiAssetSource: boolean
  targetIds: string[]
  action: ReviewBulkAction
  submitAssetDecision: (id: string, action: ReviewBulkAction) => Promise<void>
  mapErrorToMessage: (error: unknown) => string
}

type SubmitReviewDecisionsResult = {
  successIds: string[]
  firstErrorMessage: string | null
}

export async function submitReviewDecisions({
  isApiAssetSource,
  targetIds,
  action,
  submitAssetDecision,
  mapErrorToMessage,
}: SubmitReviewDecisionsArgs): Promise<SubmitReviewDecisionsResult> {
  if (!isApiAssetSource) {
    return {
      successIds: targetIds,
      firstErrorMessage: null,
    }
  }

  const settled = await Promise.allSettled(
    targetIds.map(async (id) => {
      await submitAssetDecision(id, action)
      return id
    }),
  )
  const successIds: string[] = []
  let firstErrorMessage: string | null = null
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      successIds.push(result.value)
      continue
    }
    if (!firstErrorMessage) {
      firstErrorMessage = mapErrorToMessage(result.reason)
    }
  }
  return { successIds, firstErrorMessage }
}

