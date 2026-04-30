import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSort,
} from '../domain/assets'
import { ASSET_STATES } from '../domain/assets'
import { BsCalendar3, BsFunnel, BsSearch, BsSliders2, BsSortDown } from 'react-icons/bs'

type ReviewToolbarProps = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
  search: string
  labels: {
    filter: string
    mediaType: string
    date: string
    sortBy: string
    sortCreatedAtDesc: string
    sortCreatedAtAsc: string
    sortUpdatedAtDesc: string
    sortUpdatedAtAsc: string
    sortNameAsc: string
    sortNameDesc: string
    search: string
    searchPlaceholder: string
    all: string
    date7d: string
    date30d: string
    stateLabel: (value: AssetFilter) => string
    mediaTypeVideo: string
    mediaTypeAudio: string
    mediaTypeImage: string
    mediaTypeOther: string
  }
  onFilterChange: (filter: AssetFilter) => void
  onMediaTypeFilterChange: (filter: AssetMediaTypeFilter) => void
  onDateFilterChange: (filter: AssetDateFilter) => void
  onSortChange: (value: AssetSort) => void
  onSearchChange: (search: string) => void
}

export function ReviewToolbar({
  filter,
  mediaTypeFilter,
  dateFilter,
  sort,
  search,
  labels,
  onFilterChange,
  onMediaTypeFilterChange,
  onDateFilterChange,
  onSortChange,
  onSearchChange,
}: ReviewToolbarProps) {
  const controlClass =
    'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'

  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-theme-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-3">
            <label className="font-semibold text-xs text-gray-700 dark:text-gray-300" htmlFor="state-filter">
              <BsFunnel className="mr-1 inline-block" aria-hidden="true" />
              {labels.filter}
            </label>
            <select
              id="state-filter"
              value={filter}
              onChange={(event) => onFilterChange(event.target.value as AssetFilter)}
              className={controlClass}
            >
              <option value="WORK_QUEUE">{labels.stateLabel('WORK_QUEUE')}</option>
              <option value="ALL">{labels.all}</option>
              {ASSET_STATES.map((state) => (
                <option key={state} value={state}>
                  {labels.stateLabel(state)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-xs text-gray-700 dark:text-gray-300" htmlFor="media-type-filter">
              <BsSliders2 className="mr-1 inline-block" aria-hidden="true" />
              {labels.mediaType}
            </label>
            <select
              id="media-type-filter"
              value={mediaTypeFilter}
              onChange={(event) => onMediaTypeFilterChange(event.target.value as AssetMediaTypeFilter)}
              className={controlClass}
            >
              <option value="ALL">{labels.all}</option>
              <option value="VIDEO">{labels.mediaTypeVideo}</option>
              <option value="AUDIO">{labels.mediaTypeAudio}</option>
              <option value="IMAGE">{labels.mediaTypeImage}</option>
              <option value="OTHER">{labels.mediaTypeOther}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-xs text-gray-700 dark:text-gray-300" htmlFor="captured-date-filter">
              <BsCalendar3 className="mr-1 inline-block" aria-hidden="true" />
              {labels.date}
            </label>
            <select
              id="captured-date-filter"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value as AssetDateFilter)}
              className={controlClass}
            >
              <option value="ALL">{labels.all}</option>
              <option value="LAST_7_DAYS">{labels.date7d}</option>
              <option value="LAST_30_DAYS">{labels.date30d}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-xs text-gray-700 dark:text-gray-300" htmlFor="sort-key-filter">
              <BsSortDown className="mr-1 inline-block" aria-hidden="true" />
              {labels.sortBy}
            </label>
            <select
              id="sort-key-filter"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as AssetSort)}
              className={controlClass}
            >
              <option value="-created_at">{labels.sortCreatedAtDesc}</option>
              <option value="created_at">{labels.sortCreatedAtAsc}</option>
              <option value="-updated_at">{labels.sortUpdatedAtDesc}</option>
              <option value="updated_at">{labels.sortUpdatedAtAsc}</option>
              <option value="name">{labels.sortNameAsc}</option>
              <option value="-name">{labels.sortNameDesc}</option>
            </select>
          </div>

          <div className="md:col-span-12">
            <label className="font-semibold text-xs text-gray-700 dark:text-gray-300" htmlFor="asset-search">
              <BsSearch className="mr-1 inline-block" aria-hidden="true" />
              {labels.search}
            </label>
            <input
              id="asset-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className={controlClass}
            />
          </div>
        </div>
    </section>
  )
}
