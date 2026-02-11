import type { AssetState } from '../domain/assets'

type ReviewSummaryProps = {
  total: number
  counts: Record<AssetState, number>
}

export function ReviewSummary({ total, counts }: ReviewSummaryProps) {
  return (
    <section className="row g-3 mt-1" aria-label="Résumé des assets">
      <article className="col-6 col-lg-3">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h2 className="h6 text-secondary mb-1">Total</h2>
            <p className="display-6 fw-bold mb-0">{total}</p>
          </div>
        </div>
      </article>
      <article className="col-6 col-lg-3">
        <div className="card shadow-sm border-info-subtle h-100">
          <div className="card-body">
            <h2 className="h6 text-secondary mb-1">En attente</h2>
            <p className="display-6 fw-bold mb-0">{counts.DECISION_PENDING}</p>
          </div>
        </div>
      </article>
      <article className="col-6 col-lg-3">
        <div className="card shadow-sm border-success-subtle h-100">
          <div className="card-body">
            <h2 className="h6 text-secondary mb-1">KEEP</h2>
            <p className="display-6 fw-bold mb-0">{counts.DECIDED_KEEP}</p>
          </div>
        </div>
      </article>
      <article className="col-6 col-lg-3">
        <div className="card shadow-sm border-danger-subtle h-100">
          <div className="card-body">
            <h2 className="h6 text-secondary mb-1">REJECT</h2>
            <p className="display-6 fw-bold mb-0">{counts.DECIDED_REJECT}</p>
          </div>
        </div>
      </article>
    </section>
  )
}
