import type {
  Asset,
  AssetMediaType,
  AssetProjectRef,
  AssetState,
  ProcessingProfile,
} from '../domain/assets'
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

function mapProcessingProfile(
  processingProfile: ApiAssetSummary['processing_profile'] | undefined,
): ProcessingProfile | null {
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

function mapProjects(projects: ApiAssetSummary['projects'] | undefined): AssetProjectRef[] | undefined {
  if (!Array.isArray(projects)) {
    return undefined
  }

  const normalized = projects.flatMap((project): AssetProjectRef[] => {
    if (!project || typeof project !== 'object') {
      return []
    }

    const id = typeof project.project_id === 'string' ? project.project_id.trim() : ''
    const name = typeof project.project_name === 'string' ? project.project_name.trim() : ''
    if (id === '' || name === '') {
      return []
    }

    return [{ id, name }]
  })

  return normalized.length > 0 ? normalized : undefined
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
  const projects = mapProjects(summary.projects)

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
    processingProfile: mapProcessingProfile(summary.processing_profile),
    ...(typeof summary.thumb_url === 'string' ? { thumbUrls: [summary.thumb_url] } : {}),
    ...(tags ? { tags } : {}),
    ...(projects ? { projects } : {}),
  }
}
