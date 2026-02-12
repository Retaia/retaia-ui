import { Button, Card, Col, Stack } from 'react-bootstrap'
import type { Asset, DecisionAction } from '../../domain/assets'
import { getActionAvailability } from '../../domain/actionAvailability'

type PurgeStatus = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  selectedAsset: Asset | null
  availability: ReturnType<typeof getActionAvailability>
  previewingPurge: boolean
  executingPurge: boolean
  purgeStatus: PurgeStatus | null
  t: (key: string, values?: Record<string, string>) => string
  onDecision: (assetId: string, action: DecisionAction) => void
  onPreviewPurge: () => Promise<void>
  onExecutePurge: () => Promise<void>
}

export function AssetDetailPanel({
  selectedAsset,
  availability,
  previewingPurge,
  executingPurge,
  purgeStatus,
  t,
  onDecision,
  onPreviewPurge,
  onExecutePurge,
}: Props) {
  return (
    <Col as="section" xs={12} xl={4} aria-label={t('detail.region')}>
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <h2 className="h5">{t('detail.title')}</h2>
          {selectedAsset ? (
            <div>
              <strong className="d-block">{selectedAsset.name}</strong>
              <p className="text-secondary mb-1">{t('detail.id', { id: selectedAsset.id })}</p>
              <p className="text-secondary mb-3">
                {t('detail.state', { state: selectedAsset.state })}
              </p>
              <Stack direction="horizontal" className="flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => onDecision(selectedAsset.id, 'KEEP')}
                >
                  KEEP
                </Button>
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={() => onDecision(selectedAsset.id, 'REJECT')}
                >
                  REJECT
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => onDecision(selectedAsset.id, 'CLEAR')}
                >
                  CLEAR
                </Button>
              </Stack>
              <section className="border border-2 border-danger-subtle rounded p-3 mt-3">
                <h3 className="h6 mb-2">{t('actions.purgeTitle')}</h3>
                <p className="small text-secondary mb-2">{t('actions.purgeHelp')}</p>
                <Stack direction="horizontal" className="flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() => void onPreviewPurge()}
                    disabled={availability.previewPurgeDisabled}
                  >
                    {previewingPurge ? t('actions.purgePreviewing') : t('actions.purgePreview')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void onExecutePurge()}
                    disabled={availability.executePurgeDisabled}
                  >
                    {executingPurge ? t('actions.purging') : t('actions.purgeConfirm')}
                  </Button>
                </Stack>
              </section>
            </div>
          ) : (
            <p className="text-secondary mb-0">{t('detail.empty')}</p>
          )}
          {purgeStatus ? (
            <p
              data-testid="asset-purge-status"
              role="status"
              aria-live="polite"
              className={[
                'small',
                'mt-3',
                'mb-0',
                purgeStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {purgeStatus.message}
            </p>
          ) : null}
        </Card.Body>
      </Card>
    </Col>
  )
}
