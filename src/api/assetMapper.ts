import type { components } from './generated/openapi'
import type { Asset, AssetMediaType, AssetState } from '../domain/assets'

type ApiAssetSummary = components['schemas']['AssetSummary']

function mapMediaType(mediaType: ApiAssetSummary['media_type'] | undefined): AssetMediaType {
  if (mediaType === 'VIDEO') {
    return 'VIDEO'
  }
  if (mediaType === 'AUDIO') {
    return 'AUDIO'
  }
  if (mediaType === 'PHOTO') {
    return 'IMAGE'
  }
  return 'OTHER'
}

function mapState(state: ApiAssetSummary['state'] | undefined): AssetState {
  if (state === 'DECIDED_KEEP' || state === 'ARCHIVED') {
    return 'DECIDED_KEEP'
  }
  if (state === 'DECIDED_REJECT' || state === 'REJECTED' || state === 'PURGED') {
    return 'DECIDED_REJECT'
  }
  return 'DECISION_PENDING'
}

export function mapApiSummaryToAsset(
  summary: Partial<ApiAssetSummary>,
  fallbackIndex = 0,
): Asset {
  const fallbackId = `UNKNOWN-ASSET-${fallbackIndex + 1}`
  const id = typeof summary.uuid === 'string' && summary.uuid.trim() !== '' ? summary.uuid : fallbackId
  const capturedAt =
    typeof summary.captured_at === 'string'
      ? summary.captured_at
      : typeof summary.created_at === 'string'
        ? summary.created_at
        : new Date(0).toISOString()

  const tags = Array.isArray(summary.tags)
    ? summary.tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined

  return {
    id,
    name: id,
    state: mapState(summary.state),
    mediaType: mapMediaType(summary.media_type),
    capturedAt,
    ...(tags ? { tags } : {}),
  }
}
