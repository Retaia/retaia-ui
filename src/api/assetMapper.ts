import type { Asset, AssetMediaType, AssetState } from '../domain/assets'
import type { AssetSummary } from './contracts'

type ApiAssetSummary = AssetSummary

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
  if (
    state === 'DISCOVERED' ||
    state === 'READY' ||
    state === 'PROCESSING_REVIEW' ||
    state === 'REVIEW_PENDING_PROFILE' ||
    state === 'PROCESSED' ||
    state === 'DECISION_PENDING' ||
    state === 'DECIDED_KEEP' ||
    state === 'DECIDED_REJECT' ||
    state === 'ARCHIVED' ||
    state === 'REJECTED' ||
    state === 'PURGED'
  ) {
    return state
  }
  return 'DECISION_PENDING'
}

export function mapApiSummaryToAsset(
  summary: Partial<ApiAssetSummary>,
  fallbackIndex = 0,
): Asset {
  const fallbackId = `UNKNOWN-ASSET-${fallbackIndex + 1}`
  const id = typeof summary.uuid === 'string' && summary.uuid.trim() !== '' ? summary.uuid : fallbackId
  const name = typeof summary.name === 'string' && summary.name.trim() !== '' ? summary.name : id
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
    name,
    state: mapState(summary.state),
    mediaType: mapMediaType(summary.media_type),
    capturedAt,
    ...(typeof summary.updated_at === 'string' ? { updatedAt: summary.updated_at } : {}),
    ...(summary.revision_etag === null || typeof summary.revision_etag === 'string'
      ? { revisionEtag: summary.revision_etag ?? null }
      : {}),
    ...(typeof summary.thumb_url === 'string' ? { thumbUrls: [summary.thumb_url] } : {}),
    ...(tags ? { tags } : {}),
  }
}
