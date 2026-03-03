import { Row } from '@ui-kit'
import type { TFunction } from 'i18next'
import { AssetListSection } from '../app/AssetListSection'
import { AssetDetailPanel } from '../app/AssetDetailPanel'
import type { Asset, DecisionAction } from '../../domain/assets'
import { getActionAvailability } from '../../domain/actionAvailability'
import type { DensityMode } from '../../hooks/useDensityMode'

type Props = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  selectionStatusLabel: string
  densityMode: DensityMode
  emptyAssetsMessage: string
  hasMoreAssets?: boolean
  loadingMoreAssets?: boolean
  selectedAsset: Asset | null
  availability: ReturnType<typeof getActionAvailability>
  previewingPurge: boolean
  executingPurge: boolean
  purgeStatus: { kind: 'success' | 'error'; message: string } | null
  decisionStatus: { kind: 'success' | 'error'; message: string } | null
  savingMetadata: boolean
  metadataStatus: { kind: 'success' | 'error'; message: string } | null
  showRefreshAction: boolean
  refreshingAsset: boolean
  assetListRegionRef: React.RefObject<HTMLElement | null>
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
  onSaveMetadata: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
  onPreviewPurge: () => Promise<void>
  onExecutePurge: () => Promise<void>
  onRefreshAsset: () => Promise<void>
  onOpenStandaloneDetail?: (assetId: string) => void
  standaloneHref?: string
  onKeywordClick?: (keyword: string) => void
  onLoadMoreAssets?: () => Promise<void>
  onMetadataDirtyChange?: (dirty: boolean) => void
}

export function ReviewListDetailSection({
  t,
  visibleAssets,
  selectedAssetId,
  batchIds,
  selectionStatusLabel,
  densityMode,
  emptyAssetsMessage,
  hasMoreAssets = false,
  loadingMoreAssets = false,
  selectedAsset,
  availability,
  previewingPurge,
  executingPurge,
  purgeStatus,
  decisionStatus,
  savingMetadata,
  metadataStatus,
  showRefreshAction,
  refreshingAsset,
  assetListRegionRef,
  onDecision,
  onAssetClick,
  onSaveMetadata,
  onPreviewPurge,
  onExecutePurge,
  onRefreshAsset,
  onOpenStandaloneDetail,
  standaloneHref,
  onKeywordClick,
  onLoadMoreAssets,
  onMetadataDirtyChange,
}: Props) {
  return (
    <Row as="section" className="g-3 mt-1">
      <AssetListSection
        t={t}
        visibleAssets={visibleAssets}
        selectedAssetId={selectedAssetId}
        batchIds={batchIds}
        selectionStatusLabel={selectionStatusLabel}
        densityMode={densityMode}
        emptyAssetsMessage={emptyAssetsMessage}
        hasMoreAssets={hasMoreAssets}
        loadingMoreAssets={loadingMoreAssets}
        onDecision={onDecision}
        onAssetClick={onAssetClick}
        assetListRegionRef={assetListRegionRef}
        onLoadMoreAssets={onLoadMoreAssets}
      />

      <AssetDetailPanel
        selectedAsset={selectedAsset}
        availability={availability}
        previewingPurge={previewingPurge}
        executingPurge={executingPurge}
        purgeStatus={purgeStatus}
        decisionStatus={decisionStatus}
        savingMetadata={savingMetadata}
        metadataStatus={metadataStatus}
        t={t}
        onDecision={onDecision}
        onSaveMetadata={onSaveMetadata}
        onPreviewPurge={onPreviewPurge}
        onExecutePurge={onExecutePurge}
        onRefreshAsset={onRefreshAsset}
        showRefreshAction={showRefreshAction}
        refreshingAsset={refreshingAsset}
        onOpenStandaloneDetail={onOpenStandaloneDetail}
        standaloneHref={standaloneHref}
        onKeywordClick={onKeywordClick}
        onMetadataDirtyChange={onMetadataDirtyChange}
      />
    </Row>
  )
}
