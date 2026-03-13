type Translate = (key: string, values?: Record<string, unknown>) => string

export type PurgeStatusMessage = {
  kind: 'success' | 'error'
  message: string
}

export function buildPurgePreviewReadyStatus(t: Translate, assetId: string): PurgeStatusMessage {
  return {
    kind: 'success',
    message: t('actions.purgePreviewReady', { id: assetId }),
  }
}

export function buildPurgePreviewErrorStatus(
  t: Translate,
  mapErrorToMessage: (error: unknown) => string,
  error: unknown,
): PurgeStatusMessage {
  return {
    kind: 'error',
    message: t('actions.purgePreviewError', {
      message: mapErrorToMessage(error),
    }),
  }
}

export function buildPurgeSuccessStatus(t: Translate, assetId: string): PurgeStatusMessage {
  return {
    kind: 'success',
    message: t('actions.purgeResult', { id: assetId }),
  }
}

export function buildPurgeErrorStatus(
  t: Translate,
  mapErrorToMessage: (error: unknown) => string,
  error: unknown,
): PurgeStatusMessage {
  return {
    kind: 'error',
    message: t('actions.purgeError', {
      message: mapErrorToMessage(error),
    }),
  }
}
