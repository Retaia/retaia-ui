import type { Asset, DecisionAction } from '../domain/assets'
import { BsCheck2Circle, BsEraser, BsInbox, BsXCircle } from 'react-icons/bs'
import { AppButton } from './ui/AppButton'

type AssetListProps = {
  assets: Asset[]
  selectedAssetId: string | null
  batchIds: string[]
  density: 'COMFORTABLE' | 'COMPACT'
  labels: {
    empty: string
    keep: string
    reject: string
    clear: string
    state: (value: Asset['state']) => string
  }
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (id: string, shiftKey: boolean) => void
  onBatchSelectionChange?: (id: string, selected: boolean) => void
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
  onBatchSelectionChange,
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
            {showDecisionActions && onBatchSelectionChange ? (
              <label className="mb-1 inline-flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={batchIds.includes(asset.id)}
                  aria-label={asset.name}
                  className="h-4 w-4 accent-[var(--color-brand-500)]"
                  onChange={(event) => {
                    event.stopPropagation()
                    const selected = event.currentTarget.checked
                    onBatchSelectionChange(asset.id, selected)
                  }}
                  onClick={(event) => event.stopPropagation()}
                />
              </label>
            ) : null}
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
          </div>
          {showDecisionActions ? (
            <div className="flex flex-wrap gap-2">
              <AppButton
                size="sm"
                variant="outline-success"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'KEEP')
                }}
                disabled={asset.state === 'DECIDED_KEEP' || asset.state === 'ARCHIVED'}
              >
                <BsCheck2Circle className="mr-1" aria-hidden="true" />
                {labels.keep}
              </AppButton>
              <AppButton
                size="sm"
                variant="outline-danger"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'REJECT')
                }}
                disabled={asset.state === 'DECIDED_REJECT'}
              >
                <BsXCircle className="mr-1" aria-hidden="true" />
                {labels.reject}
              </AppButton>
              <AppButton
                size="sm"
                variant="outline-secondary"
                onClick={(event) => {
                  event.stopPropagation()
                  onDecision(asset.id, 'CLEAR')
                }}
                disabled={asset.state === 'DECISION_PENDING'}
              >
                <BsEraser className="mr-1" aria-hidden="true" />
                {labels.clear}
              </AppButton>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
