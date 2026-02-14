type Translate = (key: string, values?: Record<string, unknown>) => string

export type BatchExecutionStatus = {
  kind: 'success' | 'error'
  message: string
}

export function buildPreviewSuccessStatus(t: Translate, count: number): BatchExecutionStatus {
  return {
    kind: 'success',
    message: t('actions.previewResult', {
      include: 'BOTH',
      count,
    }),
  }
}

export function buildPreviewErrorStatus(
  t: Translate,
  mapErrorToMessage: (error: unknown) => string,
  error: unknown,
): BatchExecutionStatus {
  return {
    kind: 'error',
    message: t('actions.previewError', {
      message: mapErrorToMessage(error),
    }),
  }
}

export function buildExecuteSuccessStatus(t: Translate): BatchExecutionStatus {
  return {
    kind: 'success',
    message: t('actions.executeResult'),
  }
}

export function buildExecuteErrorStatus(
  t: Translate,
  mapErrorToMessage: (error: unknown) => string,
  error: unknown,
): BatchExecutionStatus {
  return {
    kind: 'error',
    message: t('actions.executeError', {
      message: mapErrorToMessage(error),
    }),
  }
}

export function buildExecuteQueuedStatus(t: Translate, seconds: number): BatchExecutionStatus {
  return {
    kind: 'success',
    message: t('actions.executeQueued', {
      seconds,
    }),
  }
}

export function buildExecuteCanceledStatus(t: Translate): BatchExecutionStatus {
  return {
    kind: 'success',
    message: t('actions.executeCanceled'),
  }
}
