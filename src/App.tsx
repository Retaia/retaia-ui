import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Card, Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { AssetList } from './components/AssetList'
import { ActionPanels } from './components/app/ActionPanels'
import { AppHeader } from './components/app/AppHeader'
import { AssetDetailPanel } from './components/app/AssetDetailPanel'
import { NextPendingCard } from './components/app/NextPendingCard'
import { ReviewSummary } from './components/ReviewSummary'
import { ReviewToolbar } from './components/ReviewToolbar'
import { createApiClient } from './api/client'
import { mapApiSummaryToAsset } from './api/assetMapper'
import { mapApiErrorToMessage } from './api/errorMapping'
import { INITIAL_ASSETS } from './data/mockAssets'
import {
  type Asset,
  type AssetDateFilter,
  type AssetFilter,
  type AssetMediaTypeFilter,
  type AssetState,
  countAssetsByState,
  filterAssets,
  getStateFromDecision,
  type DecisionAction,
  updateAssetsState,
} from './domain/assets'
import { getActionAvailability } from './domain/actionAvailability'
import { useDensityMode } from './hooks/useDensityMode'
import { useBatchExecution } from './hooks/useBatchExecution'
import { usePurgeFlow } from './hooks/usePurgeFlow'
import { useQuickFilters } from './hooks/useQuickFilters'
import { useReviewHistory } from './hooks/useReviewHistory'
import { useReviewKeyboardShortcuts } from './hooks/useReviewKeyboardShortcuts'
import { useSelectionFlow } from './hooks/useSelectionFlow'
import { type Locale } from './i18n/resources'
import { isTypingContext } from './ui/keyboard'

const SHORTCUTS_HELP_SEEN_KEY = 'retaia_ui_shortcuts_help_seen'
const SELECTED_ASSET_QUERY_KEY = 'asset'
const REVIEW_BASE_PATH = '/review'

