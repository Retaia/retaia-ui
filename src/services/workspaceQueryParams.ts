import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSortKey,
  SortOrder,
} from '../domain/assets'
import { ASSET_MEDIA_TYPES, ASSET_STATES } from '../domain/assets'

type ReviewFilterParams = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sortKey: AssetSortKey
  sortOrder: SortOrder
  search: string
  batchOnly: boolean
}

function isAssetFilter(value: string | null): value is AssetFilter {
  if (!value) {
    return false
  }
  return value === 'ALL' || ASSET_STATES.includes(value as (typeof ASSET_STATES)[number])
}

function isAssetMediaTypeFilter(value: string | null): value is AssetMediaTypeFilter {
  if (!value) {
    return false
  }
  return value === 'ALL' || ASSET_MEDIA_TYPES.includes(value as (typeof ASSET_MEDIA_TYPES)[number])
}

function isAssetDateFilter(value: string | null): value is AssetDateFilter {
  return value === 'ALL' || value === 'LAST_7_DAYS' || value === 'LAST_30_DAYS'
}

function isAssetSortKey(value: string | null): value is AssetSortKey {
  return value === 'CAPTURED_AT' || value === 'NAME' || value === 'STATE'
}

function isSortOrder(value: string | null): value is SortOrder {
  return value === 'ASC' || value === 'DESC'
}

function toBatchOnlyFlag(value: string | null): boolean | null {
  if (value === '1' || value === 'true') {
    return true
  }
  if (value === '0' || value === 'false') {
    return false
  }
  return null
}

function updateCurrentSearch(params: URLSearchParams, mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') {
    return
  }
  const nextSearch = params.toString()
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (nextUrl === currentUrl) {
    return
  }
  if (mode === 'replace') {
    window.history.replaceState(window.history.state, '', nextUrl)
    return
  }
  window.history.pushState(window.history.state, '', nextUrl)
}

export function readReviewFilterParams(): Partial<ReviewFilterParams> {
  if (typeof window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(window.location.search)
  const queryFilter = params.get('filter')
  const queryMedia = params.get('media')
  const queryDate = params.get('date')
  const querySort = params.get('sort')
  const queryOrder = params.get('order')
  const querySearch = params.get('q')
  const queryBatchOnly = params.get('batch')

  return {
    filter: isAssetFilter(queryFilter) ? queryFilter : undefined,
    mediaTypeFilter: isAssetMediaTypeFilter(queryMedia) ? queryMedia : undefined,
    dateFilter: isAssetDateFilter(queryDate) ? queryDate : undefined,
    sortKey: isAssetSortKey(querySort) ? querySort : undefined,
    sortOrder: isSortOrder(queryOrder) ? queryOrder : undefined,
    search: querySearch ?? undefined,
    batchOnly: toBatchOnlyFlag(queryBatchOnly) ?? undefined,
  }
}

export function writeReviewFilterParams(
  paramsState: ReviewFilterParams,
  mode: 'push' | 'replace' = 'push',
) {
  if (typeof window === 'undefined') {
    return
  }
  const params = new URLSearchParams(window.location.search)
  if (paramsState.filter === 'ALL') {
    params.delete('filter')
  } else {
    params.set('filter', paramsState.filter)
  }
  if (paramsState.mediaTypeFilter === 'ALL') {
    params.delete('media')
  } else {
    params.set('media', paramsState.mediaTypeFilter)
  }
  if (paramsState.dateFilter === 'ALL') {
    params.delete('date')
  } else {
    params.set('date', paramsState.dateFilter)
  }
  if (paramsState.sortKey === 'CAPTURED_AT') {
    params.delete('sort')
  } else {
    params.set('sort', paramsState.sortKey)
  }
  if (paramsState.sortOrder === 'DESC') {
    params.delete('order')
  } else {
    params.set('order', paramsState.sortOrder)
  }
  const normalizedSearch = paramsState.search.trim()
  if (normalizedSearch.length === 0) {
    params.delete('q')
  } else {
    params.set('q', normalizedSearch)
  }
  if (paramsState.batchOnly) {
    params.set('batch', '1')
  } else {
    params.delete('batch')
  }
  updateCurrentSearch(params, mode)
}

export function readLibraryFilterParams(): {
  search?: string
  sortKey?: AssetSortKey
  sortOrder?: SortOrder
} {
  if (typeof window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(window.location.search)
  const querySearch = params.get('q')
  const querySort = params.get('sort')
  const queryOrder = params.get('order')
  return {
    search: querySearch ?? undefined,
    sortKey: isAssetSortKey(querySort) ? querySort : undefined,
    sortOrder: isSortOrder(queryOrder) ? queryOrder : undefined,
  }
}

export function writeLibraryFilterParams(
  search: string,
  sortKey: AssetSortKey,
  sortOrder: SortOrder,
  mode: 'push' | 'replace' = 'push',
) {
  if (typeof window === 'undefined') {
    return
  }
  const params = new URLSearchParams(window.location.search)
  const normalizedSearch = search.trim()
  if (normalizedSearch.length === 0) {
    params.delete('q')
  } else {
    params.set('q', normalizedSearch)
  }
  if (sortKey === 'CAPTURED_AT') {
    params.delete('sort')
  } else {
    params.set('sort', sortKey)
  }
  if (sortOrder === 'DESC') {
    params.delete('order')
  } else {
    params.set('order', sortOrder)
  }
  updateCurrentSearch(params, mode)
}
