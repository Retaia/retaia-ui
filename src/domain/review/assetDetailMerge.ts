import type { Asset, AssetState } from '../assets'

type AssetDetailLike = {
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

function toUiDecisionState(state: string | undefined): AssetState | null {
  if (state === 'DECISION_PENDING' || state === 'DECIDED_KEEP' || state === 'DECIDED_REJECT') {
    return state
  }
  return null
}

export function mergeAssetWithDetail(
  asset: Asset,
  detail: AssetDetailLike,
  options?: { includeDecisionState?: boolean },
): Asset {
  const normalizedTags = Array.isArray(detail.summary.tags)
    ? detail.summary.tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined
  const nextState =
    options?.includeDecisionState === true ? toUiDecisionState(detail.summary.state) ?? asset.state : asset.state

  return {
    ...asset,
    state: nextState,
    ...(normalizedTags ? { tags: normalizedTags } : {}),
    proxyVideoUrl: detail.derived?.proxy_video_url ?? asset.proxyVideoUrl ?? null,
    proxyAudioUrl: detail.derived?.proxy_audio_url ?? asset.proxyAudioUrl ?? null,
    proxyPhotoUrl: detail.derived?.proxy_photo_url ?? asset.proxyPhotoUrl ?? null,
    waveformUrl: detail.derived?.waveform_url ?? asset.waveformUrl ?? null,
    transcriptPreview: detail.transcript?.text_preview ?? asset.transcriptPreview ?? null,
    transcriptStatus: detail.transcript?.status ?? asset.transcriptStatus,
  }
}
