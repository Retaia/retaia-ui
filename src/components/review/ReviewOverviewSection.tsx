import { ReviewSummary } from '../ReviewSummary'
import { ReviewToolbar } from '../ReviewToolbar'
import { ReviewStatusAlerts } from '../app/ReviewStatusAlerts'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSort,
  AssetState,
} from '../../domain/assets'
import { ASSET_STATE_LABEL_KEYS } from '../../domain/assets'
import type { TFunction } from 'i18next'

type Props = {
  t: TFunction
  totalAssets: number
  counts: Record<AssetState, number>
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
  search: string
  isApiAssetSource: boolean
  assetsLoadState: 'idle' | 'loading' | 'ready' | 'error'
  policyLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkAvailabilityLoadState: 'idle' | 'loading' | 'ready' | 'error'
  bulkDecisionsEnabled: boolean
  policySummary: {
    featureFlagsCount: number
    contractVersion: string | null
    pollIntervalSeconds: number
  } | null
  refreshingPolicy: boolean
  onRefreshPolicy: () => Promise<void> | void
  onFilterChange: (value: AssetFilter) => void
  onMediaTypeFilterChange: (value: AssetMediaTypeFilter) => void
  onDateFilterChange: (value: AssetDateFilter) => void
  onSortChange: (value: AssetSort) => void
  onSearchChange: (value: string) => void
}

export function ReviewOverviewSection({
  t,
  totalAssets,
  counts,
  filter,
  mediaTypeFilter,
  dateFilter,
  sort,
  search,
  isApiAssetSource,
  assetsLoadState,
  policyLoadState,
  bulkAvailabilityLoadState,
  bulkDecisionsEnabled,
  policySummary,
  refreshingPolicy,
  onRefreshPolicy,
  onFilterChange,
  onMediaTypeFilterChange,
  onDateFilterChange,
  onSortChange,
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
        sort={sort}
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          mediaType: t('toolbar.mediaType'),
          date: t('toolbar.date'),
          sortBy: t('toolbar.sortBy'),
          sortCreatedAtDesc: t('toolbar.sortCreatedAtDesc'),
          sortCreatedAtAsc: t('toolbar.sortCreatedAtAsc'),
          sortUpdatedAtDesc: t('toolbar.sortUpdatedAtDesc'),
          sortUpdatedAtAsc: t('toolbar.sortUpdatedAtAsc'),
          sortNameAsc: t('toolbar.sortNameAsc'),
          sortNameDesc: t('toolbar.sortNameDesc'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
          date7d: t('toolbar.date7d'),
          date30d: t('toolbar.date30d'),
          stateLabel: (value) =>
            value === 'ALL'
              ? t('toolbar.all')
              : value === 'WORK_QUEUE'
                ? t('toolbar.stateWorkQueue')
                : t(ASSET_STATE_LABEL_KEYS[value]),
          mediaTypeVideo: t('toolbar.mediaTypeVideo'),
          mediaTypeAudio: t('toolbar.mediaTypeAudio'),
          mediaTypeImage: t('toolbar.mediaTypeImage'),
          mediaTypeOther: t('toolbar.mediaTypeOther'),
        }}
        onFilterChange={onFilterChange}
        onMediaTypeFilterChange={onMediaTypeFilterChange}
        onDateFilterChange={onDateFilterChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
      />
      <ReviewStatusAlerts
        t={t}
        isApiAssetSource={isApiAssetSource}
        assetsLoadState={assetsLoadState}
        policyLoadState={policyLoadState}
        bulkAvailabilityLoadState={bulkAvailabilityLoadState}
        bulkDecisionsEnabled={bulkDecisionsEnabled}
        policySummary={policySummary}
        refreshingPolicy={refreshingPolicy}
        onRefreshPolicy={onRefreshPolicy}
      />
    </>
  )
}
