import type { Asset, AssetState } from '../assets'

type AssetDetailLike = {
  summary: {
    tags?: unknown
    state?: string
    processing_profile?: string
    updated_at?: string | null
    revision_etag?: string | null
  }
  derived?: {
    preview_video_url?: string | null
    preview_audio_url?: string | null
    preview_photo_url?: string | null
    waveform_url?: string | null
    thumbs?: unknown
  }
  transcript?: {
    text_preview?: string | null
    status?: Asset['transcriptStatus']
  }
}

function toUiProcessingProfile(
  processingProfile: string | undefined,
): Asset['processingProfile'] {
  if (
    processingProfile === 'video_standard' ||
    processingProfile === 'audio_undefined' ||
    processingProfile === 'audio_music' ||
    processingProfile === 'audio_voice' ||
    processingProfile === 'photo_standard'
  ) {
    return processingProfile
  }
  return null
}

function toUiDecisionState(state: string | undefined): AssetState | null {
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
    processingProfile: toUiProcessingProfile(detail.summary.processing_profile) ?? asset.processingProfile ?? null,
    updatedAt: detail.summary.updated_at ?? asset.updatedAt,
    revisionEtag: detail.summary.revision_etag ?? asset.revisionEtag ?? null,
    previewVideoUrl: detail.derived?.preview_video_url ?? asset.previewVideoUrl ?? null,
    previewAudioUrl: detail.derived?.preview_audio_url ?? asset.previewAudioUrl ?? null,
    previewPhotoUrl: detail.derived?.preview_photo_url ?? asset.previewPhotoUrl ?? null,
    waveformUrl: detail.derived?.waveform_url ?? asset.waveformUrl ?? null,
    ...(Array.isArray(detail.derived?.thumbs)
      ? {
          thumbUrls: detail.derived.thumbs.filter((thumb): thumb is string => typeof thumb === 'string'),
        }
      : {}),
    transcriptPreview: detail.transcript?.text_preview ?? asset.transcriptPreview ?? null,
    transcriptStatus: detail.transcript?.status ?? asset.transcriptStatus,
  }
}
