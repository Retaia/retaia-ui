type Translate = (key: string, values?: Record<string, unknown>) => string

type LoadBatchReportParams = {
  getMoveBatchReport: (batchId: string) => Promise<unknown>
  batchId: string
  t: Translate
  mapErrorToMessage: (error: unknown) => string
}

type LoadBatchReportResult =
  | {
      kind: 'success'
      report: unknown
      statusMessage: string
    }
  | {
      kind: 'error'
      statusMessage: string
    }

export async function loadBatchReport({
  getMoveBatchReport,
  batchId,
  t,
  mapErrorToMessage,
}: LoadBatchReportParams): Promise<LoadBatchReportResult> {
  try {
    const report = await getMoveBatchReport(batchId)
    return {
      kind: 'success',
      report,
      statusMessage: t('actions.reportReady', { batchId }),
    }
  } catch (error) {
    return {
      kind: 'error',
      statusMessage: t('actions.reportError', {
        message: mapErrorToMessage(error),
      }),
    }
  }
}
