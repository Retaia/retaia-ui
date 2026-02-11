import type { Asset, DecisionAction } from '../domain/assets'

type AssetListProps = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (id: string, shiftKey: boolean) => void
}

export function AssetList({
  assets,
  selectedAssetId,
  batchIds,
  onDecision,
  onAssetClick,
}: AssetListProps) {
  if (assets.length === 0) {
    return <p className="empty-state">Aucun asset ne correspond aux filtres.</p>
  }

  return (
    <ul className="asset-list">
      {assets.map((asset) => (
        <li
          key={asset.id}
          className={[
            'asset-row',
            selectedAssetId === asset.id ? 'asset-row--selected' : '',
            batchIds.includes(asset.id) ? 'asset-row--batch' : '',
          ]
            .join(' ')
            .trim()}
          onClick={(event) => onAssetClick(asset.id, event.shiftKey)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onAssetClick(asset.id, event.shiftKey)
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="asset-row-main">
            <strong>{asset.name}</strong>
            <p>
              {asset.id} - {asset.state}
            </p>
            {batchIds.includes(asset.id) ? <small className="batch-chip">Batch</small> : null}
          </div>
          <div className="decision-actions">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'KEEP')
              }}
              disabled={asset.state === 'DECIDED_KEEP'}
            >
              KEEP
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'REJECT')
              }}
              disabled={asset.state === 'DECIDED_REJECT'}
            >
              REJECT
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'CLEAR')
              }}
              disabled={asset.state === 'DECISION_PENDING'}
            >
              CLEAR
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
