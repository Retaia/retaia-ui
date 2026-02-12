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
import { type Locale } from './i18n/resources'
import { isTypingContext } from './ui/keyboard'

const SHORTCUTS_HELP_SEEN_KEY = 'retaia_ui_shortcuts_help_seen'
const BATCH_EXECUTION_UNDO_WINDOW_MS = 6000
const DENSITY_MODE_KEY = 'retaia_ui_density_mode'
type DensityMode = 'COMFORTABLE' | 'COMPACT'
const QUICK_FILTER_PRESET_KEY = 'retaia_ui_quick_filter_preset'

type QuickFilterPreset = 'DEFAULT' | 'PENDING_RECENT' | 'IMAGES_REJECTED' | 'MEDIA_REVIEW'

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
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const [batchIds, setBatchIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<
    Array<{ assets: Asset[]; selectedAssetId: string | null; batchIds: string[] }>
  >([])
  const [activityLog, setActivityLog] = useState<Array<{ id: number; label: string }>>([])
  const [previewingBatch, setPreviewingBatch] = useState(false)
  const [executingBatch, setExecutingBatch] = useState(false)
  const [pendingBatchExecution, setPendingBatchExecution] = useState<{
    assetIds: string[]
    expiresAt: number
  } | null>(null)
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
  const [reportExportStatus, setReportExportStatus] = useState<string | null>(null)
  const [previewingPurge, setPreviewingPurge] = useState(false)
  const [executingPurge, setExecutingPurge] = useState(false)
  const [purgePreviewAssetId, setPurgePreviewAssetId] = useState<string | null>(null)
  const [purgeStatus, setPurgeStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [densityMode, setDensityMode] = useState<DensityMode>('COMFORTABLE')
  const activityId = useRef(1)
  const pendingBatchExecutionTimer = useRef<number | null>(null)

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

  const batchTimeline = useMemo(() => {
    const queued = !!pendingBatchExecution
    const running = executingBatch
    const failed = executeStatus?.kind === 'error'
    const done = executeStatus?.kind === 'success' && !queued && !running

    return [
      {
        key: 'queued',
        active: queued,
        done: !queued && (running || done || failed),
        label: t('actions.timelineQueued'),
      },
      {
        key: 'running',
        active: running,
        done: !running && (done || failed),
        label: t('actions.timelineRunning'),
      },
      {
        key: 'done',
        active: done,
        done,
        error: failed,
        label: failed ? t('actions.timelineError') : t('actions.timelineDone'),
      },
    ]
  }, [executeStatus?.kind, executingBatch, pendingBatchExecution, t])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const seen = window.localStorage.getItem(SHORTCUTS_HELP_SEEN_KEY)
      if (seen) {
        return
      }
      setShowShortcutsHelp(true)
      window.localStorage.setItem(SHORTCUTS_HELP_SEEN_KEY, '1')
    } catch {
      // Ignore storage access errors and keep default UI behavior.
    }
  }, [])

  useEffect(
    () => () => {
      if (pendingBatchExecutionTimer.current !== null) {
        window.clearTimeout(pendingBatchExecutionTimer.current)
      }
    },
    [],
  )
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const saved = window.localStorage.getItem(DENSITY_MODE_KEY)
      if (saved === 'COMPACT' || saved === 'COMFORTABLE') {
        setDensityMode(saved)
      }
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
  }, [])

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
    setSelectedAssetId(target.id)
    setSelectionAnchorId(target.id)
  }, [assets, batchOnly, dateFilter, filter, mediaTypeFilter, recordAction, search, t])

  const clearFilters = () => {
    if (filter === 'ALL' && mediaTypeFilter === 'ALL' && dateFilter === 'ALL' && search === '' && !batchOnly) {
      return
    }
    recordAction(t('activity.filterReset'))
    setFilter('ALL')
    setMediaTypeFilter('ALL')
    setDateFilter('ALL')
    setSearch('')
    setBatchOnly(false)
  }

  const applySavedView = useCallback(
    (view: 'DEFAULT' | 'PENDING' | 'BATCH') => {
      if (view === 'DEFAULT') {
        setFilter('ALL')
        setMediaTypeFilter('ALL')
        setDateFilter('ALL')
        setSearch('')
        setBatchOnly(false)
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
      setFilter('ALL')
      setMediaTypeFilter('ALL')
      setDateFilter('ALL')
      setSearch('')
      setBatchOnly(true)
    },
    [],
  )

  const applyQuickFilterPreset = useCallback((preset: QuickFilterPreset) => {
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
  }, [])

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const raw = window.localStorage.getItem(QUICK_FILTER_PRESET_KEY)
      if (!raw) {
        return
      }
      const preset = raw as QuickFilterPreset
      if (
        preset !== 'DEFAULT' &&
        preset !== 'PENDING_RECENT' &&
        preset !== 'IMAGES_REJECTED' &&
        preset !== 'MEDIA_REVIEW'
      ) {
        return
      }
      applyQuickFilterPreset(preset)
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
  }, [applyQuickFilterPreset])

  const clearActivityLog = useCallback(() => {
    if (activityLog.length === 0) {
      return
    }
    setActivityLog([])
  }, [activityLog.length])

  const toggleDensityMode = useCallback(() => {
    setDensityMode((current) => {
      const next = current === 'COMPACT' ? 'COMFORTABLE' : 'COMPACT'
      try {
        window.localStorage.setItem(DENSITY_MODE_KEY, next)
      } catch {
        // Ignore storage access errors and keep default behavior.
      }
      return next
    })
  }, [])

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
    setRetryStatus(null)

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
      setRetryStatus(null)
    }
  }, [apiClient, batchIds.length, previewingBatch, t])

  const runBatchExecution = useCallback(
    async (assetIds: string[]) => {
      if (assetIds.length === 0 || executingBatch) {
        return
      }

      setExecutingBatch(true)
      setExecuteStatus(null)
      setRetryStatus(null)

      try {
        const response = await apiClient.executeMoveBatch(
          {
            mode: 'EXECUTE',
            selection: { asset_ids: assetIds },
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
        setRetryStatus(null)
      }
    },
    [apiClient, executingBatch, t],
  )

  const cancelPendingBatchExecution = useCallback(() => {
    if (!pendingBatchExecution) {
      return
    }
    if (pendingBatchExecutionTimer.current !== null) {
      window.clearTimeout(pendingBatchExecutionTimer.current)
      pendingBatchExecutionTimer.current = null
    }
    setPendingBatchExecution(null)
    setExecuteStatus({
      kind: 'success',
      message: t('actions.executeCanceled'),
    })
  }, [pendingBatchExecution, t])

  const executeBatchMove = useCallback(async () => {
    if (executingBatch) {
      return
    }

    if (pendingBatchExecution) {
      if (pendingBatchExecutionTimer.current !== null) {
        window.clearTimeout(pendingBatchExecutionTimer.current)
        pendingBatchExecutionTimer.current = null
      }
      const selection = pendingBatchExecution.assetIds
      setPendingBatchExecution(null)
      await runBatchExecution(selection)
      return
    }

    if (batchIds.length === 0) {
      return
    }

    const selection = [...batchIds]
    setExecuteStatus({
      kind: 'success',
      message: t('actions.executeQueued', {
        seconds: Math.round(BATCH_EXECUTION_UNDO_WINDOW_MS / 1000),
      }),
    })
    setPendingBatchExecution({
      assetIds: selection,
      expiresAt: Date.now() + BATCH_EXECUTION_UNDO_WINDOW_MS,
    })
    pendingBatchExecutionTimer.current = window.setTimeout(() => {
      pendingBatchExecutionTimer.current = null
      setPendingBatchExecution((current) => {
        if (!current) {
          return current
        }
        void runBatchExecution(current.assetIds)
        return null
      })
    }, BATCH_EXECUTION_UNDO_WINDOW_MS)
  }, [batchIds, executingBatch, pendingBatchExecution, runBatchExecution, t])

  const refreshBatchReport = useCallback(async () => {
    if (!reportBatchId || reportLoading) {
      return
    }

    setReportLoading(true)
    setReportStatus(null)
    setRetryStatus(null)

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
      setRetryStatus(null)
    }
  }, [apiClient, reportBatchId, reportLoading, t])

  const exportBatchReport = useCallback(
    (format: 'json' | 'csv') => {
      if (!reportData || !reportBatchId || typeof document === 'undefined') {
        return
      }

      const fallbackName = `batch-${reportBatchId}`
      let content = ''
      let mimeType = ''
      let extension = ''

      if (format === 'json') {
        content = `${JSON.stringify(reportData, null, 2)}\n`
        mimeType = 'application/json'
        extension = 'json'
      } else {
        const rows =
          typeof reportData === 'object' && reportData !== null
            ? Object.entries(reportData as Record<string, unknown>).map(
                ([key, value]) => `"${key.replaceAll('"', '""')}","${String(typeof value === 'object' ? JSON.stringify(value) : value).replaceAll('"', '""')}"`,
              )
            : [`"value","${String(reportData).replaceAll('"', '""')}"`]
        content = ['key,value', ...rows].join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${fallbackName}.${extension}`
      link.click()
      URL.revokeObjectURL(objectUrl)

      setReportExportStatus(
        t('actions.reportExportDone', {
          format: extension.toUpperCase(),
        }),
      )
    },
    [reportBatchId, reportData, t],
  )

  const previewSelectedAssetPurge = useCallback(async () => {
    if (!selectedAsset || selectedAsset.state !== 'DECIDED_REJECT' || previewingPurge) {
      return
    }

    setPreviewingPurge(true)
    setPurgeStatus(null)
    setRetryStatus(null)

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
      setRetryStatus(null)
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
    setRetryStatus(null)

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
      setRetryStatus(null)
    }
  }, [apiClient, executingPurge, purgePreviewAssetId, recordAction, selectedAsset, t])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingContext(event.target)) {
        const target = event.target
        if (
          event.key === 'Escape' &&
          target instanceof HTMLInputElement &&
          target.id === 'asset-search' &&
          target.value !== ''
        ) {
          event.preventDefault()
          setSearch('')
          return
        }
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

      if (event.shiftKey && event.key === 'Enter' && pendingBatchExecution) {
        event.preventDefault()
        void executeBatchMove()
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
        if (key === 'b') {
          event.preventDefault()
          toggleBatchOnly()
          return
        }
        if (key === 'n') {
          event.preventDefault()
          openNextPending()
          return
        }
        if (key === 'd') {
          event.preventDefault()
          toggleDensityMode()
          return
        }
        if (event.key === 'Home' && visibleAssets.length > 0) {
          event.preventDefault()
          setSelectedAssetId(visibleAssets[0].id)
          setSelectionAnchorId(visibleAssets[0].id)
          return
        }
        if (event.key === 'End' && visibleAssets.length > 0) {
          event.preventDefault()
          const last = visibleAssets[visibleAssets.length - 1]
          setSelectedAssetId(last.id)
          setSelectionAnchorId(last.id)
          return
        }
        if (key === 'r') {
          event.preventDefault()
          void refreshBatchReport()
          return
        }
        if (key === 'l') {
          event.preventDefault()
          clearActivityLog()
          return
        }
        if (key === '1') {
          event.preventDefault()
          saveQuickFilterPreset('PENDING_RECENT')
          applyQuickFilterPreset('PENDING_RECENT')
          return
        }
        if (key === '2') {
          event.preventDefault()
          saveQuickFilterPreset('IMAGES_REJECTED')
          applyQuickFilterPreset('IMAGES_REJECTED')
          return
        }
        if (key === '3') {
          event.preventDefault()
          saveQuickFilterPreset('MEDIA_REVIEW')
          applyQuickFilterPreset('MEDIA_REVIEW')
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
    toggleBatchOnly,
    openNextPending,
    toggleDensityMode,
    saveQuickFilterPreset,
    applyQuickFilterPreset,
    pendingBatchExecution,
    executeBatchMove,
    refreshBatchReport,
    clearActivityLog,
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
      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'nearest' })
      }
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

      <Card as="section" className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h2 className="h5 mb-3">{t('actions.title')}</h2>
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-2">
            <h3 className="h6 mb-2">{t('actions.quickPanel')}</h3>
            <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.savedViews')}>
              <Button type="button" size="sm" variant="outline-secondary" onClick={() => applySavedView('DEFAULT')}>
                {t('actions.viewDefault')}
              </Button>
              <Button type="button" size="sm" variant="outline-secondary" onClick={() => applySavedView('PENDING')}>
                {t('actions.viewPending')}
              </Button>
              <Button type="button" size="sm" variant="outline-secondary" onClick={() => applySavedView('BATCH')}>
                {t('actions.viewBatch')}
              </Button>
            </Stack>
            <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.filterPresets')}>
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  saveQuickFilterPreset('PENDING_RECENT')
                  applyQuickFilterPreset('PENDING_RECENT')
                }}
              >
                {t('actions.filterPresetPendingRecent')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  saveQuickFilterPreset('IMAGES_REJECTED')
                  applyQuickFilterPreset('IMAGES_REJECTED')
                }}
              >
                {t('actions.filterPresetRejectedImages')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  saveQuickFilterPreset('MEDIA_REVIEW')
                  applyQuickFilterPreset('MEDIA_REVIEW')
                }}
              >
                {t('actions.filterPresetMediaReview')}
              </Button>
            </Stack>
            <Stack direction="horizontal" className="flex-wrap gap-2">
              <Button type="button" variant="outline-primary" onClick={focusPending}>
                {t('actions.focusPending')}
              </Button>
              <Button type="button" variant={batchOnly ? 'primary' : 'outline-primary'} onClick={toggleBatchOnly}>
                {batchOnly ? t('actions.batchOnlyOn') : t('actions.batchOnlyOff')}
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
              <Button type="button" variant="outline-secondary" onClick={toggleDensityMode}>
                {densityMode === 'COMPACT'
                  ? t('actions.densityCompact')
                  : t('actions.densityComfortable')}
              </Button>
            </Stack>
          </section>
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-3">
            <h3 className="h6 mb-2">{t('actions.batchPanel')}</h3>
            <Stack direction="horizontal" className="flex-wrap align-items-center gap-2">
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
                {executingBatch
                  ? t('actions.executing')
                  : pendingBatchExecution
                    ? t('actions.executeConfirmNow')
                    : t('actions.executeBatch')}
              </Button>
            </Stack>
            <section className="mt-2" aria-label={t('actions.batchScope')}>
              <p className="mb-1 small text-secondary">
                {t('actions.batchScopeCount', { count: batchIds.length })}
              </p>
              <p className="mb-0 small text-secondary">
                {[
                  t('actions.batchScopePending', { count: batchScope.pending }),
                  t('actions.batchScopeKeep', { count: batchScope.keep }),
                  t('actions.batchScopeReject', { count: batchScope.reject }),
                ].join(' · ')}
              </p>
            </section>
            <section className="mt-2" aria-label={t('actions.timelineTitle')}>
              <p className="mb-1 small text-secondary">{t('actions.timelineTitle')}</p>
              <div data-testid="batch-timeline" className="d-flex flex-wrap gap-2">
                {batchTimeline.map((step) => (
                  <span
                    key={step.key}
                    className={[
                      'badge',
                      step.active ? 'text-bg-info' : step.done ? 'text-bg-success' : 'text-bg-secondary',
                      step.error ? 'text-bg-danger' : '',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </section>
            {previewingBatch || executingBatch ? (
              <p data-testid="batch-busy-status" className="small text-secondary mt-2 mb-0">
                {t('actions.batchBusy')}
              </p>
            ) : null}
            {pendingBatchExecution ? (
              <Stack direction="horizontal" className="flex-wrap gap-2 mt-2">
                <p data-testid="batch-execute-undo-status" className="small text-warning mb-0">
                  {t('actions.executeUndoWindow', {
                    seconds: Math.max(
                      0,
                      Math.ceil((pendingBatchExecution.expiresAt - Date.now()) / 1000),
                    ),
                  })}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline-warning"
                  onClick={cancelPendingBatchExecution}
                >
                  {t('actions.executeCancel')}
                </Button>
              </Stack>
            ) : null}
          </section>
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
          {retryStatus ? (
            <p data-testid="api-retry-status" role="status" aria-live="polite" className="small mt-2 mb-0 text-warning">
              {retryStatus}
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
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => exportBatchReport('json')}
                disabled={!reportData}
              >
                {t('actions.reportExportJson')}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => exportBatchReport('csv')}
                disabled={!reportData}
              >
                {t('actions.reportExportCsv')}
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
            {reportExportStatus ? (
              <p data-testid="batch-report-export-status" className="small mt-2 mb-0 text-secondary">
                {reportExportStatus}
              </p>
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
            <Stack direction="horizontal" className="justify-content-between align-items-center gap-2 mb-2">
              <h3 className="h6 mb-0">{t('actions.journal')}</h3>
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                onClick={clearActivityLog}
                disabled={activityLog.length === 0}
              >
                {t('actions.journalClear')}
              </Button>
            </Stack>
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
              <section data-testid="shortcuts-overlay" className="mt-3 border border-secondary rounded p-3">
                <p className="small text-secondary mb-2">{t('actions.shortcuts')}</p>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <h4 className="h6 mb-2">{t('actions.shortcutsNavTitle')}</h4>
                    <ul className="small mb-0">
                      <li>{t('actions.shortcutsNavList')}</li>
                    </ul>
                  </Col>
                  <Col xs={12} md={4}>
                    <h4 className="h6 mb-2">{t('actions.shortcutsBatchTitle')}</h4>
                    <ul className="small mb-0">
                      <li>{t('actions.shortcutsBatchList')}</li>
                    </ul>
                  </Col>
                  <Col xs={12} md={4}>
                    <h4 className="h6 mb-2">{t('actions.shortcutsFlowTitle')}</h4>
                    <ul className="small mb-0">
                      <li>{t('actions.shortcutsFlowList')}</li>
                    </ul>
                  </Col>
                </Row>
                <Stack direction="horizontal" className="flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline-primary" onClick={focusPending}>
                    {t('actions.shortcutsActionPending')}
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={toggleBatchOnly}>
                    {t('actions.shortcutsActionBatch')}
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={openNextPending}>
                    {t('actions.shortcutsActionNext')}
                  </Button>
                </Stack>
              </section>
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
                  variant="outline-primary"
                  onClick={openNextPending}
                >
                  {t('next.open')}
                </Button>
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
