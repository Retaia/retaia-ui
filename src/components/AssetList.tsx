import type { Asset, DecisionAction } from '../domain/assets'
import { BsCheck2Circle, BsEraser, BsInbox, BsXCircle } from 'react-icons/bs'

type AssetListProps = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  density: 'COMFORTABLE' | 'COMPACT'
  labels: {
    empty: string
    batch: string
    keep: string
    reject: string
    clear: string
    state: (value: Asset['state']) => string
  }
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (id: string, shiftKey: boolean) => void
  showDecisionActions?: boolean
}

export function AssetList({
  assets,
  selectedAssetId,
  batchIds,
  density,
  labels,
  onDecision,
  onAssetClick,
  showDecisionActions = true,
}: AssetListProps) {
  if (assets.length === 0) {
    return (
      <p className="text-gray-500 mb-0">
        <BsInbox className="mr-1 inline-block" aria-hidden="true" />
        {labels.empty}
      </p>
    )
  }

  const compact = density === 'COMPACT'

  return (
    <ul className="m-0 list-none overflow-hidden rounded-xl" role="list" aria-label="asset-list">
      {assets.map((asset) => (
        <li
          key={asset.id}
          data-asset-id={asset.id}
          className={[
            'flex',
            'justify-between',
            'items-center',
            'gap-3',
            'border border-gray-200 bg-white p-3 first:rounded-t-xl last:rounded-b-xl',
            compact ? 'py-2' : 'py-3',
            selectedAssetId === asset.id ? 'border-brand-500 bg-brand-50' : '',
            batchIds.includes(asset.id) ? 'bg-warning-50' : '',
          ]
            .join(' ')
            .trim()}
          onClick={(event) => onAssetClick(asset.id, event.shiftKey)}
          role="listitem"
          aria-current={selectedAssetId === asset.id ? 'true' : undefined}
        >
          <div className="grow">
            <button
              type="button"
              data-asset-open="true"
              className={[
                'p-0',
                'text-start',
                'font-semibold',
                selectedAssetId === asset.id ? 'text-brand-700' : 'text-gray-900',
                compact ? 'text-xs' : 'text-sm',
              ]
                .join(' ')
                .trim()}
              onClick={(event) => {
                event.stopPropagation()
                onAssetClick(asset.id, event.shiftKey)
              }}
            >
              {asset.name}
            </button>
            <p className={selectedAssetId === asset.id ? 'mb-0 text-brand-700/80' : 'mb-0 text-gray-500'}>
              {asset.id} - {labels.state(asset.state)}
            </p>
            {batchIds.includes(asset.id) ? (
              <span className="mt-2 inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-800">
                {labels.batch}
              </span>
            ) : null}
          </div>
          {showDecisionActions ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-success-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'KEEP')
                }}
                disabled={asset.state === 'DECIDED_KEEP' || asset.state === 'ARCHIVED'}
              >
                <BsCheck2Circle className="mr-1" aria-hidden="true" />
                {labels.keep}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'REJECT')
                }}
                disabled={asset.state === 'DECIDED_REJECT'}
              >
                <BsXCircle className="mr-1" aria-hidden="true" />
                {labels.reject}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'CLEAR')
                }}
                disabled={asset.state === 'DECISION_PENDING'}
              >
                <BsEraser className="mr-1" aria-hidden="true" />
                {labels.clear}
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
