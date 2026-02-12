import type { components } from './generated/openapi'
import type { Asset, AssetMediaType, AssetState } from '../domain/assets'

type ApiAssetSummary = components['schemas']['AssetSummary']

function mapMediaType(mediaType: ApiAssetSummary['media_type']): AssetMediaType {
  if (mediaType === 'VIDEO') {
    return 'VIDEO'
  }
  if (mediaType === 'AUDIO') {
    return 'AUDIO'
  }
  return 'IMAGE'
}

function mapState(state: ApiAssetSummary['state']): AssetState {
  if (state === 'DECIDED_KEEP' || state === 'ARCHIVED') {
    return 'DECIDED_KEEP'
  }
  if (state === 'DECIDED_REJECT' || state === 'REJECTED' || state === 'PURGED') {
    return 'DECIDED_REJECT'
  }
  return 'DECISION_PENDING'
}

export function mapApiSummaryToAsset(summary: ApiAssetSummary): Asset {
  return {
    id: summary.uuid,
    name: summary.uuid,
    state: mapState(summary.state),
    mediaType: mapMediaType(summary.media_type),
    capturedAt: summary.captured_at ?? summary.created_at,
  }
}

