import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
} from '../../domain/assets'

export type QuickFilterPreset =
  | 'DEFAULT'
  | 'PENDING_RECENT'
  | 'IMAGES_REJECTED'
  | 'MEDIA_REVIEW'

export type SavedView = 'DEFAULT' | 'PENDING' | 'BATCH'

export type QuickFilterState = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  search: string
  batchOnly: boolean
}

export const DEFAULT_QUICK_FILTER_STATE: QuickFilterState = {
  filter: 'ALL',
  mediaTypeFilter: 'ALL',
  dateFilter: 'ALL',
  search: '',
  batchOnly: false,
}

export function getQuickFilterPresetState(preset: QuickFilterPreset): QuickFilterState {
  if (preset === 'DEFAULT') {
    return DEFAULT_QUICK_FILTER_STATE
  }
  if (preset === 'PENDING_RECENT') {
    return {
      filter: 'DECISION_PENDING',
      mediaTypeFilter: 'ALL',
      dateFilter: 'LAST_7_DAYS',
      search: '',
      batchOnly: false,
    }
  }
  if (preset === 'IMAGES_REJECTED') {
    return {
      filter: 'DECIDED_REJECT',
      mediaTypeFilter: 'IMAGE',
      dateFilter: 'ALL',
      search: '',
      batchOnly: false,
    }
  }
  return {
    filter: 'ALL',
    mediaTypeFilter: 'VIDEO',
    dateFilter: 'LAST_30_DAYS',
    search: '',
    batchOnly: false,
  }
}

export function getSavedViewState(view: SavedView): QuickFilterState {
  if (view === 'BATCH') {
    return {
      filter: 'ALL',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      search: '',
      batchOnly: true,
    }
  }
  if (view === 'PENDING') {
    return {
      filter: 'DECISION_PENDING',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      search: '',
      batchOnly: false,
    }
  }
  return getQuickFilterPresetState('DEFAULT')
}

export const isQuickFilterPreset = (value: string): value is QuickFilterPreset =>
  value === 'DEFAULT' ||
  value === 'PENDING_RECENT' ||
  value === 'IMAGES_REJECTED' ||
  value === 'MEDIA_REVIEW'
