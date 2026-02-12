import { useCallback, useEffect } from 'react'
import type { TFunction } from 'i18next'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
} from '../domain/assets'

const QUICK_FILTER_PRESET_KEY = 'retaia_ui_quick_filter_preset'

export type QuickFilterPreset =
  | 'DEFAULT'
  | 'PENDING_RECENT'
  | 'IMAGES_REJECTED'
  | 'MEDIA_REVIEW'

type SavedView = 'DEFAULT' | 'PENDING' | 'BATCH'

type Params = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  search: string
  batchOnly: boolean
  t: TFunction
  recordAction: (label: string) => void
  setFilter: (value: AssetFilter) => void
  setMediaTypeFilter: (value: AssetMediaTypeFilter) => void
  setDateFilter: (value: AssetDateFilter) => void
  setSearch: (value: string) => void
  setBatchOnly: (value: boolean) => void
}

const applyPreset = (
  preset: QuickFilterPreset,
  setFilter: (value: AssetFilter) => void,
  setMediaTypeFilter: (value: AssetMediaTypeFilter) => void,
  setDateFilter: (value: AssetDateFilter) => void,
  setSearch: (value: string) => void,
  setBatchOnly: (value: boolean) => void,
) => {
  if (preset === 'DEFAULT') {
    setFilter('ALL')
    setMediaTypeFilter('ALL')
    setDateFilter('ALL')
    setSearch('')
    setBatchOnly(false)
    return
  }
  if (preset === 'PENDING_RECENT') {
    setFilter('DECISION_PENDING')
    setMediaTypeFilter('ALL')
    setDateFilter('LAST_7_DAYS')
    setSearch('')
    setBatchOnly(false)
    return
  }
  if (preset === 'IMAGES_REJECTED') {
    setFilter('DECIDED_REJECT')
    setMediaTypeFilter('IMAGE')
    setDateFilter('ALL')
    setSearch('')
    setBatchOnly(false)
    return
  }
  setFilter('ALL')
  setMediaTypeFilter('VIDEO')
  setDateFilter('LAST_30_DAYS')
  setSearch('')
  setBatchOnly(false)
}

const isQuickFilterPreset = (value: string): value is QuickFilterPreset =>
  value === 'DEFAULT' ||
  value === 'PENDING_RECENT' ||
  value === 'IMAGES_REJECTED' ||
  value === 'MEDIA_REVIEW'

export function useQuickFilters({
  filter,
  mediaTypeFilter,
  dateFilter,
  search,
  batchOnly,
  t,
  recordAction,
  setFilter,
  setMediaTypeFilter,
  setDateFilter,
  setSearch,
  setBatchOnly,
}: Params) {
  const clearFilters = useCallback(() => {
    if (
      filter === 'ALL' &&
      mediaTypeFilter === 'ALL' &&
      dateFilter === 'ALL' &&
      search === '' &&
      !batchOnly
    ) {
      return
    }
    recordAction(t('activity.filterReset'))
    setFilter('ALL')
    setMediaTypeFilter('ALL')
    setDateFilter('ALL')
    setSearch('')
    setBatchOnly(false)
  }, [batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch, t])

  const applySavedView = useCallback(
    (view: SavedView) => {
      if (view === 'BATCH') {
        setFilter('ALL')
        setMediaTypeFilter('ALL')
        setDateFilter('ALL')
        setSearch('')
        setBatchOnly(true)
        return
      }
      if (view === 'PENDING') {
        setFilter('DECISION_PENDING')
        setMediaTypeFilter('ALL')
        setDateFilter('ALL')
        setSearch('')
        setBatchOnly(false)
        return
      }
      applyPreset(
        'DEFAULT',
        setFilter,
        setMediaTypeFilter,
        setDateFilter,
        setSearch,
        setBatchOnly,
      )
    },
    [setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch],
  )

  const applyQuickFilterPreset = useCallback(
    (preset: QuickFilterPreset) => {
      applyPreset(
        preset,
        setFilter,
        setMediaTypeFilter,
        setDateFilter,
        setSearch,
        setBatchOnly,
      )
    },
    [setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch],
  )

  const saveQuickFilterPreset = useCallback((preset: QuickFilterPreset) => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(QUICK_FILTER_PRESET_KEY, preset)
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
  }, [])

  const applyPresetPendingRecent = useCallback(() => {
    saveQuickFilterPreset('PENDING_RECENT')
    applyQuickFilterPreset('PENDING_RECENT')
  }, [applyQuickFilterPreset, saveQuickFilterPreset])

  const applyPresetImagesRejected = useCallback(() => {
    saveQuickFilterPreset('IMAGES_REJECTED')
    applyQuickFilterPreset('IMAGES_REJECTED')
  }, [applyQuickFilterPreset, saveQuickFilterPreset])

  const applyPresetMediaReview = useCallback(() => {
    saveQuickFilterPreset('MEDIA_REVIEW')
    applyQuickFilterPreset('MEDIA_REVIEW')
  }, [applyQuickFilterPreset, saveQuickFilterPreset])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const savedPreset = window.localStorage.getItem(QUICK_FILTER_PRESET_KEY)
      if (!savedPreset || !isQuickFilterPreset(savedPreset)) {
        return
      }
      applyQuickFilterPreset(savedPreset)
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
  }, [applyQuickFilterPreset])

  return {
    clearFilters,
    applySavedView,
    applyQuickFilterPreset,
    saveQuickFilterPreset,
    applyPresetPendingRecent,
    applyPresetImagesRejected,
    applyPresetMediaReview,
  } as const
}
