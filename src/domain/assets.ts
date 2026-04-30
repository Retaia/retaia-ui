export const ASSET_STATES = [
  'DISCOVERED',
  'READY',
  'PROCESSING_REVIEW',
  'REVIEW_PENDING_PROFILE',
  'PROCESSED',
  'DECISION_PENDING',
  'DECIDED_KEEP',
  'DECIDED_REJECT',
  'ARCHIVED',
  'REJECTED',
  'PURGED',
] as const
export const ASSET_MEDIA_TYPES = ['VIDEO', 'AUDIO', 'IMAGE', 'OTHER'] as const
export const PROCESSING_PROFILES = [
  'video_standard',
  'audio_undefined',
  'audio_music',
  'audio_voice',
  'photo_standard',
] as const

export type AssetState = (typeof ASSET_STATES)[number]
export type AssetFilter = AssetState | 'ALL' | 'WORK_QUEUE'
export type AssetMediaType = (typeof ASSET_MEDIA_TYPES)[number]
export type AssetMediaTypeFilter = AssetMediaType | 'ALL'
export type ProcessingProfile = (typeof PROCESSING_PROFILES)[number]
export type AssetDateFilter = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS'
export type AssetSort =
  | 'created_at'
  | '-created_at'
  | 'updated_at'
  | '-updated_at'
  | 'name'
  | '-name'
export type DecisionAction = 'KEEP' | 'REJECT' | 'CLEAR'
export type AssetProjectRef = {
  id: string
  name: string
}

export type Asset = {
  id: string
  name: string
  state: AssetState
  mediaType?: AssetMediaType
  capturedAt?: string
  updatedAt?: string
  revisionEtag?: string | null
  previewVideoUrl?: string | null
  previewAudioUrl?: string | null
  previewPhotoUrl?: string | null
  waveformUrl?: string | null
  thumbUrls?: string[]
  processingProfile?: ProcessingProfile | null
  tags?: string[]
  projects?: AssetProjectRef[]
  notes?: string
  fields?: Record<string, unknown>
  transcriptPreview?: string | null
  transcriptStatus?: 'NONE' | 'RUNNING' | 'DONE' | 'FAILED'
}

export const ASSET_STATE_LABEL_KEYS: Record<AssetState, string> = {
  DISCOVERED: 'toolbar.stateDiscovered',
  READY: 'toolbar.stateReady',
  PROCESSING_REVIEW: 'toolbar.stateProcessingReview',
  REVIEW_PENDING_PROFILE: 'toolbar.stateReviewPendingProfile',
  PROCESSED: 'toolbar.stateProcessed',
  DECISION_PENDING: 'toolbar.statePending',
  DECIDED_KEEP: 'toolbar.stateKept',
  DECIDED_REJECT: 'toolbar.stateRejected',
  ARCHIVED: 'toolbar.stateArchived',
  REJECTED: 'toolbar.stateMovedToRejects',
  PURGED: 'toolbar.statePurged',
}

export const REVIEW_WORK_QUEUE_STATES: readonly AssetState[] = [
  'READY',
  'PROCESSING_REVIEW',
  'REVIEW_PENDING_PROFILE',
  'DECISION_PENDING',
  'DECIDED_KEEP',
  'DECIDED_REJECT',
] as const

export function isReviewWorkQueueState(state: AssetState) {
  return REVIEW_WORK_QUEUE_STATES.includes(state)
}

function inferMediaTypeFromName(name: string): AssetMediaType {
  const lower = name.toLowerCase()
  if (lower.endsWith('.mov') || lower.endsWith('.mp4') || lower.endsWith('.mxf')) {
    return 'VIDEO'
  }
  if (lower.endsWith('.wav') || lower.endsWith('.mp3') || lower.endsWith('.aac')) {
    return 'AUDIO'
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
    return 'IMAGE'
  }
  return 'OTHER'
}

function getAssetMediaType(asset: Asset): AssetMediaType {
  return asset.mediaType ?? inferMediaTypeFromName(asset.name)
}

