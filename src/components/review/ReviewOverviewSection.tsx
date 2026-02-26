import { ReviewSummary } from '../ReviewSummary'
import { ReviewToolbar } from '../ReviewToolbar'
import { ReviewStatusAlerts } from '../app/ReviewStatusAlerts'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSortKey,
  AssetState,
  SortOrder,
} from '../../domain/assets'
import type { TFunction } from 'i18next'

type Props = {
  t: TFunction
  totalAssets: number
  counts: Record<AssetState, number>
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sortKey: AssetSortKey
  sortOrder: SortOrder
  search: string
  isApiAssetSource: boolean
  assetsLoadState: 'idle' | 'loading' | 'ready' | 'error'
  policyLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkDecisionsEnabled: boolean
  onFilterChange: (value: AssetFilter) => void
  onMediaTypeFilterChange: (value: AssetMediaTypeFilter) => void
  onDateFilterChange: (value: AssetDateFilter) => void
  onSortKeyChange: (value: AssetSortKey) => void
  onSortOrderChange: (value: SortOrder) => void
  onSearchChange: (value: string) => void
}

export function ReviewOverviewSection({
  t,
  totalAssets,
  counts,
  filter,
  mediaTypeFilter,
  dateFilter,
  sortKey,
  sortOrder,
  search,
  isApiAssetSource,
  assetsLoadState,
  policyLoadState,
  bulkDecisionsEnabled,
  onFilterChange,
  onMediaTypeFilterChange,
  onDateFilterChange,
  onSortKeyChange,
  onSortOrderChange,
  onSearchChange,
}: Props) {
  return (
    <>
      <ReviewSummary
        total={totalAssets}
        counts={counts}
        labels={{
          region: t('summary.region'),
          total: t('summary.total'),
          pending: t('summary.pending'),
          keep: t('summary.keep'),
          reject: t('summary.reject'),
        }}
      />
      <ReviewToolbar
        filter={filter}
        mediaTypeFilter={mediaTypeFilter}
        dateFilter={dateFilter}
        sortKey={sortKey}
        sortOrder={sortOrder}
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          mediaType: t('toolbar.mediaType'),
          date: t('toolbar.date'),
          sortBy: t('toolbar.sortBy'),
          sortOrder: t('toolbar.sortOrder'),
          sortByCapturedAt: t('toolbar.sortByCapturedAt'),
          sortByName: t('toolbar.sortByName'),
          sortByState: t('toolbar.sortByState'),
          orderAsc: t('toolbar.orderAsc'),
          orderDesc: t('toolbar.orderDesc'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
          date7d: t('toolbar.date7d'),
          date30d: t('toolbar.date30d'),
        }}
        onFilterChange={onFilterChange}
        onMediaTypeFilterChange={onMediaTypeFilterChange}
        onDateFilterChange={onDateFilterChange}
        onSortKeyChange={onSortKeyChange}
        onSortOrderChange={onSortOrderChange}
        onSearchChange={onSearchChange}
      />
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={isApiAssetSource}
        assetsLoadState={assetsLoadState}
        policyLoadState={policyLoadState}
        bulkDecisionsEnabled={bulkDecisionsEnabled}
      />
    </>
  )
}
