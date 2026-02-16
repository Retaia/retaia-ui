import { type Asset } from '../../domain/assets'
import { normalizeReviewMetadataInput } from '../../domain/review/metadata'
import { mergeAssetWithDetail } from '../../domain/review/assetDetailMerge'

type ReviewAssetDetail = {
  summary: {
    tags?: unknown
    state?: string
  }
  derived?: {
    proxy_video_url?: string | null
    proxy_audio_url?: string | null
    proxy_photo_url?: string | null
    waveform_url?: string | null
  }
  transcript?: {
    text_preview?: string | null
    status?: Asset['transcriptStatus']
  }
}

export async function saveReviewAssetMetadata(args: {
  isApiAssetSource: boolean
  assetId: string
  payload: { tags: string[]; notes: string }
  updateAssetMetadata: (assetId: string, payload: { tags?: string[]; notes?: string }) => Promise<void>
}): Promise<
  | { kind: 'success'; apply: (assets: Asset[]) => Asset[] }
  | { kind: 'error'; error: unknown }
> {
  const normalized = normalizeReviewMetadataInput(args.payload)
  try {
    if (args.isApiAssetSource) {
      await args.updateAssetMetadata(args.assetId, {
        tags: normalized.tags,
        notes: normalized.notes,
      })
    }
    return {
      kind: 'success',
      apply: (assets) => assets.map((asset) => (asset.id === args.assetId ? { ...asset, ...normalized } : asset)),
    }
  } catch (error) {
    return {
      kind: 'error',
      error,
    }
  }
}

export async function refreshReviewAsset(args: {
  isApiAssetSource: boolean
  selectedAssetId: string | null
  getAssetDetail: (assetId: string) => Promise<ReviewAssetDetail>
}): Promise<
  | { kind: 'noop' }
  | { kind: 'success'; apply: (assets: Asset[]) => Asset[] }
  | { kind: 'error'; error: unknown }
> {
  if (!args.isApiAssetSource || !args.selectedAssetId) {
    return { kind: 'noop' }
  }

  try {
    const detail = await args.getAssetDetail(args.selectedAssetId)
    return {
      kind: 'success',
      apply: (assets) =>
        assets.map((asset) =>
          asset.id === args.selectedAssetId
            ? mergeAssetWithDetail(asset, detail, {
                includeDecisionState: true,
              })
            : asset,
        ),
    }
  } catch (error) {
    return {
      kind: 'error',
      error,
    }
  }
}
