type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export function resolveEmptyAssetsMessage({
  batchOnly,
  filter,
  search,
  batchIdsLength,
  t,
}: {
  batchOnly: boolean
  filter: string
  search: string
  batchIdsLength: number
  t: TranslateFn
}) {
  if (!batchOnly) {
    if (filter !== 'ALL' || search.trim() !== '') {
      return t('assets.emptyFiltered')
    }
    return t('assets.empty')
  }
  if (batchIdsLength === 0) {
    return t('assets.emptyBatchNone')
  }
  return t('assets.emptyBatch')
}

export function resolveSelectionStatusLabel({
  selectedAssetId,
  t,
}: {
  selectedAssetId: string | null
  t: TranslateFn
}) {
  return selectedAssetId
    ? t('assets.selectionStatusOne', { id: selectedAssetId })
    : t('assets.selectionStatusNone')
}

type Availability = {
  keepVisibleDisabled: boolean
  rejectVisibleDisabled: boolean
  keepBatchDisabled: boolean
  rejectBatchDisabled: boolean
}

export function resolveEffectiveAvailability<T extends Availability>({
  availability,
  isApiAssetSource,
  bulkDecisionsEnabled,
}: {
  availability: T
  isApiAssetSource: boolean
  bulkDecisionsEnabled: boolean
}) {
  if (!isApiAssetSource || bulkDecisionsEnabled) {
    return availability
  }
  return {
    ...availability,
    keepVisibleDisabled: true,
    rejectVisibleDisabled: true,
    keepBatchDisabled: true,
    rejectBatchDisabled: true,
  }
}
