import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { AssetList } from './components/AssetList'
import { BatchReportView } from './components/BatchReportView'
import { ReviewSummary } from './components/ReviewSummary'
import { ReviewToolbar } from './components/ReviewToolbar'
import { createApiClient } from './api/client'
import { mapApiErrorToMessage } from './api/errorMapping'
import { INITIAL_ASSETS } from './data/mockAssets'
import {
  type Asset,
  type AssetFilter,
  type AssetState,
  countAssetsByState,
  filterAssets,
  getStateFromDecision,
  type DecisionAction,
  updateAssetsState,
} from './domain/assets'
import { getActionAvailability } from './domain/actionAvailability'
import { type Locale } from './i18n/resources'
import { isTypingContext } from './ui/keyboard'

function App() {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t, i18n } = useTranslation()
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
      }),
    [],
  )
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const [batchIds, setBatchIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<
    Array<{ assets: Asset[]; selectedAssetId: string | null; batchIds: string[] }>
  >([])
  const [activityLog, setActivityLog] = useState<Array<{ id: number; label: string }>>([])
  const [previewingBatch, setPreviewingBatch] = useState(false)
  const [executingBatch, setExecutingBatch] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [executeStatus, setExecuteStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [reportBatchId, setReportBatchId] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportStatus, setReportStatus] = useState<string | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)
  const [previewingPurge, setPreviewingPurge] = useState(false)
  const [executingPurge, setExecutingPurge] = useState(false)
  const [purgePreviewAssetId, setPurgePreviewAssetId] = useState<string | null>(null)
  const [purgeStatus, setPurgeStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const activityId = useRef(1)

  const visibleAssets = useMemo(() => {
    return filterAssets(assets, filter, search)
  }, [assets, filter, search])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )
  const nextPendingAsset = useMemo(
    () => assets.find((asset) => asset.state === 'DECISION_PENDING') ?? null,
    [assets],
  )
  const selectedAssetState = selectedAsset?.state ?? null
  const availability = useMemo(
    () =>
      getActionAvailability({
        visibleCount: visibleAssets.length,
        batchCount: batchIds.length,
        previewingBatch,
        executingBatch,
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
  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale

  const logActivity = useCallback((label: string) => {
    setActivityLog((current) =>
      [{ id: activityId.current++, label }, ...current].slice(0, 8),
    )
  }, [])

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((current) =>
      [{ assets, selectedAssetId, batchIds }, ...current].slice(0, 30),
    )
  }, [assets, selectedAssetId, batchIds])

  const recordAction = useCallback(
    (label: string) => {
      pushUndoSnapshot()
      logActivity(label)
    },
    [logActivity, pushUndoSnapshot],
  )

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

  const toggleBatchAsset = useCallback(
    (id: string) => {
      setBatchIds((current) => {
        const willAdd = !current.includes(id)
        recordAction(
          willAdd
            ? t('activity.batchAdd', { id })
            : t('activity.batchRemove', { id }),
        )
        return willAdd ? [...current, id] : current.filter((value) => value !== id)
      })
    },
    [recordAction, t],
  )

  const handleAssetClick = (id: string, shiftKey: boolean) => {
    if (shiftKey) {
      toggleBatchAsset(id)
      return
    }
    setSelectedAssetId(id)
    setSelectionAnchorId(id)
  }

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
    if (filter === 'DECISION_PENDING' && search === '') {
      return
    }
    recordAction(t('activity.filterPending'))
    setFilter('DECISION_PENDING')
    setSearch('')
  }, [filter, recordAction, search, t])

  const clearFilters = () => {
    if (filter === 'ALL' && search === '') {
      return
    }
    recordAction(t('activity.filterReset'))
    setFilter('ALL')
    setSearch('')
  }

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

  const undoLastAction = useCallback(() => {
    setUndoStack((current) => {
      if (current.length === 0) {
        return current
      }
      const [last, ...rest] = current
      setAssets(last.assets)
      setSelectedAssetId(last.selectedAssetId)
      setBatchIds(last.batchIds)
      logActivity(t('activity.undo'))
      return rest
    })
  }, [logActivity, t])

  const selectVisibleByOffset = useCallback(
    (offset: -1 | 1, extendBatchRange = false) => {
      if (visibleAssets.length === 0) {
        return
      }

      if (!selectedAssetId) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const currentIndex = visibleAssets.findIndex((asset) => asset.id === selectedAssetId)
      if (currentIndex < 0) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const nextIndex = Math.min(
        visibleAssets.length - 1,
        Math.max(0, currentIndex + offset),
      )
      const nextId = visibleAssets[nextIndex].id

      if (!extendBatchRange) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const anchorId = selectionAnchorId ?? selectedAssetId
      const anchorIndex = visibleAssets.findIndex((asset) => asset.id === anchorId)
      if (anchorIndex < 0) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const startIndex = Math.min(anchorIndex, nextIndex)
      const endIndex = Math.max(anchorIndex, nextIndex)
      const rangeIds = visibleAssets
        .slice(startIndex, endIndex + 1)
        .map((asset) => asset.id)

      setSelectedAssetId(nextId)
      setSelectionAnchorId(anchorId)
      setBatchIds((current) => {
        const merged = new Set([...current, ...rangeIds])
        const addedCount = merged.size - current.length
        if (addedCount > 0) {
          recordAction(t('activity.range', { count: addedCount }))
        }
        return [...merged]
      })
    },
    [recordAction, selectedAssetId, selectionAnchorId, t, visibleAssets],
  )

  const toggleBatchForSelectedAsset = useCallback(() => {
    if (!selectedAssetId) {
      return
    }
    toggleBatchAsset(selectedAssetId)
  }, [selectedAssetId, toggleBatchAsset])

  const previewBatchMove = useCallback(async () => {
    if (batchIds.length === 0 || previewingBatch) {
      return
    }

    setPreviewingBatch(true)
    setPreviewStatus(null)

    try {
      await apiClient.previewMoveBatch({
        include: 'BOTH',
        limit: batchIds.length,
      })
      setPreviewStatus({
        kind: 'success',
        message: t('actions.previewResult', {
          include: 'BOTH',
          count: batchIds.length,
        }),
      })
    } catch (error) {
      setPreviewStatus({
        kind: 'error',
        message: t('actions.previewError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setPreviewingBatch(false)
    }
  }, [apiClient, batchIds.length, previewingBatch, t])

  const executeBatchMove = useCallback(async () => {
    if (batchIds.length === 0 || executingBatch) {
      return
    }

    setExecutingBatch(true)
    setExecuteStatus(null)

    try {
      const response = await apiClient.executeMoveBatch(
        {
          mode: 'EXECUTE',
          selection: { asset_ids: batchIds },
        },
        crypto.randomUUID(),
      )
      const batchId =
        response && typeof response === 'object' && 'batch_id' in response
          ? String(response.batch_id)
          : null
      setReportBatchId(batchId)
      setExecuteStatus({
        kind: 'success',
        message: t('actions.executeResult'),
      })
      if (!batchId) {
        return
      }
      setReportLoading(true)
      setReportStatus(null)
      try {
        const report = await apiClient.getMoveBatchReport(batchId)
        setReportData(report)
        setReportStatus(t('actions.reportReady', { batchId }))
      } catch (error) {
        setReportStatus(
          t('actions.reportError', {
            message: mapApiErrorToMessage(error, t),
          }),
        )
      } finally {
        setReportLoading(false)
      }
    } catch (error) {
      setExecuteStatus({
        kind: 'error',
        message: t('actions.executeError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setExecutingBatch(false)
    }
  }, [apiClient, batchIds, executingBatch, t])

  const refreshBatchReport = useCallback(async () => {
    if (!reportBatchId || reportLoading) {
      return
    }

    setReportLoading(true)
    setReportStatus(null)

    try {
      const report = await apiClient.getMoveBatchReport(reportBatchId)
      setReportData(report)
      setReportStatus(t('actions.reportReady', { batchId: reportBatchId }))
    } catch (error) {
      setReportStatus(
        t('actions.reportError', {
          message: mapApiErrorToMessage(error, t),
        }),
      )
    } finally {
      setReportLoading(false)
    }
  }, [apiClient, reportBatchId, reportLoading, t])

  const previewSelectedAssetPurge = useCallback(async () => {
    if (!selectedAsset || selectedAsset.state !== 'DECIDED_REJECT' || previewingPurge) {
      return
    }

    setPreviewingPurge(true)
    setPurgeStatus(null)

    try {
      await apiClient.previewAssetPurge(selectedAsset.id)
      setPurgePreviewAssetId(selectedAsset.id)
      setPurgeStatus({
        kind: 'success',
        message: t('actions.purgePreviewReady', { id: selectedAsset.id }),
      })
    } catch (error) {
      setPurgePreviewAssetId(null)
      setPurgeStatus({
        kind: 'error',
        message: t('actions.purgePreviewError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setPreviewingPurge(false)
    }
  }, [apiClient, previewingPurge, selectedAsset, t])

  const executeSelectedAssetPurge = useCallback(async () => {
    if (
      !selectedAsset ||
      selectedAsset.state !== 'DECIDED_REJECT' ||
      purgePreviewAssetId !== selectedAsset.id ||
      executingPurge
    ) {
      return
    }

    setExecutingPurge(true)
    setPurgeStatus(null)

    try {
      await apiClient.executeAssetPurge(selectedAsset.id, crypto.randomUUID())
      recordAction(t('activity.purge', { id: selectedAsset.id }))
      setAssets((current) => current.filter((asset) => asset.id !== selectedAsset.id))
      setBatchIds((current) => current.filter((id) => id !== selectedAsset.id))
      setSelectedAssetId((current) => (current === selectedAsset.id ? null : current))
      setSelectionAnchorId((current) => (current === selectedAsset.id ? null : current))
      setPurgePreviewAssetId(null)
      setPurgeStatus({
        kind: 'success',
        message: t('actions.purgeResult', { id: selectedAsset.id }),
      })
    } catch (error) {
      setPurgeStatus({
        kind: 'error',
        message: t('actions.purgeError', {
          message: mapApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setExecutingPurge(false)
    }
  }, [apiClient, executingPurge, purgePreviewAssetId, recordAction, selectedAsset, t])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingContext(event.target)) {
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        selectAllVisibleInBatch()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undoLastAction()
        return
      }

      if (
        event.shiftKey &&
        (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space' || event.code === 'Space')
      ) {
        event.preventDefault()
        toggleBatchForSelectedAsset()
        return
      }

      if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
        const key = event.key.toLowerCase()
        if (key === 'escape') {
          event.preventDefault()
          setSelectedAssetId(null)
          setSelectionAnchorId(null)
          setPurgePreviewAssetId(null)
          setPurgeStatus(null)
          return
        }
        if (key === 'p') {
          event.preventDefault()
          focusPending()
          return
        }
        if (event.key === '/') {
          event.preventDefault()
          const searchInput = document.getElementById('asset-search')
          if (searchInput instanceof HTMLInputElement) {
            searchInput.focus()
            searchInput.select()
          }
          return
        }
        if (key === 'g') {
          event.preventDefault()
          applyDecisionToSelected('KEEP')
          return
        }
        if (key === 'v') {
          event.preventDefault()
          applyDecisionToSelected('REJECT')
          return
        }
        if (key === 'x') {
          event.preventDefault()
          applyDecisionToSelected('CLEAR')
          return
        }
      }

      if (event.key === '?') {
        event.preventDefault()
        setShowShortcutsHelp((current) => !current)
        return
      }

      if (event.key === 'j') {
        event.preventDefault()
        selectVisibleByOffset(1)
        return
      }

      if (event.key === 'k') {
        event.preventDefault()
        selectVisibleByOffset(-1)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        selectVisibleByOffset(1, event.shiftKey)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        selectVisibleByOffset(-1, event.shiftKey)
        return
      }

      if (event.key === 'Enter' && !selectedAssetId && visibleAssets.length > 0) {
        event.preventDefault()
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    selectedAssetId,
    visibleAssets,
    focusPending,
    selectAllVisibleInBatch,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    applyDecisionToSelected,
    undoLastAction,
  ])

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
    }
  }, [selectedAssetId, visibleAssets])

  useEffect(() => {
    if (!selectedAsset || selectedAsset.id === purgePreviewAssetId) {
      return
    }
    setPurgePreviewAssetId(null)
  }, [purgePreviewAssetId, selectedAsset])

  return (
    <Container as="main" className="py-4">
      <header className="mb-3">
        <Stack direction="horizontal" className="justify-content-between align-items-start gap-2">
          <div>
            <h1 className="display-6 fw-bold mb-1">{t('app.title')}</h1>
            <p className="text-secondary mb-0">{t('app.subtitle')}</p>
          </div>
          <Stack direction="horizontal" gap={2} aria-label={t('app.language')}>
            <Button
              type="button"
              size="sm"
              variant={locale === 'fr' ? 'primary' : 'outline-primary'}
              onClick={() => void i18n.changeLanguage('fr')}
              aria-label={t('app.language.fr')}
            >
              FR
            </Button>
            <Button
              type="button"
              size="sm"
              variant={locale === 'en' ? 'primary' : 'outline-primary'}
              onClick={() => void i18n.changeLanguage('en')}
              aria-label={t('app.language.en')}
            >
              EN
            </Button>
          </Stack>
        </Stack>
      </header>

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
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
        }}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      <Card as="section" className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h2 className="h5 mb-3">{t('actions.title')}</h2>
          <Stack direction="horizontal" className="flex-wrap gap-2">
            <Button type="button" variant="outline-primary" onClick={focusPending}>
              {t('actions.focusPending')}
            </Button>
            <Button
            type="button"
            variant="outline-success"
            onClick={() => applyDecisionToVisible('KEEP')}
            disabled={availability.keepVisibleDisabled}
          >
            {t('actions.keepVisible')}
            </Button>
            <Button
            type="button"
            variant="outline-danger"
            onClick={() => applyDecisionToVisible('REJECT')}
            disabled={availability.rejectVisibleDisabled}
          >
            {t('actions.rejectVisible')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={clearFilters}>
              {t('actions.clearFilters')}
            </Button>
          </Stack>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-3">
            <p className="mb-0 fw-semibold text-secondary">
              {t('actions.batchSelected', { count: batchIds.length })}
            </p>
            <Button
            type="button"
            variant="outline-success"
            onClick={() => applyDecisionToBatch('KEEP')}
            disabled={availability.keepBatchDisabled}
          >
            {t('actions.keepBatch')}
            </Button>
            <Button
            type="button"
            variant="outline-danger"
            onClick={() => applyDecisionToBatch('REJECT')}
            disabled={availability.rejectBatchDisabled}
          >
            {t('actions.rejectBatch')}
            </Button>
            <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setBatchIds([])}
            disabled={availability.clearBatchDisabled}
          >
            {t('actions.clearBatch')}
            </Button>
            <Button
              type="button"
              variant="outline-info"
              onClick={() => void previewBatchMove()}
              disabled={availability.previewBatchDisabled}
            >
              {previewingBatch ? t('actions.previewing') : t('actions.previewBatch')}
            </Button>
            <Button
              type="button"
              variant="info"
              onClick={() => void executeBatchMove()}
              disabled={availability.executeBatchDisabled}
            >
              {executingBatch ? t('actions.executing') : t('actions.executeBatch')}
            </Button>
          </Stack>
          {previewStatus ? (
            <p
              data-testid="batch-preview-status"
              role="status"
              aria-live="polite"
              className={[
                'mt-2',
                'mb-0',
                previewStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {previewStatus.message}
            </p>
          ) : null}
          {executeStatus ? (
            <p
              data-testid="batch-execute-status"
              role="status"
              aria-live="polite"
              className={[
                'mt-2',
                'mb-0',
                executeStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {executeStatus.message}
            </p>
          ) : null}
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
            <h3 className="h6 mb-2">{t('actions.reportTitle')}</h3>
            <Stack direction="horizontal" className="flex-wrap align-items-center gap-2">
              <Button
                type="button"
                variant="outline-info"
                onClick={() => void refreshBatchReport()}
                disabled={availability.refreshReportDisabled}
              >
                {t('actions.reportFetch')}
              </Button>
              <p className="small text-secondary mb-0">
                {reportBatchId ? `batch_id: ${reportBatchId}` : t('actions.reportEmpty')}
              </p>
            </Stack>
            {reportStatus ? (
              <p
                data-testid="batch-report-status"
                role="status"
                aria-live="polite"
                className="small mt-2 mb-0 text-secondary"
              >
                {reportStatus}
              </p>
            ) : null}
            {reportData ? (
              <BatchReportView
                report={reportData}
                labels={{
                  summary: t('actions.reportSummary'),
                  status: t('actions.reportStatusLabel'),
                  moved: t('actions.reportMovedLabel'),
                  failed: t('actions.reportFailedLabel'),
                  errors: t('actions.reportErrorsLabel'),
                  noErrors: t('actions.reportNoErrors'),
                }}
              />
            ) : null}
          </section>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-3">
            <Button
              type="button"
              variant="warning"
              onClick={undoLastAction}
              disabled={availability.undoDisabled}
            >
              {t('actions.undo')}
            </Button>
            <p className="mb-0 fw-semibold text-secondary">
              {t('actions.history', { count: undoStack.length })}
            </p>
          </Stack>
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('actions.journal')}>
            <h3 className="h6 mb-2">{t('actions.journal')}</h3>
            {activityLog.length === 0 ? (
              <p className="text-secondary mb-0">{t('actions.journalEmpty')}</p>
            ) : (
              <ul className="mb-0">
                {activityLog.map((entry) => (
                  <li key={entry.id}>{entry.label}</li>
                ))}
              </ul>
            )}
          </section>
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
            <Stack direction="horizontal" className="justify-content-between align-items-center gap-2">
              <h3 className="h6 mb-0">{t('actions.shortcutsTitle')}</h3>
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                onClick={() => setShowShortcutsHelp((current) => !current)}
              >
                {showShortcutsHelp
                  ? t('actions.shortcutsToggleHide')
                  : t('actions.shortcutsToggleShow')}
              </Button>
            </Stack>
            {showShortcutsHelp ? (
              <p className="small text-secondary mb-0 mt-2">{t('actions.shortcuts')}</p>
            ) : null}
          </section>
        </Card.Body>
      </Card>

      <Card as="section" className="shadow-sm border-0 mt-3" aria-label={t('next.region')}>
        <Card.Body>
          <h2 className="h5 mb-3">{t('next.title')}</h2>
          {nextPendingAsset ? (
            <Stack direction="horizontal" className="flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <strong className="d-block">{nextPendingAsset.name}</strong>
                <p className="text-secondary mb-0">{nextPendingAsset.id}</p>
              </div>
              <Stack direction="horizontal" gap={2}>
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => handleDecision(nextPendingAsset.id, 'KEEP')}
                >
                  KEEP
                </Button>
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={() => handleDecision(nextPendingAsset.id, 'REJECT')}
                >
                  REJECT
                </Button>
              </Stack>
            </Stack>
          ) : (
            <p className="text-secondary mb-0">{t('next.empty')}</p>
          )}
        </Card.Body>
      </Card>

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
              <p className="small text-secondary">{t('assets.help')}</p>
              <AssetList
                assets={visibleAssets}
                selectedAssetId={selectedAssetId}
                batchIds={batchIds}
                labels={{
                  empty: t('assets.empty'),
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

        <Col as="section" xs={12} xl={4} aria-label={t('detail.region')}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h2 className="h5">{t('detail.title')}</h2>
              {selectedAsset ? (
                <div>
                  <strong className="d-block">{selectedAsset.name}</strong>
                  <p className="text-secondary mb-1">
                    {t('detail.id', { id: selectedAsset.id })}
                  </p>
                  <p className="text-secondary mb-3">
                    {t('detail.state', { state: selectedAsset.state })}
                  </p>
                  <Stack direction="horizontal" className="flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline-success"
                      onClick={() => handleDecision(selectedAsset.id, 'KEEP')}
                    >
                      KEEP
                    </Button>
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => handleDecision(selectedAsset.id, 'REJECT')}
                    >
                      REJECT
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => handleDecision(selectedAsset.id, 'CLEAR')}
                    >
                      CLEAR
                    </Button>
                  </Stack>
                  <section className="border border-2 border-danger-subtle rounded p-3 mt-3">
                    <h3 className="h6 mb-2">{t('actions.purgeTitle')}</h3>
                    <p className="small text-secondary mb-2">{t('actions.purgeHelp')}</p>
                    <Stack direction="horizontal" className="flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline-danger"
                        onClick={() => void previewSelectedAssetPurge()}
                        disabled={availability.previewPurgeDisabled}
                      >
                        {previewingPurge ? t('actions.purgePreviewing') : t('actions.purgePreview')}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void executeSelectedAssetPurge()}
                        disabled={availability.executePurgeDisabled}
                      >
                        {executingPurge ? t('actions.purging') : t('actions.purgeConfirm')}
                      </Button>
                    </Stack>
                  </section>
                </div>
              ) : (
                <p className="text-secondary mb-0">{t('detail.empty')}</p>
              )}
              {purgeStatus ? (
                <p
                  data-testid="asset-purge-status"
                  role="status"
                  aria-live="polite"
                  className={[
                    'small',
                    'mt-3',
                    'mb-0',
                    purgeStatus.kind === 'success' ? 'text-success' : 'text-danger',
                  ].join(' ')}
                >
                  {purgeStatus.message}
                </p>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default App
