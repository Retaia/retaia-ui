import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const BATCH_EXECUTION_UNDO_WINDOW_MS = 6000

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

  const pendingBatchUndoSeconds = pendingBatchExecution
    ? Math.max(
      0,
      Math.ceil((pendingBatchExecution.expiresAt - Date.now()) / 1000),
    )
    : 0

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
          message: mapErrorToMessage(error),
        }),
      })
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
              message: mapErrorToMessage(error),
            }),
          )
        } finally {
          setReportLoading(false)
        }
      } catch (error) {
        setExecuteStatus({
          kind: 'error',
          message: t('actions.executeError', {
            message: mapErrorToMessage(error),
          }),
        })
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
          message: mapErrorToMessage(error),
        }),
      )
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
                ([key, value]) =>
                  `"${key.replaceAll('"', '""')}","${String(typeof value === 'object' ? JSON.stringify(value) : value).replaceAll('"', '""')}"`,
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