export const filterAssets = (
  assets: Asset[],
  filter: AssetFilter,
  search: string,
  options?: {
    mediaType: AssetMediaTypeFilter
    date: AssetDateFilter
  },
): Asset[] => {
  const normalizedSearch = search.trim().toLowerCase()
  const mediaTypeFilter = options?.mediaType ?? 'ALL'
  const dateFilter = options?.date ?? 'ALL'
  const now = Date.now()
  const dateThreshold = dateFilter === 'LAST_7_DAYS'
    ? now - 7 * 24 * 60 * 60 * 1000
    : dateFilter === 'LAST_30_DAYS'
      ? now - 30 * 24 * 60 * 60 * 1000
      : null

  return assets.filter((asset) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'WORK_QUEUE' ? isReviewWorkQueueState(asset.state) : asset.state === filter)
    const matchesType =
      mediaTypeFilter === 'ALL' || getAssetMediaType(asset) === mediaTypeFilter
    const capturedAtValue = asset.capturedAt ? Date.parse(asset.capturedAt) : Number.NaN
    const matchesDate =
      dateThreshold === null ||
      (Number.isFinite(capturedAtValue) && capturedAtValue >= dateThreshold)
    const matchesSearch =
      normalizedSearch.length === 0 ||
      asset.name.toLowerCase().includes(normalizedSearch) ||
      asset.id.toLowerCase().includes(normalizedSearch)

    return matchesFilter && matchesType && matchesDate && matchesSearch
  })
}

export const sortAssets = (
  assets: Asset[],
  sort: AssetSort,
): Asset[] => {
  const direction = sort.startsWith('-') ? -1 : 1
  const key = sort.startsWith('-') ? sort.slice(1) : sort
  const byName = (left: Asset, right: Asset) => left.name.localeCompare(right.name)

  return [...assets].sort((left, right) => {
    if (key === 'name') {
      return direction * byName(left, right)
    }
    const leftDateValue =
      key === 'updated_at'
        ? (left.updatedAt ?? left.capturedAt)
        : left.capturedAt
    const rightDateValue =
      key === 'updated_at'
        ? (right.updatedAt ?? right.capturedAt)
        : right.capturedAt
    const leftDate = leftDateValue ? Date.parse(leftDateValue) : Number.NaN
    const rightDate = rightDateValue ? Date.parse(rightDateValue) : Number.NaN
    const leftValid = Number.isFinite(leftDate)
    const rightValid = Number.isFinite(rightDate)
    if (leftValid && rightValid && leftDate !== rightDate) {
      return direction * (leftDate - rightDate)
    }
    if (leftValid !== rightValid) {
      return leftValid ? -1 : 1
    }
    return direction * byName(left, right)
  })
}

export const countAssetsByState = (assets: Asset[]): Record<AssetState, number> => {
  return assets.reduce<Record<AssetState, number>>(
    (accumulator, asset) => {
      accumulator[asset.state] += 1
      return accumulator
    },
    {
      DISCOVERED: 0,
      READY: 0,
      PROCESSING_REVIEW: 0,
      REVIEW_PENDING_PROFILE: 0,
      PROCESSED: 0,
      DECISION_PENDING: 0,
      DECIDED_KEEP: 0,
      DECIDED_REJECT: 0,
      ARCHIVED: 0,
      REJECTED: 0,
      PURGED: 0,
    },
  )
}

export const updateAssetState = (
  assets: Asset[],
  id: string,
  nextState: AssetState,
): Asset[] => {
  return assets.map((asset) =>
    asset.id === id ? { ...asset, state: nextState } : asset,
  )
}

export const updateAssetsState = (
  assets: Asset[],
  ids: string[],
  nextState: AssetState,
): Asset[] => {
  const idSet = new Set(ids)
  return assets.map((asset) =>
    idSet.has(asset.id) ? { ...asset, state: nextState } : asset,
  )
}

export const getStateFromDecision = (
  action: DecisionAction,
  currentState: AssetState,
): AssetState => {
  if (action === 'CLEAR') {
    if (
      currentState === 'DECIDED_KEEP' ||
      currentState === 'DECIDED_REJECT' ||
      currentState === 'ARCHIVED' ||
      currentState === 'REJECTED'
    ) {
      return 'DECISION_PENDING'
    }
    return currentState
  }

  if (currentState !== 'DECISION_PENDING' && currentState !== 'DECIDED_KEEP' && currentState !== 'DECIDED_REJECT') {
    return currentState
  }

  return action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
}
