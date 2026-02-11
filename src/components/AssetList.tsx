import type { Asset, DecisionAction } from '../domain/assets'
import { Badge, Button, ListGroup, Stack } from 'react-bootstrap'

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
    <ListGroup as="ul" variant="flush">
      {assets.map((asset) => (
        <ListGroup.Item
          as="li"
          key={asset.id}
          action
          className={[
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
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onAssetClick(asset.id, event.shiftKey)
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={selectedAssetId === asset.id}
        >
          <div className="flex-grow-1">
            <strong className="d-block">{asset.name}</strong>
            <p className={selectedAssetId === asset.id ? 'mb-0 text-white-50' : 'mb-0 text-secondary'}>
              {asset.id} - {asset.state}
            </p>
            {batchIds.includes(asset.id) ? (
              <Badge bg="warning" className="mt-2">
                Batch
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
              KEEP
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
              REJECT
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
              CLEAR
            </Button>
          </Stack>
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
