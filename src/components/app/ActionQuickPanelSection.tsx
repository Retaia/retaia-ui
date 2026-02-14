import { Button, Stack } from 'react-bootstrap'
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
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-2">
      <h3 className="h6 mb-2">
        <BsLightningCharge className="me-1" aria-hidden="true" />
        {t('actions.quickPanel')}
      </h3>
      <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.savedViews')}>
        <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('DEFAULT')}>
          <BsColumnsGap className="me-1" aria-hidden="true" />
          {t('actions.viewDefault')}
        </Button>
        <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('PENDING')}>
          <BsClockHistory className="me-1" aria-hidden="true" />
          {t('actions.viewPending')}
        </Button>
        <Button type="button" size="sm" variant="outline-secondary" onClick={() => onApplySavedView('BATCH')}>
          <BsFolderCheck className="me-1" aria-hidden="true" />
          {t('actions.viewBatch')}
        </Button>
      </Stack>
      <Stack direction="horizontal" className="flex-wrap gap-2 mb-2" aria-label={t('actions.filterPresets')}>
        <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetPendingRecent}>
          <BsFilter className="me-1" aria-hidden="true" />
          {t('actions.filterPresetPendingRecent')}
        </Button>
        <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetImagesRejected}>
          <BsImages className="me-1" aria-hidden="true" />
          {t('actions.filterPresetRejectedImages')}
        </Button>
        <Button type="button" size="sm" variant="outline-secondary" onClick={onApplyPresetMediaReview}>
          <BsCameraVideo className="me-1" aria-hidden="true" />
          {t('actions.filterPresetMediaReview')}
        </Button>
      </Stack>
      <Stack direction="horizontal" className="flex-wrap gap-2">
        <Button type="button" variant="outline-primary" onClick={onFocusPending}>
          <BsClockHistory className="me-1" aria-hidden="true" />
          {t('actions.focusPending')}
        </Button>
        <Button type="button" variant={batchOnly ? 'primary' : 'outline-primary'} onClick={onToggleBatchOnly}>
          <BsPinAngle className="me-1" aria-hidden="true" />
          {batchOnly ? t('actions.batchOnlyOn') : t('actions.batchOnlyOff')}
        </Button>
        <Button
          type="button"
          variant="outline-success"
          onClick={() => onApplyDecisionToVisible('KEEP')}
          disabled={availability.keepVisibleDisabled}
        >
          <BsCheck2Circle className="me-1" aria-hidden="true" />
          {t('actions.keepVisible')}
        </Button>
        <Button
          type="button"
          variant="outline-danger"
          onClick={() => onApplyDecisionToVisible('REJECT')}
          disabled={availability.rejectVisibleDisabled}
        >
          <BsXCircle className="me-1" aria-hidden="true" />
          {t('actions.rejectVisible')}
        </Button>
        <Button type="button" variant="outline-secondary" onClick={onClearFilters}>
          <BsEraser className="me-1" aria-hidden="true" />
          {t('actions.clearFilters')}
        </Button>
        <Button type="button" variant="outline-secondary" onClick={onToggleDensityMode}>
          <BsArrowsCollapse className="me-1" aria-hidden="true" />
          {densityMode === 'COMPACT'
            ? t('actions.densityCompact')
            : t('actions.densityComfortable')}
        </Button>
      </Stack>
    </section>
  )
}
