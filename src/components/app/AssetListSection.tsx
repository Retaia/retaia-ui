import { BsCollection, BsCrosshair, BsGrid3X3Gap, BsQuestionCircle } from 'react-icons/bs'
import type { TFunction } from 'i18next'
import { AssetList } from '../AssetList'
import type { Asset, DecisionAction } from '../../domain/assets'
import { ASSET_STATE_LABEL_KEYS } from '../../domain/assets'
import type { DensityMode } from '../../hooks/useDensityMode'
import type { DisplayType } from '../../hooks/useDisplayType'
import { DisplayTypeToggle } from '../ui/DisplayTypeToggle'

type AssetListSectionProps = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  selectionStatusLabel: string
  densityMode: DensityMode
  displayType?: DisplayType
  emptyAssetsMessage: string
  hasMoreAssets?: boolean
  loadingMoreAssets?: boolean
  showDecisionActions?: boolean
  helpText?: string
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
  onBatchSelectionChange?: (assetId: string, selected: boolean) => void
  onDisplayTypeChange?: (value: DisplayType) => void
  assetListRegionRef: React.RefObject<HTMLElement | null>
  onLoadMoreAssets?: () => Promise<void>
}

export function AssetListSection({
  t,
  visibleAssets,
  selectedAssetId,
  batchIds,
  selectionStatusLabel,
  densityMode,
  displayType = 'TABLE',
  emptyAssetsMessage,
  hasMoreAssets = false,
  loadingMoreAssets = false,
  showDecisionActions = true,
  helpText,
  onDecision,
  onAssetClick,
  onBatchSelectionChange,
  onDisplayTypeChange,
  assetListRegionRef,
  onLoadMoreAssets,
}: AssetListSectionProps) {
  return (
    <section className="w-full xl:w-8/12" aria-label={t('assets.region')} ref={assetListRegionRef}>
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            <BsGrid3X3Gap className="mr-2 inline-block" aria-hidden="true" />
            {t('assets.title', { count: visibleAssets.length })}
          </h2>
          <DisplayTypeToggle
            label={t('assets.displayType')}
            tableLabel={t('assets.displayTypeTable')}
            cardsLabel={t('assets.displayTypeCards')}
            value={displayType}
            onChange={(value) => onDisplayTypeChange?.(value)}
          />
          </div>
          <p className="mb-1 text-xs text-gray-500" data-testid="selection-status">
            <BsCrosshair className="mr-1 inline-block" aria-hidden="true" />
            {selectionStatusLabel}
          </p>
          {showDecisionActions ? (
            <p className="mb-2 text-xs text-gray-500" data-testid="batch-status">
              <BsCollection className="mr-1 inline-block" aria-hidden="true" />
              {t('assets.batchStatus', { count: batchIds.length })}
            </p>
          ) : null}
          <p className="text-xs text-gray-500">
            <BsQuestionCircle className="mr-1 inline-block" aria-hidden="true" />
            {helpText ?? t('assets.help')}
          </p>
          <AssetList
            assets={visibleAssets}
            selectedAssetId={selectedAssetId}
            batchIds={batchIds}
            displayType={displayType}
            density={densityMode}
            labels={{
              empty: emptyAssetsMessage,
              select: t('assets.columnSelect'),
              asset: t('assets.columnAsset'),
              stateLabel: t('assets.columnState'),
              actions: t('assets.columnActions'),
              keep: t('actions.decisionKeep'),
              reject: t('actions.decisionReject'),
              clear: t('actions.decisionClear'),
              state: (value) => t(ASSET_STATE_LABEL_KEYS[value]),
            }}
            onDecision={onDecision}
            onAssetClick={onAssetClick}
            onBatchSelectionChange={onBatchSelectionChange}
            showDecisionActions={showDecisionActions}
          />
          {hasMoreAssets && onLoadMoreAssets ? (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="review-load-more"
                onClick={() => void onLoadMoreAssets()}
                disabled={loadingMoreAssets}
              >
                {loadingMoreAssets ? t('assets.loadingMore') : t('assets.loadMore')}
              </button>
            </div>
          ) : null}
      </div>
    </section>
  )
}
