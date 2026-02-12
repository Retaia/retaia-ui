import type { Asset, DecisionAction } from '../domain/assets'
import { Badge, Button, ListGroup, Stack } from 'react-bootstrap'
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
  }
  onDecision: (id: string, action: DecisionAction) => void
  onAssetClick: (id: string, shiftKey: boolean) => void
}

export function AssetList({
  assets,
  selectedAssetId,
  batchIds,
  density,
  labels,
  onDecision,
  onAssetClick,
}: AssetListProps) {
  if (assets.length === 0) {
    return (
      <p className="text-secondary mb-0">
        <BsInbox className="me-1" aria-hidden="true" />
        {labels.empty}
      </p>
    )
  }

  const firstAssetId = assets[0]?.id ?? null
  const activeAssetId = selectedAssetId ?? firstAssetId
  const activeOptionId = activeAssetId ? `asset-option-${activeAssetId}` : undefined
  const compact = density === 'COMPACT'

  return (
    <ListGroup as="ul" variant="flush" role="listbox" aria-activedescendant={activeOptionId}>
      {assets.map((asset, index) => (
        <ListGroup.Item
          as="li"
          key={asset.id}
          id={`asset-option-${asset.id}`}
          data-asset-id={asset.id}
          action
          className={[
            'd-flex',
            'justify-content-between',
            'align-items-center',
            'gap-3',
            compact ? 'py-2' : 'py-3',
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
          aria-selected={selectedAssetId === asset.id}
        >
          <div className="flex-grow-1">
            <strong className={compact ? 'd-block small' : 'd-block'}>{asset.name}</strong>
            <p className={selectedAssetId === asset.id ? 'mb-0 text-white-50' : 'mb-0 text-secondary'}>
              {asset.id} - {asset.state}
            </p>
            {batchIds.includes(asset.id) ? (
              <Badge bg="warning" className="mt-2">
                {labels.batch}
              </Badge>
            ) : null}
          </div>
          <Stack direction="horizontal" gap={2} className="flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline-success"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'KEEP')
              }}
              disabled={asset.state === 'DECIDED_KEEP'}
            >
              <BsCheck2Circle className="me-1" aria-hidden="true" />
              {labels.keep}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-danger"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'REJECT')
              }}
              disabled={asset.state === 'DECIDED_REJECT'}
            >
              <BsXCircle className="me-1" aria-hidden="true" />
              {labels.reject}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              onClick={(event) => {
                event.stopPropagation()
                onDecision(asset.id, 'CLEAR')
              }}
              disabled={asset.state === 'DECISION_PENDING'}
            >
              <BsEraser className="me-1" aria-hidden="true" />
              {labels.clear}
            </Button>
          </Stack>
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
