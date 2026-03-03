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
import { useQuickFilters } from '../../hooks/useQuickFilters'
import { useDensityMode } from '../../hooks/useDensityMode'
import { getActionAvailability } from '../../domain/actionAvailability'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
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
  const secondaryButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
  const outlinePrimaryButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50'
  const primaryButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50'
  const outlineSuccessButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-success-300 bg-white px-3 py-2 text-sm font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:cursor-not-allowed disabled:opacity-50'
  const outlineDangerButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-2">
      <h3 className="mb-2 text-base font-semibold text-gray-900">
        <BsLightningCharge className="mr-1 inline-block" aria-hidden="true" />
        {t('actions.quickPanel')}
      </h3>
      <div className="mb-2 flex flex-wrap gap-2" aria-label={t('actions.savedViews')}>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onApplySavedView('DEFAULT')}
          data-testid="quick-view-default"
        >
          <BsColumnsGap className="mr-1" aria-hidden="true" />
          {t('actions.viewDefault')}
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onApplySavedView('PENDING')}
          data-testid="quick-view-pending"
        >
          <BsClockHistory className="mr-1" aria-hidden="true" />
          {t('actions.viewPending')}
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onApplySavedView('BATCH')}
          data-testid="quick-view-batch"
        >
          <BsFolderCheck className="mr-1" aria-hidden="true" />
          {t('actions.viewBatch')}
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-2" aria-label={t('actions.filterPresets')}>
        <button type="button" className={secondaryButtonClass} onClick={onApplyPresetPendingRecent}>
          <BsFilter className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetPendingRecent')}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onApplyPresetImagesRejected}>
          <BsImages className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetRejectedImages')}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onApplyPresetMediaReview}>
          <BsCameraVideo className="mr-1" aria-hidden="true" />
          {t('actions.filterPresetMediaReview')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={outlinePrimaryButtonClass} onClick={onFocusPending}>
          <BsClockHistory className="mr-1" aria-hidden="true" />
          {t('actions.focusPending')}
        </button>
        <button type="button" className={batchOnly ? primaryButtonClass : outlinePrimaryButtonClass} onClick={onToggleBatchOnly}>
          <BsPinAngle className="mr-1" aria-hidden="true" />
          {batchOnly ? t('actions.batchOnlyOn') : t('actions.batchOnlyOff')}
        </button>
        <button
          type="button"
          className={outlineSuccessButtonClass}
          onClick={() => onApplyDecisionToVisible('KEEP')}
          disabled={availability.keepVisibleDisabled}
        >
          <BsCheck2Circle className="mr-1" aria-hidden="true" />
          {t('actions.keepVisible')}
        </button>
        <button
          type="button"
          className={outlineDangerButtonClass}
          onClick={() => onApplyDecisionToVisible('REJECT')}
          disabled={availability.rejectVisibleDisabled}
        >
          <BsXCircle className="mr-1" aria-hidden="true" />
          {t('actions.rejectVisible')}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onClearFilters}>
          <BsEraser className="mr-1" aria-hidden="true" />
          {t('actions.clearFilters')}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onToggleDensityMode}>
          <BsArrowsCollapse className="mr-1" aria-hidden="true" />
          {densityMode === 'COMPACT'
            ? t('actions.densityCompact')
            : t('actions.densityComfortable')}
        </button>
      </div>
    </section>
  )
}
