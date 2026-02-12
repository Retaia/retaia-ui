import { Button, Card, Stack } from 'react-bootstrap'
import type { Asset, DecisionAction } from '../../domain/assets'

type Props = {
  nextPendingAsset: Asset | null
  t: (key: string) => string
  onOpenNextPending: () => void
  onDecision: (assetId: string, action: DecisionAction) => void
}

export function NextPendingCard({
  nextPendingAsset,
  t,
  onOpenNextPending,
  onDecision,
}: Props) {
  return (
    <Card as="section" className="shadow-sm border-0 mt-3" aria-label={t('next.region')}>
      <Card.Body>
        <h2 className="h5 mb-3">{t('next.title')}</h2>
        {nextPendingAsset ? (
          <Stack direction="horizontal" className="flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <strong className="d-block">{nextPendingAsset.name}</strong>
              <p className="text-secondary mb-0">{nextPendingAsset.id}</p>
            </div>
            <Stack direction="horizontal" gap={2}>
              <Button type="button" variant="outline-primary" onClick={onOpenNextPending}>
                {t('next.open')}
              </Button>
              <Button
                type="button"
                variant="outline-success"
                onClick={() => onDecision(nextPendingAsset.id, 'KEEP')}
              >
                KEEP
              </Button>
              <Button
                type="button"
                variant="outline-danger"
                onClick={() => onDecision(nextPendingAsset.id, 'REJECT')}
              >
                REJECT
              </Button>
            </Stack>
          </Stack>
        ) : (
          <p className="text-secondary mb-0">{t('next.empty')}</p>
        )}
      </Card.Body>
    </Card>
  )
}
