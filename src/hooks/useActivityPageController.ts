import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActivityLog } from './useActivityLog'
import { clearActivityLog, type ActivityLogEntry } from '../services/activityLogPersistence'
import {
  readActivityFilterParams,
  writeActivityFilterParams,
  type ActivityScopeFilter,
} from '../services/workspaceQueryParams'

function matchesSearch(entry: ActivityLogEntry, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase()
  if (normalizedSearch.length === 0) {
    return true
  }

  return (
    entry.label.toLowerCase().includes(normalizedSearch) ||
    entry.scope.toLowerCase().includes(normalizedSearch) ||
    entry.assetId?.toLowerCase().includes(normalizedSearch) === true
  )
}

export function useActivityPageController() {
  const { t, i18n } = useTranslation()
  const activityLog = useActivityLog()

  const initialParams = useMemo(() => readActivityFilterParams(), [])
  const [search, setSearchState] = useState(initialParams.search ?? '')
  const [scope, setScopeState] = useState<ActivityScopeFilter>(initialParams.scope ?? 'ALL')
  const [linkedOnly, setLinkedOnlyState] = useState(initialParams.linkedOnly ?? false)

  const persistFilters = (nextSearch: string, nextScope: ActivityScopeFilter, nextLinkedOnly: boolean) => {
    writeActivityFilterParams(nextSearch, nextScope, nextLinkedOnly)
  }

  const setSearch = (value: string) => {
    setSearchState(value)
    persistFilters(value, scope, linkedOnly)
  }

  const setScope = (value: ActivityScopeFilter) => {
    setScopeState(value)
    persistFilters(search, value, linkedOnly)
  }

  const setLinkedOnly = (value: boolean) => {
    setLinkedOnlyState(value)
    persistFilters(search, scope, value)
  }

  const visibleEntries = useMemo(
    () =>
      activityLog.filter((entry) => {
        if (scope !== 'ALL' && entry.scope !== scope) {
          return false
        }
        if (linkedOnly && !entry.assetId) {
          return false
        }
        return matchesSearch(entry, search)
      }),
    [activityLog, linkedOnly, scope, search],
  )

  const linkedAssetCount = useMemo(
    () => new Set(visibleEntries.flatMap((entry) => (entry.assetId ? [entry.assetId] : []))).size,
    [visibleEntries],
  )

  const latestEntry = visibleEntries[0] ?? null
  const totalEntries = activityLog.length
  const hasActiveFilters = search.trim().length > 0 || scope !== 'ALL' || linkedOnly

  const scopeCounts = useMemo(
    () => ({
      review: activityLog.filter((entry) => entry.scope === 'review').length,
      library: activityLog.filter((entry) => entry.scope === 'library').length,
      rejects: activityLog.filter((entry) => entry.scope === 'rejects').length,
    }),
    [activityLog],
  )

  const formatTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage === 'fr' ? 'fr-BE' : 'en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.resolvedLanguage],
  )

  return {
    t,
    search,
    scope,
    linkedOnly,
    visibleEntries,
    totalEntries,
    linkedAssetCount,
    latestEntry,
    hasActiveFilters,
    scopeCounts,
    setSearch,
    setScope,
    setLinkedOnly,
    clearActivityLog,
    formatTimestamp: (value: string) => formatTimestamp.format(new Date(value)),
  } as const
}
