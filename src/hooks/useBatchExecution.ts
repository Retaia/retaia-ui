import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Asset } from '../domain/assets'
import {
  buildBatchTimeline,
  getPendingBatchUndoSeconds,
  serializeBatchReportExport,
} from '../application/review/batchExecutionHelpers'
import {
  BATCH_EXECUTION_UNDO_WINDOW_MS,
  planBatchExecution,
} from '../application/review/batchExecutionPlanning'
import {
  buildExecuteCanceledStatus,
  buildExecuteErrorStatus,
  buildExecutePartialStatus,
  buildExecuteQueuedStatus,
  buildExecuteSuccessStatus,
  buildPreviewErrorStatus,
  buildPreviewSuccessStatus,
} from '../application/review/batchExecutionStatus'

type ApiClient = {
  submitAssetDecision: (
    assetId: string,
    payload: { state: 'ARCHIVED' | 'REJECTED' },
    idempotencyKey?: string,
    ifMatch?: string | null,
  ) => Promise<void>
}

type BatchApplyTarget = {
  assetId: string
  nextState: 'ARCHIVED' | 'REJECTED'
  revisionEtag?: string | null
}

type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Translate = (key: string, values?: Record<string, unknown>) => string

type Params = {
  apiClient: ApiClient
  assets: Asset[]
  batchIds: string[]
  isApiAssetSource: boolean
  t: Translate
  setRetryStatus: (value: string | null) => void
  mapErrorToMessage: (error: unknown) => string
  isRefreshRecommendedError: (error: unknown) => boolean
  onBatchExecutionApplied: (
    successIds: string[],
    nextStatesById: Record<string, 'ARCHIVED' | 'REJECTED'>,
  ) => void
}

function resolveBatchApplyTargets(assets: Asset[], batchIds: string[]): BatchApplyTarget[] {
  const selectedIds = new Set(batchIds)
  return assets.flatMap<BatchApplyTarget>((asset) => {
    if (!selectedIds.has(asset.id)) {
      return []
    }
    if (asset.state === 'DECIDED_KEEP') {
      return [{ assetId: asset.id, nextState: 'ARCHIVED' as const, revisionEtag: asset.revisionEtag }]
    }
    if (asset.state === 'DECIDED_REJECT') {
      return [{ assetId: asset.id, nextState: 'REJECTED' as const, revisionEtag: asset.revisionEtag }]
    }
    return []
  })
}

function buildLocalReportReference() {
  return `ui-${new Date().toISOString().replaceAll(/[-:.TZ]/g, '').slice(0, 14)}`
}

