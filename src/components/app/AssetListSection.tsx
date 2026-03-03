import { Button, Card, Col } from '@tailadmin'
import { BsCollection, BsCrosshair, BsGrid3X3Gap, BsQuestionCircle } from 'react-icons/bs'
import type { TFunction } from 'i18next'
import { AssetList } from '../AssetList'
import type { Asset, DecisionAction } from '../../domain/assets'
import { ASSET_STATE_LABEL_KEYS } from '../../domain/assets'
import type { DensityMode } from '../../hooks/useDensityMode'

type AssetListSectionProps = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  selectionStatusLabel: string
  densityMode: DensityMode
  emptyAssetsMessage: string
  hasMoreAssets?: boolean
  loadingMoreAssets?: boolean
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
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
  emptyAssetsMessage,
  hasMoreAssets = false,
  loadingMoreAssets = false,
  onDecision,
  onAssetClick,
  assetListRegionRef,
  onLoadMoreAssets,
}: AssetListSectionProps) {
  return (
    <Col as="section" xs={12} xl={8} aria-label={t('assets.region')} ref={assetListRegionRef}>
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <h2 className="h5">
            <BsGrid3X3Gap className="me-2" aria-hidden="true" />
            {t('assets.title', { count: visibleAssets.length })}
          </h2>
          <p className="small mb-1 text-secondary" data-testid="selection-status">
            <BsCrosshair className="me-1" aria-hidden="true" />
            {selectionStatusLabel}
          </p>
          <p className="small mb-2 text-secondary" data-testid="batch-status">
            <BsCollection className="me-1" aria-hidden="true" />
            {t('assets.batchStatus', { count: batchIds.length })}
          </p>
          <p className="small text-secondary">
            <BsQuestionCircle className="me-1" aria-hidden="true" />
            {t('assets.help')}
          </p>
          <AssetList
            assets={visibleAssets}
            selectedAssetId={selectedAssetId}
            batchIds={batchIds}
            density={densityMode}
            labels={{
              empty: emptyAssetsMessage,
              batch: t('assets.batchBadge'),
              keep: t('actions.decisionKeep'),
              reject: t('actions.decisionReject'),
              clear: t('actions.decisionClear'),
              state: (value) => t(ASSET_STATE_LABEL_KEYS[value]),
            }}
            onDecision={onDecision}
            onAssetClick={onAssetClick}
          />
          {hasMoreAssets && onLoadMoreAssets ? (
            <div className="d-flex justify-content-center mt-3">
              <Button
                type="button"
                variant="outline-secondary"
                data-testid="review-load-more"
                onClick={() => void onLoadMoreAssets()}
                disabled={loadingMoreAssets}
              >
                {loadingMoreAssets ? t('assets.loadingMore') : t('assets.loadMore')}
              </Button>
            </div>
          ) : null}
        </Card.Body>
      </Card>
    </Col>
  )
}
