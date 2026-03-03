import { useEffect, useRef, useState } from 'react'
import {
  BsArrowsCollapse,
  BsCameraVideo,
  BsCheck2Circle,
  BsChevronDown,
  BsChevronUp,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuContainerRef.current) {
        return
      }
      if (menuContainerRef.current.contains(event.target as Node)) {
        return
      }
      setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  return (
    <section className="mt-2">
      <div className="relative inline-block" ref={menuContainerRef}>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          data-testid="quick-actions-toggle"
        >
          <BsLightningCharge className="mr-1" aria-hidden="true" />
          {t('actions.quickPanel')}
          {isMenuOpen ? (
            <BsChevronUp className="ml-2" aria-hidden="true" />
          ) : (
            <BsChevronDown className="ml-2" aria-hidden="true" />
          )}
        </AppButton>
        {isMenuOpen ? (
          <div
            className="absolute left-0 z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
            role="menu"
            data-testid="quick-actions-menu"
          >
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('actions.savedViews')}</p>
            <div className="mb-2 flex flex-col gap-1">
              <AppButton
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => onApplySavedView('DEFAULT')}
                data-testid="quick-view-default"
              >
                <BsColumnsGap className="mr-1" aria-hidden="true" />
                {t('actions.viewDefault')}
              </AppButton>
              <AppButton
                variant="secondary"
                size="sm"
                className="w-full justify-start"
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
                  className="w-full justify-start"
                  onClick={() => onApplySavedView('BATCH')}
                  data-testid="quick-view-batch"
                >
                  <BsFolderCheck className="mr-1" aria-hidden="true" />
                  {t('actions.viewBatch')}
                </AppButton>
              ) : null}
            </div>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('actions.filterPresets')}</p>
            <div className="mb-2 flex flex-col gap-1">
              <AppButton variant="secondary" size="sm" className="w-full justify-start" onClick={onApplyPresetPendingRecent}>
                <BsFilter className="mr-1" aria-hidden="true" />
                {t('actions.filterPresetPendingRecent')}
              </AppButton>
              <AppButton variant="secondary" size="sm" className="w-full justify-start" onClick={onApplyPresetImagesRejected}>
                <BsImages className="mr-1" aria-hidden="true" />
                {t('actions.filterPresetRejectedImages')}
              </AppButton>
              <AppButton variant="secondary" size="sm" className="w-full justify-start" onClick={onApplyPresetMediaReview}>
                <BsCameraVideo className="mr-1" aria-hidden="true" />
                {t('actions.filterPresetMediaReview')}
              </AppButton>
            </div>
            <div className="flex flex-col gap-1">
              <AppButton type="button" variant="outline-primary" size="sm" className="w-full justify-start" onClick={onFocusPending}>
                <BsClockHistory className="mr-1" aria-hidden="true" />
                {t('actions.focusPending')}
              </AppButton>
              {hasBatchSelection ? (
                <AppButton
                  type="button"
                  variant={batchOnly ? 'primary' : 'outline-primary'}
                  size="sm"
                  className="w-full justify-start"
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
                className="w-full justify-start"
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
                className="w-full justify-start"
                onClick={() => onApplyDecisionToVisible('REJECT')}
                disabled={availability.rejectVisibleDisabled}
              >
                <BsXCircle className="mr-1" aria-hidden="true" />
                {t('actions.rejectVisible')}
              </AppButton>
              <AppButton type="button" variant="secondary" size="sm" className="w-full justify-start" onClick={onClearFilters}>
                <BsEraser className="mr-1" aria-hidden="true" />
                {t('actions.clearFilters')}
              </AppButton>
              <AppButton type="button" variant="secondary" size="sm" className="w-full justify-start" onClick={onToggleDensityMode}>
                <BsArrowsCollapse className="mr-1" aria-hidden="true" />
                {densityMode === 'COMPACT'
                  ? t('actions.densityCompact')
                  : t('actions.densityComfortable')}
              </AppButton>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
