import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSort,
} from '../domain/assets'
import { ASSET_MEDIA_TYPES, ASSET_STATES } from '../domain/assets'

type ReviewFilterParams = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
  search: string
}

type ApiDateRange = {
  captured_at_from?: string
  captured_at_to?: string
}

type ApiMediaTypeParam = AssetMediaTypeFilter | 'PHOTO'

function isAssetFilter(value: string | null): value is AssetFilter {
  if (!value) {
    return false
  }
  return value === 'ALL' || ASSET_STATES.includes(value as (typeof ASSET_STATES)[number])
}

function isAssetMediaTypeFilter(value: string | null): value is ApiMediaTypeParam {
  if (!value) {
    return false
  }
  return (
    value === 'ALL' ||
    value === 'PHOTO' ||
    ASSET_MEDIA_TYPES.includes(value as (typeof ASSET_MEDIA_TYPES)[number])
  )
}

function isAssetSort(value: string | null): value is AssetSort {
  return (
    value === 'created_at' ||
    value === '-created_at' ||
    value === 'updated_at' ||
    value === '-updated_at' ||
    value === 'name' ||
    value === '-name'
  )
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

function resolveDateFilterFromRange(range: ApiDateRange): AssetDateFilter | undefined {
  const fromValue = range.captured_at_from
  if (!fromValue) {
    return undefined
  }
  const fromTime = Date.parse(fromValue)
  if (!Number.isFinite(fromTime)) {
    return undefined
  }
  const ageMs = Date.now() - fromTime
  const dayMs = 24 * 60 * 60 * 1000
  if (ageMs <= 8 * dayMs) {
    return 'LAST_7_DAYS'
  }
  if (ageMs <= 31 * dayMs) {
    return 'LAST_30_DAYS'
  }
  return undefined
}

function resolveDateRange(dateFilter: AssetDateFilter): ApiDateRange {
  if (dateFilter === 'ALL') {
    return {}
  }
  const now = new Date()
  const from = new Date(now)
  if (dateFilter === 'LAST_7_DAYS') {
    from.setDate(from.getDate() - 7)
  } else {
    from.setDate(from.getDate() - 30)
  }
  return {
    captured_at_from: from.toISOString(),
    captured_at_to: now.toISOString(),
  }
}

export function readReviewFilterParams(): Partial<ReviewFilterParams> {
  if (typeof window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(window.location.search)
  const queryState = params.get('state')
  const queryMedia = params.get('media_type')
  const querySort = params.get('sort')
  const querySearch = params.get('q')
  const dateFilter = resolveDateFilterFromRange({
    captured_at_from: params.get('captured_at_from') ?? undefined,
    captured_at_to: params.get('captured_at_to') ?? undefined,
  })

  return {
    filter: isAssetFilter(queryState) ? queryState : undefined,
    mediaTypeFilter: isAssetMediaTypeFilter(queryMedia)
      ? (queryMedia === 'PHOTO' ? 'IMAGE' : queryMedia)
      : undefined,
    dateFilter,
    sort: isAssetSort(querySort) ? querySort : undefined,
    search: querySearch ?? undefined,
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
    params.delete('state')
  } else {
    params.set('state', paramsState.filter)
  }
  if (paramsState.mediaTypeFilter === 'ALL' || paramsState.mediaTypeFilter === 'OTHER') {
    params.delete('media_type')
  } else {
    params.set('media_type', paramsState.mediaTypeFilter === 'IMAGE' ? 'PHOTO' : paramsState.mediaTypeFilter)
  }
  if (paramsState.sort === '-created_at') {
    params.delete('sort')
  } else {
    params.set('sort', paramsState.sort)
  }
  const dateRange = resolveDateRange(paramsState.dateFilter)
  if (!dateRange.captured_at_from) {
    params.delete('captured_at_from')
    params.delete('captured_at_to')
  } else {
    params.set('captured_at_from', dateRange.captured_at_from)
    if (dateRange.captured_at_to) {
      params.set('captured_at_to', dateRange.captured_at_to)
    }
  }
  const normalizedSearch = paramsState.search.trim()
  if (normalizedSearch.length === 0) {
    params.delete('q')
  } else {
    params.set('q', normalizedSearch)
  }
  updateCurrentSearch(params, mode)
}

export function readLibraryFilterParams(): {
  search?: string
  sort?: AssetSort
} {
  if (typeof window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(window.location.search)
  const querySearch = params.get('q')
  const querySort = params.get('sort')
  return {
    search: querySearch ?? undefined,
    sort: isAssetSort(querySort) ? querySort : undefined,
  }
}

export function writeLibraryFilterParams(
  search: string,
  sort: AssetSort,
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
  if (sort === '-created_at') {
    params.delete('sort')
  } else {
    params.set('sort', sort)
  }
  updateCurrentSearch(params, mode)
}
