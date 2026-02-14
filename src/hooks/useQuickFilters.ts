import { useCallback, useEffect } from 'react'
import type { TFunction } from 'i18next'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
} from '../domain/assets'
import {
  DEFAULT_QUICK_FILTER_STATE,
  getQuickFilterPresetState,
  getSavedViewState,
  isQuickFilterPreset,
  type QuickFilterPreset,
  type SavedView,
} from '../application/review/quickFilterPresets'
export type { QuickFilterPreset } from '../application/review/quickFilterPresets'

const QUICK_FILTER_PRESET_KEY = 'retaia_ui_quick_filter_preset'

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

const applyFilterState = (
  state: {
    filter: AssetFilter
    mediaTypeFilter: AssetMediaTypeFilter
    dateFilter: AssetDateFilter
    search: string
    batchOnly: boolean
  },
  setFilter: (value: AssetFilter) => void,
  setMediaTypeFilter: (value: AssetMediaTypeFilter) => void,
  setDateFilter: (value: AssetDateFilter) => void,
  setSearch: (value: string) => void,
  setBatchOnly: (value: boolean) => void,
) => {
  setFilter(state.filter)
  setMediaTypeFilter(state.mediaTypeFilter)
  setDateFilter(state.dateFilter)
  setSearch(state.search)
  setBatchOnly(state.batchOnly)
}

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
      filter === DEFAULT_QUICK_FILTER_STATE.filter &&
      mediaTypeFilter === DEFAULT_QUICK_FILTER_STATE.mediaTypeFilter &&
      dateFilter === DEFAULT_QUICK_FILTER_STATE.dateFilter &&
      search === DEFAULT_QUICK_FILTER_STATE.search &&
      batchOnly === DEFAULT_QUICK_FILTER_STATE.batchOnly
    ) {
      return
    }
    recordAction(t('activity.filterReset'))
    applyFilterState(DEFAULT_QUICK_FILTER_STATE, setFilter, setMediaTypeFilter, setDateFilter, setSearch, setBatchOnly)
  }, [batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, setBatchOnly, setDateFilter, setFilter, setMediaTypeFilter, setSearch, t])

  const applySavedView = useCallback(
    (view: SavedView) => {
      applyFilterState(
        getSavedViewState(view),
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
      applyFilterState(
        getQuickFilterPresetState(preset),
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
