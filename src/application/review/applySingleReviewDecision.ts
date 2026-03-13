import {
  getStateFromDecision,
  type Asset,
  type AssetState,
  type DecisionAction,
} from '../../domain/assets'

type ApplySingleReviewDecisionArgs = {
  assets: Asset[]
  targetId: string
  action: DecisionAction
  isApiAssetSource: boolean
  submitAssetDecision: (id: string, action: DecisionAction) => Promise<void>
  mapErrorToMessage: (error: unknown) => string
}

type ApplySingleReviewDecisionResult =
  | { kind: 'noop'; reason: 'asset_not_found' | 'unchanged' }
  | { kind: 'error'; message: string }
  | {
      kind: 'success'
      appliedState: AssetState
      updatedAssets: Asset[]
    }

export async function applySingleReviewDecision({
  assets,
  targetId,
  action,
  isApiAssetSource,
  submitAssetDecision,
  mapErrorToMessage,
}: ApplySingleReviewDecisionArgs): Promise<ApplySingleReviewDecisionResult> {
  const target = assets.find((asset) => asset.id === targetId)
  if (!target) {
    return { kind: 'noop', reason: 'asset_not_found' }
  }

  const nextState = getStateFromDecision(action, target.state)
  if (nextState === target.state) {
    return { kind: 'noop', reason: 'unchanged' }
  }

  if (isApiAssetSource) {
    try {
      await submitAssetDecision(targetId, action)
    } catch (error) {
      return {
        kind: 'error',
        message: mapErrorToMessage(error),
      }
    }
  }

  const updatedAssets = assets.map((asset) =>
    asset.id === targetId
      ? {
          ...asset,
          state: nextState,
        }
      : asset,
  )
  return {
    kind: 'success',
    appliedState: nextState,
    updatedAssets,
  }
}
