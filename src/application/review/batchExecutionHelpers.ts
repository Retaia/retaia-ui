type Translate = (key: string, values?: Record<string, unknown>) => string

export function buildBatchTimeline(args: {
  pendingBatchExecution: { assetIds: string[]; expiresAt: number } | null
  executingBatch: boolean
  executeStatusKind: 'success' | 'error' | null
  t: Translate
}) {
  const queued = !!args.pendingBatchExecution
  const running = args.executingBatch
  const failed = args.executeStatusKind === 'error'
  const done = args.executeStatusKind === 'success' && !queued && !running

  return [
    {
      key: 'queued',
      active: queued,
      done: !queued && (running || done || failed),
      label: args.t('actions.timelineQueued'),
    },
    {
      key: 'running',
      active: running,
      done: !running && (done || failed),
      label: args.t('actions.timelineRunning'),
    },
    {
      key: 'done',
      active: done,
      done,
      error: failed,
      label: failed ? args.t('actions.timelineError') : args.t('actions.timelineDone'),
    },
  ]
}

export function getPendingBatchUndoSeconds(
  pendingBatchExecution: { assetIds: string[]; expiresAt: number } | null,
  now: number,
) {
  if (!pendingBatchExecution) {
    return 0
  }
  return Math.max(0, Math.ceil((pendingBatchExecution.expiresAt - now) / 1000))
}

export function resolveBatchId(response: unknown) {
  if (!response || typeof response !== 'object' || !('batch_id' in response)) {
    return null
  }
  return String(response.batch_id)
}

export function serializeBatchReportExport(format: 'json' | 'csv', reportData: unknown) {
  if (format === 'json') {
    return {
      content: `${JSON.stringify(reportData, null, 2)}\n`,
      mimeType: 'application/json',
      extension: 'json',
    }
  }

  const rows =
    typeof reportData === 'object' && reportData !== null
      ? Object.entries(reportData as Record<string, unknown>).map(
          ([key, value]) =>
            `"${key.replaceAll('"', '""')}","${String(typeof value === 'object' ? JSON.stringify(value) : value).replaceAll('"', '""')}"`,
        )
      : [`"value","${String(reportData).replaceAll('"', '""')}"`]
  return {
    content: ['key,value', ...rows].join('\n'),
    mimeType: 'text/csv',
    extension: 'csv',
  }
}
