export const ASSET_STATES = ['DECISION_PENDING', 'DECIDED_KEEP', 'DECIDED_REJECT', 'ARCHIVED'] as const
export const ASSET_MEDIA_TYPES = ['VIDEO', 'AUDIO', 'IMAGE', 'OTHER'] as const

export type AssetState = (typeof ASSET_STATES)[number]
export type AssetFilter = AssetState | 'ALL'
export type AssetMediaType = (typeof ASSET_MEDIA_TYPES)[number]
export type AssetMediaTypeFilter = AssetMediaType | 'ALL'
export type AssetDateFilter = 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS'
export type AssetSort =
  | 'created_at'
  | '-created_at'
  | 'updated_at'
  | '-updated_at'
  | 'name'
  | '-name'
export type DecisionAction = 'KEEP' | 'REJECT' | 'CLEAR'

export type Asset = {
  id: string
  name: string
  state: AssetState
  mediaType?: AssetMediaType
  capturedAt?: string
  updatedAt?: string
  revisionEtag?: string | null
  proxyVideoUrl?: string | null
  proxyAudioUrl?: string | null
  proxyPhotoUrl?: string | null
  waveformUrl?: string | null
  tags?: string[]
  notes?: string
  fields?: Record<string, unknown>
  transcriptPreview?: string | null
  transcriptStatus?: 'NONE' | 'RUNNING' | 'DONE' | 'FAILED'
}

export const ASSET_STATE_LABEL_KEYS: Record<AssetState, string> = {
  DECISION_PENDING: 'toolbar.statePending',
  DECIDED_KEEP: 'toolbar.stateKept',
  DECIDED_REJECT: 'toolbar.stateRejected',
  ARCHIVED: 'toolbar.stateArchived',
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
    const matchesFilter = filter === 'ALL' || asset.state === filter
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
      DECISION_PENDING: 0,
      DECIDED_KEEP: 0,
      DECIDED_REJECT: 0,
      ARCHIVED: 0,
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
      currentState === 'ARCHIVED'
    ) {
      return 'DECISION_PENDING'
    }
    return currentState
  }

  return action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
}
