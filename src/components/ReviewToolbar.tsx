import type { AssetFilter } from '../domain/assets'

type ReviewToolbarProps = {
  filter: AssetFilter
  search: string
  onFilterChange: (filter: AssetFilter) => void
  onSearchChange: (search: string) => void
}

export function ReviewToolbar({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: ReviewToolbarProps) {
  return (
    <section className="card shadow-sm border-0 mt-3">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="state-filter">
              Filtrer par état
            </label>
          <select
            className="form-select"
            id="state-filter"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as AssetFilter)}
          >
            <option value="ALL">Tous</option>
            <option value="DECISION_PENDING">DECISION_PENDING</option>
            <option value="DECIDED_KEEP">DECIDED_KEEP</option>
            <option value="DECIDED_REJECT">DECIDED_REJECT</option>
          </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="asset-search">
              Recherche
            </label>
          <input
            className="form-control"
            id="asset-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Nom ou identifiant"
          />
          </div>
        </div>
      </div>
    </section>
  )
}
