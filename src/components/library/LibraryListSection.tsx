import type { TFunction } from 'i18next'
import { BsArchive, BsSearch, BsSortDown } from 'react-icons/bs'
import { AssetList } from '../AssetList'
import type { Asset } from '../../domain/assets'
import type { AssetSort } from '../../domain/assets'
import { ASSET_STATE_LABEL_KEYS } from '../../domain/assets'
import type { DensityMode } from '../../hooks/useDensityMode'

type Props = {
  t: TFunction
  visibleAssets: Asset[]
  selectedAssetId: string | null
  densityMode: DensityMode
  search: string
  sort: AssetSort
  hasMoreAssets?: boolean
  loadingMoreAssets?: boolean
  onSearchChange: (value: string) => void
  onSortChange: (value: AssetSort) => void
  onAssetClick: (assetId: string, shiftKey: boolean) => void
  onLoadMoreAssets?: () => Promise<void>
}

export function LibraryListSection({
  t,
  visibleAssets,
  selectedAssetId,
  densityMode,
  search,
  sort,
  hasMoreAssets = false,
  loadingMoreAssets = false,
  onSearchChange,
  onSortChange,
  onAssetClick,
  onLoadMoreAssets,
}: Props) {
  return (
    <section className="w-full xl:w-8/12" aria-label={t('library.region')}>
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            <BsArchive className="mr-2 inline-block" aria-hidden="true" />
            {t('library.title', { count: visibleAssets.length })}
          </h2>
          <p className="text-xs text-gray-500 mb-3">{t('library.subtitle')}</p>
          <label htmlFor="library-search" className="font-semibold text-sm text-gray-700">
            <BsSearch className="mr-1 inline-block" aria-hidden="true" />
            {t('library.search')}
          </label>
          <input
            id="library-search"
            data-testid="library-search-input"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('library.searchPlaceholder')}
            className="mb-3 mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <label htmlFor="library-sort-key" className="font-semibold text-sm text-gray-700">
            <BsSortDown className="mr-1 inline-block" aria-hidden="true" />
            {t('library.sortBy')}
          </label>
          <select
            id="library-sort-key"
            data-testid="library-sort-key"
            value={sort}
            onChange={(event) => onSortChange(event.currentTarget.value as AssetSort)}
            className="mb-2 mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="-created_at">{t('library.sortCreatedAtDesc')}</option>
            <option value="created_at">{t('library.sortCreatedAtAsc')}</option>
            <option value="-updated_at">{t('library.sortUpdatedAtDesc')}</option>
            <option value="updated_at">{t('library.sortUpdatedAtAsc')}</option>
            <option value="name">{t('library.sortNameAsc')}</option>
            <option value="-name">{t('library.sortNameDesc')}</option>
          </select>
          <AssetList
            assets={visibleAssets}
            selectedAssetId={selectedAssetId}
            batchIds={[]}
            density={densityMode}
            labels={{
              empty: t('library.empty'),
              keep: t('actions.decisionKeep'),
              reject: t('actions.decisionReject'),
              clear: t('actions.decisionClear'),
              state: (value) => t(ASSET_STATE_LABEL_KEYS[value]),
            }}
            onDecision={() => {}}
            onAssetClick={onAssetClick}
            showDecisionActions={false}
          />
          {hasMoreAssets && onLoadMoreAssets ? (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="library-load-more"
                onClick={() => void onLoadMoreAssets()}
                disabled={loadingMoreAssets}
              >
                {loadingMoreAssets ? t('library.loadingMore') : t('library.loadMore')}
              </button>
            </div>
          ) : null}
      </div>
    </section>
  )
}
