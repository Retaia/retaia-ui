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
    return <p className="text-secondary mb-0">Aucun asset ne correspond aux filtres.</p>
  }

  return (
    <ul className="list-group list-group-flush" role="listbox">
      {assets.map((asset, index) => (
        <li
          key={asset.id}
          data-asset-id={asset.id}
          className={[
            'list-group-item',
            'list-group-item-action',
            'd-flex',
            'justify-content-between',
            'align-items-center',
            'gap-3',
            'py-3',
            selectedAssetId === asset.id ? 'active border-primary' : '',
            batchIds.includes(asset.id) ? 'list-group-item-warning' : '',
          ]
            .join(' ')
            .trim()}
          onClick={(event) => onAssetClick(asset.id, event.shiftKey)}
          onFocus={() => onAssetClick(asset.id, false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onAssetClick(asset.id, event.shiftKey)
            }
          }}
          role="option"
          tabIndex={selectedAssetId ? (selectedAssetId === asset.id ? 0 : -1) : index === 0 ? 0 : -1}
          aria-pressed={selectedAssetId === asset.id}
          aria-selected={selectedAssetId === asset.id}
        >
          <div className="flex-grow-1">
            <strong className="d-block">{asset.name}</strong>
            <p className={selectedAssetId === asset.id ? 'mb-0 text-white-50' : 'mb-0 text-secondary'}>
              {asset.id} - {asset.state}
            </p>
            {batchIds.includes(asset.id) ? (
              <span className="badge text-bg-warning mt-2">Batch</span>
            ) : null}
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
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
              className="btn btn-sm btn-outline-danger"
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
              className="btn btn-sm btn-outline-secondary"
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
