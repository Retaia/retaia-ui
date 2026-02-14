import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildBatchTimeline,
  getPendingBatchUndoSeconds,
  resolveBatchId,
  serializeBatchReportExport,
} from '../application/review/batchExecutionHelpers'
import {
  BATCH_EXECUTION_UNDO_WINDOW_MS,
  planBatchExecution,
} from '../application/review/batchExecutionPlanning'
import { loadBatchReport } from '../application/review/batchReportLoading'
import {
  buildExecuteCanceledStatus,
  buildExecuteErrorStatus,
  buildExecuteQueuedStatus,
  buildExecuteSuccessStatus,
  buildPreviewErrorStatus,
  buildPreviewSuccessStatus,
} from '../application/review/batchExecutionStatus'

type ApiClient = {
  previewMoveBatch: (payload: { include: 'BOTH'; limit: number }) => Promise<unknown>
  executeMoveBatch: (
    payload: { mode: 'EXECUTE'; selection: { asset_ids: string[] } },
    idempotencyKey: string,
  ) => Promise<unknown>
  getMoveBatchReport: (batchId: string) => Promise<unknown>
}

type StatusMessage = {
  kind: 'success' | 'error'
  message: string
}

type Translate = (key: string, values?: Record<string, unknown>) => string

type Params = {
  apiClient: ApiClient
  batchIds: string[]
  t: Translate
  setRetryStatus: (value: string | null) => void
  mapErrorToMessage: (error: unknown) => string
}

export function useBatchExecution({
  apiClient,
  batchIds,
  t,
  setRetryStatus,
  mapErrorToMessage,
}: Params) {
  const [previewingBatch, setPreviewingBatch] = useState(false)
  const [executingBatch, setExecutingBatch] = useState(false)
  const [pendingBatchExecution, setPendingBatchExecution] = useState<{
    assetIds: string[]
    expiresAt: number
  } | null>(null)
  const [previewStatus, setPreviewStatus] = useState<StatusMessage | null>(null)
  const [executeStatus, setExecuteStatus] = useState<StatusMessage | null>(null)
  const [reportBatchId, setReportBatchId] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportStatus, setReportStatus] = useState<string | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)
  const [reportExportStatus, setReportExportStatus] = useState<string | null>(null)

  const pendingBatchExecutionTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (pendingBatchExecutionTimer.current !== null) {
        window.clearTimeout(pendingBatchExecutionTimer.current)
      }
    },
    [],
  )

  const batchTimeline = useMemo(() => {
    return buildBatchTimeline({
      pendingBatchExecution,
      executingBatch,
      executeStatusKind: executeStatus?.kind ?? null,
      t,
    })
  }, [executeStatus?.kind, executingBatch, pendingBatchExecution, t])

  const pendingBatchUndoSeconds = getPendingBatchUndoSeconds(pendingBatchExecution, Date.now())

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
      setPreviewStatus(buildPreviewSuccessStatus(t, batchIds.length))
    } catch (error) {
      setPreviewStatus(buildPreviewErrorStatus(t, mapErrorToMessage, error))
    } finally {
      setPreviewingBatch(false)
      setRetryStatus(null)
    }
  }, [apiClient, batchIds.length, mapErrorToMessage, previewingBatch, setRetryStatus, t])

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
        const batchId = resolveBatchId(response)
        setReportBatchId(batchId)
        setExecuteStatus(buildExecuteSuccessStatus(t))
        if (!batchId) {
          return
        }
        setReportLoading(true)
        setReportStatus(null)
        try {
          const reportResult = await loadBatchReport({
            getMoveBatchReport: apiClient.getMoveBatchReport,
            batchId,
            t,
            mapErrorToMessage,
          })
          if (reportResult.kind === 'success') {
            setReportData(reportResult.report)
          }
          setReportStatus(reportResult.statusMessage)
        } finally {
          setReportLoading(false)
        }
      } catch (error) {
        setExecuteStatus(buildExecuteErrorStatus(t, mapErrorToMessage, error))
      } finally {
        setExecutingBatch(false)
        setRetryStatus(null)
      }
    },
    [apiClient, executingBatch, mapErrorToMessage, setRetryStatus, t],
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
    setExecuteStatus(buildExecuteCanceledStatus(t))
  }, [pendingBatchExecution, t])

  const executeBatchMove = useCallback(async () => {
    const plan = planBatchExecution({
      executingBatch,
      pendingBatchExecution,
      batchIds,
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
  }, [batchIds, executingBatch, pendingBatchExecution, runBatchExecution, t])

  const refreshBatchReport = useCallback(async () => {
    if (!reportBatchId || reportLoading) {
      return
    }

    setReportLoading(true)
    setReportStatus(null)
    setRetryStatus(null)

    try {
      const reportResult = await loadBatchReport({
        getMoveBatchReport: apiClient.getMoveBatchReport,
        batchId: reportBatchId,
        t,
        mapErrorToMessage,
      })
      if (reportResult.kind === 'success') {
        setReportData(reportResult.report)
      }
      setReportStatus(reportResult.statusMessage)
    } finally {
      setReportLoading(false)
      setRetryStatus(null)
    }
  }, [apiClient, mapErrorToMessage, reportBatchId, reportLoading, setRetryStatus, t])

  const exportBatchReport = useCallback(
    (format: 'json' | 'csv') => {
      if (!reportData || !reportBatchId || typeof document === 'undefined') {
        return
      }

      const fallbackName = `batch-${reportBatchId}`
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
  } as const
}