function getAssetIdFromLocationPath(pathname: string): string | null {
  const match = pathname.match(/^\/review\/([^/?#]+)/)
  if (!match?.[1]) {
    return null
  }
  return decodeURIComponent(match[1])
}

function getSelectedAssetIdFromLocation() {
  if (typeof window === 'undefined') {
    return null
  }
  const fromPath = getAssetIdFromLocationPath(window.location.pathname)
  if (fromPath) {
    return fromPath
  }
  const params = new URLSearchParams(window.location.search)
  return params.get(SELECTED_ASSET_QUERY_KEY)
}

function App() {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t, i18n } = useTranslation()
  const [retryStatus, setRetryStatus] = useState<string | null>(null)
  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
        // Priority: explicit env token (CI/dev), then browser session storage token.
        getAccessToken: () => {
          const envToken = import.meta.env.VITE_API_TOKEN
          if (envToken) {
            return envToken
          }
          if (typeof window !== 'undefined') {
            try {
              return window.localStorage.getItem('retaia_api_token')
            } catch {
              return null
            }
          }
          return null
        },
        onAuthError: () => {},
        onRetry: ({ attempt, maxRetries }) => {
          setRetryStatus(
            t('actions.retrying', {
              attempt,
              total: maxRetries + 1,
            }),
          )
        },
        retry: {
          maxRetries: 2,
          baseDelayMs: 50,
        },
      }),
    [t],
  )
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<AssetMediaTypeFilter>('ALL')
  const [dateFilter, setDateFilter] = useState<AssetDateFilter>('ALL')
  const [search, setSearch] = useState('')
  const [batchOnly, setBatchOnly] = useState(false)
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(() => {
    const urlAssetId = getSelectedAssetIdFromLocation()
    if (!urlAssetId) {
      return null
    }
    return INITIAL_ASSETS.some((asset) => asset.id === urlAssetId) ? urlAssetId : null
  })
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const [batchIds, setBatchIds] = useState<string[]>([])
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      const seen = window.localStorage.getItem(SHORTCUTS_HELP_SEEN_KEY)
      if (seen) {
        return false
      }
      window.localStorage.setItem(SHORTCUTS_HELP_SEEN_KEY, '1')
      return true
    } catch {
      return false
    }
  })
  const { densityMode, toggleDensityMode } = useDensityMode()
  const isApiAssetSource = useMemo(() => {
    if (import.meta.env.VITE_ASSET_SOURCE === 'api') {
      return true
    }
    if (typeof window === 'undefined') {
      return false
    }
    const params = new URLSearchParams(window.location.search)
    return params.get('source') === 'api'
  }, [])
  const [assetsLoadState, setAssetsLoadState] = useState<'idle' | 'loading' | 'error'>(
    isApiAssetSource ? 'loading' : 'idle',
  )
  const updateSelectedAssetSearchParam = useCallback(
    (nextAssetId: string | null, mode: 'push' | 'replace' = 'push') => {
      if (typeof window === 'undefined') {
        return
      }
      const params = new URLSearchParams(window.location.search)
      const currentAssetId = getSelectedAssetIdFromLocation()
      if (currentAssetId === nextAssetId) {
        return
      }
      if (nextAssetId) {
        params.set(SELECTED_ASSET_QUERY_KEY, nextAssetId)
      } else {
        params.delete(SELECTED_ASSET_QUERY_KEY)
      }
      const nextSearch = params.toString()
      const nextPathname = nextAssetId
        ? `${REVIEW_BASE_PATH}/${encodeURIComponent(nextAssetId)}`
        : REVIEW_BASE_PATH
      const nextUrl = `${nextPathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
      if (mode === 'replace') {
        window.history.replaceState(window.history.state, '', nextUrl)
        return
      }
      window.history.pushState(window.history.state, '', nextUrl)
    },
    [],
  )
  const applySelectedAssetId = useCallback(
    (nextAssetId: string | null, mode: 'push' | 'replace' = 'push') => {
      setSelectedAssetId(nextAssetId)
      setSelectionAnchorId(nextAssetId)
      updateSelectedAssetSearchParam(nextAssetId, mode)
    },
    [updateSelectedAssetSearchParam],
  )

  const visibleAssets = useMemo(() => {
    const filtered = filterAssets(assets, filter, search, {
      mediaType: mediaTypeFilter,
      date: dateFilter,
    })
    if (!batchOnly) {
      return filtered
    }
    return filtered.filter((asset) => batchIds.includes(asset.id))
  }, [assets, batchIds, batchOnly, dateFilter, filter, mediaTypeFilter, search])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handlePopState = () => {
      const urlAssetId = getSelectedAssetIdFromLocation()
      const exists = !!urlAssetId && assets.some((asset) => asset.id === urlAssetId)
      if (exists) {
        setSelectedAssetId(urlAssetId)
        setSelectionAnchorId(urlAssetId)
        return
      }
      if (urlAssetId || window.location.pathname !== REVIEW_BASE_PATH) {
        updateSelectedAssetSearchParam(null, 'replace')
      }
      setSelectedAssetId(null)
      setSelectionAnchorId(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [assets, updateSelectedAssetSearchParam])

  useEffect(() => {
    if (!isApiAssetSource) {
      return
    }

    let canceled = false
    const fetchAssets = async () => {
      setAssetsLoadState('loading')
      try {
        const summaries = await apiClient.listAssetSummaries()
        if (canceled) {
          return
        }
        setAssets(summaries.map(mapApiSummaryToAsset))
        setAssetsLoadState('idle')
      } catch {
        if (canceled) {
          return
        }
        setAssetsLoadState('error')
      }
    }

    void fetchAssets()
    return () => {
      canceled = true
    }
  }, [apiClient, isApiAssetSource])

  const batchScope = useMemo(() => {
    const summary = { pending: 0, keep: 0, reject: 0 }
    const selectedSet = new Set(batchIds)
    for (const asset of assets) {
      if (!selectedSet.has(asset.id)) {
        continue
      }
      if (asset.state === 'DECISION_PENDING') {
        summary.pending += 1
      } else if (asset.state === 'DECIDED_KEEP') {
        summary.keep += 1
      } else if (asset.state === 'DECIDED_REJECT') {
        summary.reject += 1
      }
    }
    return summary
  }, [assets, batchIds])
  const nextPendingAsset = useMemo(
    () => assets.find((asset) => asset.state === 'DECISION_PENDING') ?? null,
    [assets],
  )
  const selectedAssetState = selectedAsset?.state ?? null
  const mapBatchErrorToMessage = useCallback(
    (error: unknown) => mapApiErrorToMessage(error, t),
    [t],
  )
  const {
    previewingBatch,
    executingBatch,
    pendingBatchExecution,
    previewStatus,
    executeStatus,
    reportBatchId,
    reportLoading,
    reportStatus,
    reportData,
    reportExportStatus,
    batchTimeline,
    pendingBatchUndoSeconds,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    refreshBatchReport,
    exportBatchReport,
  } = useBatchExecution({
    apiClient,
    batchIds,
    t,
    setRetryStatus,
    mapErrorToMessage: mapBatchErrorToMessage,
  })
  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale
  const emptyAssetsMessage = useMemo(() => {
    if (!batchOnly) {
      if (filter !== 'ALL' || search.trim() !== '') {
        return t('assets.emptyFiltered')
      }
      return t('assets.empty')
    }
    if (batchIds.length === 0) {
      return t('assets.emptyBatchNone')
    }
    return t('assets.emptyBatch')
  }, [batchIds.length, batchOnly, filter, search, t])
  const selectionStatusLabel = selectedAssetId
    ? t('assets.selectionStatusOne', { id: selectedAssetId })
    : t('assets.selectionStatusNone')

  const {
    undoStack,
    activityLog,
    recordAction,
    clearActivityLog,
    undoLastAction,
  } = useReviewHistory({
    assets,
    selectedAssetId,
    batchIds,
    setAssets,
    setSelectedAssetId: applySelectedAssetId,
    setBatchIds,
    t,
  })

  const handleDecision = useCallback((id: string, action: DecisionAction) => {
    const target = assets.find((asset) => asset.id === id)
    if (!target) {
      return
    }
    const nextState = getStateFromDecision(action, target.state)
    if (nextState === target.state) {
      return
    }

    recordAction(t('activity.actionDecision', { action, id }))
    setAssets((current) =>
      current.map((asset) => {
        if (asset.id !== id) {
          return asset
        }
        return {
          ...asset,
          state: nextState,
        }
      }),
    )
  }, [assets, recordAction, t])

  const applyDecisionToVisible = (action: 'KEEP' | 'REJECT') => {
    const targetIds = visibleAssets.map((asset) => asset.id)
    if (targetIds.length === 0) {
      return
    }

    recordAction(t('activity.actionVisible', { action, count: targetIds.length }))
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, targetIds, nextState))
  }

  const applyDecisionToBatch = (action: 'KEEP' | 'REJECT') => {
    if (batchIds.length === 0) {
      return
    }
    recordAction(t('activity.actionBatch', { action, count: batchIds.length }))
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, batchIds, nextState))
    setBatchIds([])
  }

  const clearBatch = useCallback(() => {
    setBatchIds([])
  }, [])
  const applyDecisionToSelected = useCallback(
    (action: DecisionAction) => {
      if (!selectedAssetId) {
        return
      }
      handleDecision(selectedAssetId, action)
    },
    [selectedAssetId, handleDecision],
  )

  const focusPending = useCallback(() => {
    if (filter === 'DECISION_PENDING' && mediaTypeFilter === 'ALL' && dateFilter === 'ALL' && search === '') {
      return
    }
    recordAction(t('activity.filterPending'))
    setFilter('DECISION_PENDING')
    setMediaTypeFilter('ALL')
    setDateFilter('ALL')
    setSearch('')
  }, [dateFilter, filter, mediaTypeFilter, recordAction, search, t])

  const openNextPending = useCallback(() => {
    const target = assets.find((asset) => asset.state === 'DECISION_PENDING')
    if (!target) {
      return
    }
    if (filter !== 'ALL' || mediaTypeFilter !== 'ALL' || dateFilter !== 'ALL' || search !== '' || batchOnly) {
      recordAction(t('activity.openNextPending'))
      setFilter('ALL')
      setMediaTypeFilter('ALL')
      setDateFilter('ALL')
      setSearch('')
      setBatchOnly(false)
    }
    applySelectedAssetId(target.id)
  }, [applySelectedAssetId, assets, batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, t])

  const {
    clearFilters,
    applySavedView,
    applyPresetPendingRecent,
    applyPresetImagesRejected,
    applyPresetMediaReview,
  } = useQuickFilters({
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
  })

  const mapPurgeErrorToMessage = useCallback(
    (error: unknown) => mapApiErrorToMessage(error, t),
    [t],
  )
  const {
    previewingPurge,
    executingPurge,
    purgePreviewAssetId,
    purgeStatus,
    setPurgePreviewAssetId,
    setPurgeStatus,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
  } = usePurgeFlow({
    apiClient,
    selectedAsset,
    t,
    setRetryStatus,
    mapErrorToMessage: mapPurgeErrorToMessage,
    recordAction,
    onPurgeSuccess: (assetId) => {
      setAssets((current) => current.filter((asset) => asset.id !== assetId))
      setBatchIds((current) => current.filter((id) => id !== assetId))
      if (selectedAssetId === assetId) {
        applySelectedAssetId(null, 'replace')
      } else if (selectionAnchorId === assetId) {
        setSelectionAnchorId(null)
      }
    },
  })
  const setSelectedAssetIdFromSelectionFlow = useCallback(
    (value: string | null | ((current: string | null) => string | null)) => {
      if (typeof value === 'function') {
        setSelectedAssetId(value)
        return
      }
      applySelectedAssetId(value)
    },
    [applySelectedAssetId],
  )

  const {
    handleAssetClick,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    clearSelection,
    selectFirstVisibleAsset,
    selectLastVisibleAsset,
  } = useSelectionFlow({
    visibleAssets,
    selectedAssetId,
    selectionAnchorId,
    recordAction,
    t,
    setSelectedAssetId: setSelectedAssetIdFromSelectionFlow,
    setSelectionAnchorId,
    setBatchIds,
    setPurgePreviewAssetId,
    setPurgeStatus,
  })

  const toggleBatchOnly = useCallback(() => {
    recordAction(
      batchOnly ? t('activity.batchOnlyOff') : t('activity.batchOnlyOn'),
    )
    setBatchOnly((current) => !current)
  }, [batchOnly, recordAction, t])

  const selectAllVisibleInBatch = useCallback(() => {
    const missingCount = visibleAssets.filter((asset) => !batchIds.includes(asset.id)).length
    if (missingCount === 0) {
      return
    }
    recordAction(t('activity.batchVisible', { count: missingCount }))
    setBatchIds((current) => {
      const merged = new Set([...current, ...visibleAssets.map((asset) => asset.id)])
      return [...merged]
    })
  }, [batchIds, recordAction, t, visibleAssets])

  const toggleShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp((current) => !current)
  }, [])
  const availability = useMemo(
    () =>
      getActionAvailability({
        visibleCount: visibleAssets.length,
        batchCount: batchIds.length,
        previewingBatch,
        executingBatch,
        schedulingBatchExecution: !!pendingBatchExecution,
        reportBatchId,
        reportLoading,
        undoCount: undoStack.length,
        selectedAssetState: selectedAssetState as AssetState | null,
        previewingPurge,
        executingPurge,
        purgePreviewMatchesSelected:
          !!selectedAsset && purgePreviewAssetId === selectedAsset.id,
      }),
    [
      visibleAssets.length,
      batchIds.length,
      previewingBatch,
      executingBatch,
      pendingBatchExecution,
      reportBatchId,
      reportLoading,
      undoStack.length,
      selectedAsset,
      selectedAssetState,
      previewingPurge,
      executingPurge,
      purgePreviewAssetId,
    ],
  )

  const executeBatchMoveNow = useCallback(() => {
    void executeBatchMove()
  }, [executeBatchMove])

  const applyDecisionKeepToSelected = useCallback(() => {
    applyDecisionToSelected('KEEP')
  }, [applyDecisionToSelected])

  const applyDecisionRejectToSelected = useCallback(() => {
    applyDecisionToSelected('REJECT')
  }, [applyDecisionToSelected])

  const applyDecisionClearToSelected = useCallback(() => {
    applyDecisionToSelected('CLEAR')
  }, [applyDecisionToSelected])

  useReviewKeyboardShortcuts({
    selectedAssetId,
    visibleAssets,
    hasPendingBatchExecution: !!pendingBatchExecution,
    onSetSearch: setSearch,
    onSelectAllVisibleInBatch: selectAllVisibleInBatch,
    onUndoLastAction: undoLastAction,
    onExecuteBatchMoveNow: executeBatchMoveNow,
    onToggleBatchForSelectedAsset: toggleBatchForSelectedAsset,
    onClearSelection: clearSelection,
    onFocusPending: focusPending,
    onToggleBatchOnly: toggleBatchOnly,
    onOpenNextPending: openNextPending,
    onToggleDensityMode: toggleDensityMode,
    onSelectFirstVisible: selectFirstVisibleAsset,
    onSelectLastVisible: selectLastVisibleAsset,
    onRefreshBatchReport: refreshBatchReport,
    onClearActivityLog: clearActivityLog,
    onApplyPresetPendingRecent: applyPresetPendingRecent,
    onApplyPresetImagesRejected: applyPresetImagesRejected,
    onApplyPresetMediaReview: applyPresetMediaReview,
    onApplyDecisionKeep: applyDecisionKeepToSelected,
    onApplyDecisionReject: applyDecisionRejectToSelected,
    onApplyDecisionClear: applyDecisionClearToSelected,
    onToggleShortcutsHelp: toggleShortcutsHelp,
    onSelectVisibleByOffset: selectVisibleByOffset,
  })

  useEffect(() => {
    if (!selectedAssetId || !assetListRegionRef.current) {
      return
    }
    const target = assetListRegionRef.current.querySelector<HTMLElement>(
      `[data-asset-id="${selectedAssetId}"]`,
    )
    if (!target) {
      return
    }
    const activeElement = document.activeElement
    if (!isTypingContext(activeElement) && activeElement !== target) {
      target.focus()
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedAssetId, visibleAssets])

  return (
    <Container as="main" className="py-4">
      <AppHeader
        locale={locale}
        t={t}
        onChangeLanguage={(value) => {
          void i18n.changeLanguage(value)
        }}
      />

      <ReviewSummary
        total={assets.length}
        counts={counts}
        labels={{
          region: t('summary.region'),
          total: t('summary.total'),
          pending: t('summary.pending'),
          keep: t('summary.keep'),
          reject: t('summary.reject'),
        }}
      />
      <ReviewToolbar
        filter={filter}
        mediaTypeFilter={mediaTypeFilter}
        dateFilter={dateFilter}
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          mediaType: t('toolbar.mediaType'),
          date: t('toolbar.date'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
          date7d: t('toolbar.date7d'),
          date30d: t('toolbar.date30d'),
        }}
        onFilterChange={setFilter}
        onMediaTypeFilterChange={setMediaTypeFilter}
        onDateFilterChange={setDateFilter}
        onSearchChange={setSearch}
      />
      {isApiAssetSource && assetsLoadState === 'loading' ? (
        <Alert variant="info" className="py-2 mt-3 mb-0" data-testid="assets-loading-status">
          {t('assets.loading')}
        </Alert>
      ) : null}
      {isApiAssetSource && assetsLoadState === 'error' ? (
        <Alert variant="warning" className="py-2 mt-3 mb-0" data-testid="assets-error-status">
          {t('assets.loadError')}
        </Alert>
      ) : null}

      <ActionPanels
        t={t}
        batchOnly={batchOnly}
        densityMode={densityMode}
        availability={availability}
        batchIdsLength={batchIds.length}
        batchScope={batchScope}
        batchTimeline={batchTimeline}
        pendingBatchExecution={pendingBatchExecution}
        pendingBatchUndoSeconds={pendingBatchUndoSeconds}
        previewingBatch={previewingBatch}
        executingBatch={executingBatch}
        previewStatus={previewStatus}
        executeStatus={executeStatus}
        retryStatus={retryStatus}
        reportBatchId={reportBatchId}
        reportStatus={reportStatus}
        reportData={reportData}
        reportExportStatus={reportExportStatus}
        undoStackLength={undoStack.length}
        activityLog={activityLog}
        showShortcutsHelp={showShortcutsHelp}
        onApplySavedView={applySavedView}
        onApplyPresetPendingRecent={applyPresetPendingRecent}
        onApplyPresetImagesRejected={applyPresetImagesRejected}
        onApplyPresetMediaReview={applyPresetMediaReview}
        onFocusPending={focusPending}
        onToggleBatchOnly={toggleBatchOnly}
        onApplyDecisionToVisible={applyDecisionToVisible}
        onClearFilters={clearFilters}
        onToggleDensityMode={toggleDensityMode}
        onApplyDecisionToBatch={applyDecisionToBatch}
        onClearBatch={clearBatch}
        onPreviewBatchMove={previewBatchMove}
        onExecuteBatchMove={executeBatchMove}
        onCancelPendingBatchExecution={cancelPendingBatchExecution}
        onRefreshBatchReport={refreshBatchReport}
        onExportBatchReport={exportBatchReport}
        onUndoLastAction={undoLastAction}
        onClearActivityLog={clearActivityLog}
        onToggleShortcutsHelp={toggleShortcutsHelp}
        onOpenNextPending={openNextPending}
      />

      <NextPendingCard
        nextPendingAsset={nextPendingAsset}
        t={t}
        onOpenNextPending={openNextPending}
        onDecision={handleDecision}
      />

      <Row as="section" className="g-3 mt-1">
        <Col
          as="section"
          xs={12}
          xl={8}
          aria-label={t('assets.region')}
          ref={assetListRegionRef}
        >
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h2 className="h5">{t('assets.title', { count: visibleAssets.length })}</h2>
              <p className="small mb-1 text-secondary" data-testid="selection-status">
                {selectionStatusLabel}
              </p>
              <p className="small mb-2 text-secondary" data-testid="batch-status">
                {t('assets.batchStatus', { count: batchIds.length })}
              </p>
              <p className="small text-secondary">{t('assets.help')}</p>
              <AssetList
                assets={visibleAssets}
                selectedAssetId={selectedAssetId}
                batchIds={batchIds}
                density={densityMode}
                labels={{
                  empty: emptyAssetsMessage,
                  batch: t('assets.batchBadge'),
                  keep: 'KEEP',
                  reject: 'REJECT',
                  clear: 'CLEAR',
                }}
                onDecision={handleDecision}
                onAssetClick={handleAssetClick}
              />
            </Card.Body>
          </Card>
        </Col>

        <AssetDetailPanel
          selectedAsset={selectedAsset}
          availability={availability}
          previewingPurge={previewingPurge}
          executingPurge={executingPurge}
          purgeStatus={purgeStatus}
          t={t}
          onDecision={handleDecision}
          onPreviewPurge={previewSelectedAssetPurge}
          onExecutePurge={executeSelectedAssetPurge}
        />
      </Row>
    </Container>
  )
}

export default App