export function useBatchExecution({
  apiClient,
  assets,
  batchIds,
  isApiAssetSource,
  t,
  setRetryStatus,
  mapErrorToMessage,
  isRefreshRecommendedError,
  onBatchExecutionApplied,
}: Params) {
  const [previewingBatch, setPreviewingBatch] = useState(false)
  const [executingBatch, setExecutingBatch] = useState(false)
  const [pendingBatchExecution, setPendingBatchExecution] = useState<{
    assetIds: string[]
    expiresAt: number
  } | null>(null)
  const [previewStatus, setPreviewStatus] = useState<StatusMessage | null>(null)
  const [executeStatus, setExecuteStatus] = useState<StatusMessage | null>(null)
  const [shouldRefreshAssetsAfterConflict, setShouldRefreshAssetsAfterConflict] = useState(false)
  const [reportBatchId, setReportBatchId] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportStatus, setReportStatus] = useState<string | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)
  const [lastSuccessfulReport, setLastSuccessfulReport] = useState<{ batchId: string; report: unknown } | null>(null)
  const [reportExportStatus, setReportExportStatus] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const pendingBatchExecutionTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (pendingBatchExecutionTimer.current !== null) {
        window.clearTimeout(pendingBatchExecutionTimer.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (!pendingBatchExecution) {
      return
    }
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      window.clearInterval(intervalId)
    }
  }, [pendingBatchExecution])

  const batchTimeline = useMemo(() => {
    return buildBatchTimeline({
      pendingBatchExecution,
      executingBatch,
      executeStatusKind: executeStatus?.kind ?? null,
      t,
    })
  }, [executeStatus?.kind, executingBatch, pendingBatchExecution, t])

  const pendingBatchUndoSeconds = useMemo(
    () => getPendingBatchUndoSeconds(pendingBatchExecution, now),
    [now, pendingBatchExecution],
  )

  const previewBatchMove = useCallback(async () => {
    if (batchIds.length === 0 || previewingBatch) {
      return
    }

    setPreviewingBatch(true)
    setPreviewStatus(null)
    setShouldRefreshAssetsAfterConflict(false)
    setRetryStatus(null)

    try {
      const targets = resolveBatchApplyTargets(assets, batchIds)
      if (targets.length === 0) {
        setPreviewStatus(
          buildPreviewErrorStatus(
            t,
            () => t('actions.previewNoEligible'),
            new Error('preview-no-eligible'),
          ),
        )
        return
      }
      setPreviewStatus(buildPreviewSuccessStatus(t, targets.length))
    } finally {
      setPreviewingBatch(false)
      setRetryStatus(null)
    }
  }, [assets, batchIds, previewingBatch, setRetryStatus, t])

  const runBatchExecution = useCallback(
    async (assetIds: string[]) => {
      if (assetIds.length === 0 || executingBatch) {
        return
      }

      const targets = resolveBatchApplyTargets(assets, assetIds)
      if (targets.length === 0) {
        setExecuteStatus(
          buildExecuteErrorStatus(
            t,
            () => t('actions.executeNoEligible'),
            new Error('execute-no-eligible'),
          ),
        )
        return
      }

      setExecutingBatch(true)
      setExecuteStatus(null)
      setShouldRefreshAssetsAfterConflict(false)
      setReportStatus(null)
      setReportExportStatus(null)
      setRetryStatus(null)

      const successIds: string[] = []
      const nextStatesById: Record<string, 'ARCHIVED' | 'REJECTED'> = {}
      const errors: Array<{ asset_id: string; reason: string }> = []
      let refreshRecommended = false

      try {
        for (const target of targets) {
          try {
            if (isApiAssetSource) {
              await apiClient.submitAssetDecision(
                target.assetId,
                { state: target.nextState },
                undefined,
                target.revisionEtag,
              )
            }
            successIds.push(target.assetId)
            nextStatesById[target.assetId] = target.nextState
          } catch (error) {
            if (isRefreshRecommendedError(error)) {
              refreshRecommended = true
            }
            errors.push({
              asset_id: target.assetId,
              reason: mapErrorToMessage(error),
            })
          }
        }
        setShouldRefreshAssetsAfterConflict(refreshRecommended)

        const reportReference = buildLocalReportReference()
        const report = {
          status:
            errors.length === 0 ? 'DONE' : successIds.length === 0 ? 'FAILED' : 'PARTIAL',
          moved: successIds.length,
          failed: errors.length,
          errors,
        }

        setReportBatchId(reportReference)
        setReportData(report)
        setLastSuccessfulReport({ batchId: reportReference, report })

        if (successIds.length > 0) {
          onBatchExecutionApplied(successIds, nextStatesById)
          if (errors.length > 0) {
            setExecuteStatus(
              buildExecutePartialStatus(
                t,
                successIds.length,
                errors.length,
                errors[0]?.reason ?? t('actions.executeNoEligible'),
              ),
            )
            return
          }
          setExecuteStatus(buildExecuteSuccessStatus(t))
          return
        }

        setExecuteStatus(
          buildExecuteErrorStatus(
            t,
            () => errors[0]?.reason ?? t('actions.executeNoEligible'),
            new Error('execute-failed'),
          ),
        )
      } finally {
        setExecutingBatch(false)
        setRetryStatus(null)
      }
    },
    [apiClient, assets, executingBatch, isApiAssetSource, isRefreshRecommendedError, mapErrorToMessage, onBatchExecutionApplied, setRetryStatus, t],
  )

  const cancelPendingBatchExecution = useCallback(() => {
    if (!pendingBatchExecution) {
      return
    }
    if (pendingBatchExecutionTimer.current !== null) {
      window.clearTimeout(pendingBatchExecutionTimer.current)
      pendingBatchExecutionTimer.current = null
    }
    setNow(Date.now())
    setPendingBatchExecution(null)
    setExecuteStatus(buildExecuteCanceledStatus(t))
  }, [pendingBatchExecution, t])

  const executeBatchMove = useCallback(async () => {
    const targetIds = resolveBatchApplyTargets(assets, batchIds).map((target) => target.assetId)
    if (targetIds.length === 0) {
      setExecuteStatus(
        buildExecuteErrorStatus(
          t,
          () => t('actions.executeNoEligible'),
          new Error('execute-no-eligible'),
        ),
      )
      return
    }

    setShouldRefreshAssetsAfterConflict(false)
    const plan = planBatchExecution({
      executingBatch,
      pendingBatchExecution,
      batchIds: targetIds,
      now: Date.now(),
      undoWindowMs: BATCH_EXECUTION_UNDO_WINDOW_MS,
    })

    if (plan.kind === 'ignore') {
      return
    }

    if (plan.kind === 'run-now') {
      if (pendingBatchExecutionTimer.current !== null) {
        window.clearTimeout(pendingBatchExecutionTimer.current)
        pendingBatchExecutionTimer.current = null
      }
      setPendingBatchExecution(null)
      await runBatchExecution(plan.selection)
      return
    }

    setExecuteStatus(buildExecuteQueuedStatus(t, plan.undoSeconds))
    setNow(Date.now())
    setPendingBatchExecution({
      assetIds: plan.selection,
      expiresAt: plan.expiresAt,
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
  }, [assets, batchIds, executingBatch, pendingBatchExecution, runBatchExecution, t])

  const refreshBatchReport = useCallback(async () => {
    if (!reportData || reportLoading) {
      return
    }

    setReportLoading(true)
    setReportStatus(t('actions.reportLocalCurrent'))
    setRetryStatus(null)
    setReportLoading(false)
  }, [reportData, reportLoading, setRetryStatus, t])

  const exportBatchReport = useCallback(
    (format: 'json' | 'csv') => {
      if (!reportData || typeof document === 'undefined') {
        return
      }

      const fallbackName = `batch-${reportBatchId ?? 'local'}`
      const { content, mimeType, extension } = serializeBatchReportExport(format, reportData)

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

  return {
    previewingBatch,
    executingBatch,
    pendingBatchExecution,
    previewStatus,
    executeStatus,
    shouldRefreshAssetsAfterConflict,
    reportBatchId,
    reportLoading,
    reportStatus,
    reportData,
    lastSuccessfulReport,
    reportExportStatus,
    batchTimeline,
    pendingBatchUndoSeconds,
    previewBatchMove,
    executeBatchMove,
    cancelPendingBatchExecution,
    acknowledgeBatchRefreshRecommendation: () => setShouldRefreshAssetsAfterConflict(false),
    refreshBatchReport,
    exportBatchReport,
  } as const
}
