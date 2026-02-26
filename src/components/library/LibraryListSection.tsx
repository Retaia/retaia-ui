import type { TFunction } from 'i18next'
import { Card, Col, Form } from 'react-bootstrap'
import { BsArchive, BsSearch } from 'react-icons/bs'
import { AssetList } from '../AssetList'
import type { Asset } from '../../domain/assets'
import type { DensityMode } from '../../hooks/useDensityMode'

type Props = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  densityMode: DensityMode
  search: string
  onSearchChange: (value: string) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
}

export function LibraryListSection({
  t,
  visibleAssets,
  selectedAssetId,
  densityMode,
  search,
  onSearchChange,
  onAssetClick,
}: Props) {
  return (
    <Col as="section" xs={12} xl={8} aria-label={t('library.region')}>
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <h2 className="h5">
            <BsArchive className="me-2" aria-hidden="true" />
            {t('library.title', { count: visibleAssets.length })}
          </h2>
          <p className="small text-secondary mb-3">{t('library.subtitle')}</p>
          <Form.Label htmlFor="library-search" className="fw-semibold">
            <BsSearch className="me-1" aria-hidden="true" />
            {t('library.search')}
          </Form.Label>
          <Form.Control
            id="library-search"
            data-testid="library-search-input"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('library.searchPlaceholder')}
            className="mb-3"
          />
          <AssetList
            assets={visibleAssets}
            selectedAssetId={selectedAssetId}
            batchIds={[]}
            density={densityMode}
            labels={{
              empty: t('library.empty'),
              batch: '',
              keep: 'KEEP',
              reject: 'REJECT',
              clear: 'CLEAR',
            }}
            onDecision={() => {}}
            onAssetClick={onAssetClick}
            showDecisionActions={false}
          />
        </Card.Body>
      </Card>
    </Col>
  )
}
