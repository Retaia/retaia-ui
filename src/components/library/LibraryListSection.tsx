import type { TFunction } from 'i18next'
import { Card, Col, Form } from 'react-bootstrap'
import { BsArchive, BsSearch, BsSortDown } from 'react-icons/bs'
import { AssetList } from '../AssetList'
import type { Asset } from '../../domain/assets'
import type { AssetSort } from '../../domain/assets'
import type { DensityMode } from '../../hooks/useDensityMode'

type Props = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  densityMode: DensityMode
  search: string
  sort: AssetSort
  onSearchChange: (value: string) => void
  onSortChange: (value: AssetSort) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
}

export function LibraryListSection({
  t,
  visibleAssets,
  selectedAssetId,
  densityMode,
  search,
  sort,
  onSearchChange,
  onSortChange,
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
          <Form.Label htmlFor="library-sort-key" className="fw-semibold">
            <BsSortDown className="me-1" aria-hidden="true" />
            {t('library.sortBy')}
          </Form.Label>
          <Form.Select
            id="library-sort-key"
            data-testid="library-sort-key"
            value={sort}
            onChange={(event) => onSortChange(event.currentTarget.value as AssetSort)}
            className="mb-2"
          >
            <option value="-created_at">{t('library.sortCreatedAtDesc')}</option>
            <option value="created_at">{t('library.sortCreatedAtAsc')}</option>
            <option value="-updated_at">{t('library.sortUpdatedAtDesc')}</option>
            <option value="updated_at">{t('library.sortUpdatedAtAsc')}</option>
            <option value="name">{t('library.sortNameAsc')}</option>
            <option value="-name">{t('library.sortNameDesc')}</option>
          </Form.Select>
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
