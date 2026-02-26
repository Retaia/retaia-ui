import { useEffect, useMemo, useState } from 'react'
import {
  readReviewWorkspaceState,
  saveReviewWorkspaceState,
} from '../../services/navigationSession'
import {
  readReviewFilterParams,
  writeReviewFilterParams,
} from '../../services/workspaceQueryParams'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSort,
} from '../../domain/assets'

type InitialFilterState = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
  search: string
  batchOnly: boolean
  batchIds: string[]
}

function resolveInitialFilterState(): InitialFilterState {
  const persistedWorkspaceState = readReviewWorkspaceState()
  const queryFilters = readReviewFilterParams()

  return {
    filter: queryFilters.filter ?? persistedWorkspaceState?.filter ?? 'ALL',
    mediaTypeFilter: queryFilters.mediaTypeFilter ?? persistedWorkspaceState?.mediaTypeFilter ?? 'ALL',
    dateFilter: queryFilters.dateFilter ?? persistedWorkspaceState?.dateFilter ?? 'ALL',
    sort: queryFilters.sort ?? persistedWorkspaceState?.sort ?? '-created_at',
    search: queryFilters.search ?? persistedWorkspaceState?.search ?? '',
    batchOnly: persistedWorkspaceState?.batchOnly ?? false,
    batchIds: persistedWorkspaceState?.batchIds ?? [],
  }
}

export function useReviewWorkspaceFilters() {
  const initialState = useMemo(() => resolveInitialFilterState(), [])
  const [filter, setFilter] = useState<AssetFilter>(initialState.filter)
  const [mediaTypeFilter, setMediaTypeFilter] = useState<AssetMediaTypeFilter>(initialState.mediaTypeFilter)
  const [dateFilter, setDateFilter] = useState<AssetDateFilter>(initialState.dateFilter)
  const [sort, setSort] = useState<AssetSort>(initialState.sort)
  const [search, setSearch] = useState(initialState.search)
  const [batchOnly, setBatchOnly] = useState(initialState.batchOnly)
  const [batchIds, setBatchIds] = useState<string[]>(initialState.batchIds)

  useEffect(() => {
    saveReviewWorkspaceState({
      filter,
      mediaTypeFilter,
      dateFilter,
      sort,
      search,
      batchOnly,
      batchIds,
    })
  }, [batchIds, batchOnly, dateFilter, filter, mediaTypeFilter, search, sort])

  useEffect(() => {
    writeReviewFilterParams({
      filter,
      mediaTypeFilter,
      dateFilter,
      sort,
      search,
    })
  }, [dateFilter, filter, mediaTypeFilter, search, sort])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const next = readReviewFilterParams()
      setFilter(next.filter ?? 'ALL')
      setMediaTypeFilter(next.mediaTypeFilter ?? 'ALL')
      setDateFilter(next.dateFilter ?? 'ALL')
      setSort(next.sort ?? '-created_at')
      setSearch(next.search ?? '')
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return {
    filter,
    setFilter,
    mediaTypeFilter,
    setMediaTypeFilter,
    dateFilter,
    setDateFilter,
    sort,
    setSort,
    search,
    setSearch,
    batchOnly,
    setBatchOnly,
    batchIds,
    setBatchIds,
  }
}
