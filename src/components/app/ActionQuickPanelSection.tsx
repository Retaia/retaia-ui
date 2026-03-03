import {
  BsArrowsCollapse,
  BsCameraVideo,
  BsCheck2Circle,
  BsClockHistory,
  BsColumnsGap,
  BsEraser,
  BsFilter,
  BsFolderCheck,
  BsImages,
  BsLightningCharge,
  BsPinAngle,
  BsXCircle,
} from 'react-icons/bs'
import { AppButton } from '../ui/AppButton'
import { useQuickFilters } from '../../hooks/useQuickFilters'
import { useDensityMode } from '../../hooks/useDensityMode'
import { getActionAvailability } from '../../domain/actionAvailability'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  batchIdsLength: number
  batchOnly: boolean
  densityMode: ReturnType<typeof useDensityMode>['densityMode']
  availability: ReturnType<typeof getActionAvailability>
  onApplySavedView: ReturnType<typeof useQuickFilters>['applySavedView']
  onApplyPresetPendingRecent: ReturnType<typeof useQuickFilters>['applyPresetPendingRecent']
  onApplyPresetImagesRejected: ReturnType<typeof useQuickFilters>['applyPresetImagesRejected']
  onApplyPresetMediaReview: ReturnType<typeof useQuickFilters>['applyPresetMediaReview']
  onFocusPending: () => void
  onToggleBatchOnly: () => void
  onApplyDecisionToVisible: (action: 'KEEP' | 'REJECT') => void
  onClearFilters: () => void
  onToggleDensityMode: () => void
}

export function ActionQuickPanelSection({
  t,
  batchIdsLength,
  batchOnly,
  densityMode,
  availability,
  onApplySavedView,
  onApplyPresetPendingRecent,
  onApplyPresetImagesRejected,
  onApplyPresetMediaReview,
  onFocusPending,
  onToggleBatchOnly,
  onApplyDecisionToVisible,
  onClearFilters,
  onToggleDensityMode,
}: Props) {
  const hasBatchSelection = batchIdsLength > 0

  return (
    <section className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
      <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <BsLightningCharge className="mr-1 inline-block" aria-hidden="true" />
        {t('actions.quickPanel')}
      </h3>
      <div className="mb-2 flex flex-wrap gap-1.5" aria-label={t('actions.savedViews')}>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => onApplySavedView('DEFAULT')}
          data-testid="quick-view-default"
        >
          <BsColumnsGap className="mr-1" aria-hidden="true" />
          {t('actions.viewDefault')}
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => onApplySavedView('PENDING')}
          data-testid="quick-view-pending"
        >
          <BsClockHistory className="mr-1" aria-hidden="true" />
          {t('actions.viewPending')}
        </AppButton>
        {hasBatchSelection ? (
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => onApplySavedView('BATCH')}
            data-testid="quick-view-batch"
          >
            <BsFolderCheck className="mr-1" aria-hidden="true" />
            {t('actions.viewBatch')}
          </AppButton>
        ) : null}
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5" aria-label={t('actions.filterPresets')}>
        <AppButton variant="secondary" size="sm" onClick={onApplyPresetPendingRecent}>
          <BsFilter className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetPendingRecent')}
        </AppButton>
        <AppButton variant="secondary" size="sm" onClick={onApplyPresetImagesRejected}>
          <BsImages className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetRejectedImages')}
        </AppButton>
        <AppButton variant="secondary" size="sm" onClick={onApplyPresetMediaReview}>
          <BsCameraVideo className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetMediaReview')}
        </AppButton>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <AppButton type="button" variant="outline-primary" size="sm" onClick={onFocusPending}>
          <BsClockHistory className="mr-1" aria-hidden="true" />
          {t('actions.focusPending')}
        </AppButton>
        {hasBatchSelection ? (
          <AppButton
            type="button"
            variant={batchOnly ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={onToggleBatchOnly}
          >
            <BsPinAngle className="mr-1" aria-hidden="true" />
            {batchOnly ? t('actions.batchOnlyOn') : t('actions.batchOnlyOff')}
          </AppButton>
        ) : null}
        <AppButton
          type="button"
          variant="outline-success"
          size="sm"
          onClick={() => onApplyDecisionToVisible('KEEP')}
          disabled={availability.keepVisibleDisabled}
        >
          <BsCheck2Circle className="mr-1" aria-hidden="true" />
          {t('actions.keepVisible')}
        </AppButton>
        <AppButton
          type="button"
          variant="outline-danger"
          size="sm"
          onClick={() => onApplyDecisionToVisible('REJECT')}
          disabled={availability.rejectVisibleDisabled}
        >
          <BsXCircle className="mr-1" aria-hidden="true" />
          {t('actions.rejectVisible')}
        </AppButton>
        <AppButton type="button" variant="secondary" size="sm" onClick={onClearFilters}>
          <BsEraser className="mr-1" aria-hidden="true" />
          {t('actions.clearFilters')}
        </AppButton>
        <AppButton type="button" variant="secondary" size="sm" onClick={onToggleDensityMode}>
          <BsArrowsCollapse className="mr-1" aria-hidden="true" />
          {densityMode === 'COMPACT'
            ? t('actions.densityCompact')
            : t('actions.densityComfortable')}
        </AppButton>
      </div>
    </section>
  )
}
