import type { Asset, DecisionAction } from '../domain/assets'

type AssetListProps = {
  assets: Asset[]
  onDecision: (id: string, action: DecisionAction) => void
}

export function AssetList({ assets, onDecision }: AssetListProps) {
  if (assets.length === 0) {
    return <p className="empty-state">Aucun asset ne correspond aux filtres.</p>
  }

  return (
    <ul className="asset-list">
      {assets.map((asset) => (
        <li key={asset.id} className="asset-row">
          <div>
            <strong>{asset.name}</strong>
            <p>
              {asset.id} - {asset.state}
            </p>
          </div>
          <div className="decision-actions">
            <button
              type="button"
              onClick={() => onDecision(asset.id, 'KEEP')}
              disabled={asset.state === 'DECIDED_KEEP'}
            >
              KEEP
            </button>
            <button
              type="button"
              onClick={() => onDecision(asset.id, 'REJECT')}
              disabled={asset.state === 'DECIDED_REJECT'}
            >
              REJECT
            </button>
            <button
              type="button"
              onClick={() => onDecision(asset.id, 'CLEAR')}
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
