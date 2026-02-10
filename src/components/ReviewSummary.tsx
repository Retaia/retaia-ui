import type { AssetState } from '../domain/assets'

type ReviewSummaryProps = {
  total: number
  counts: Record<AssetState, number>
}

export function ReviewSummary({ total, counts }: ReviewSummaryProps) {
  return (
    <section className="summary-grid" aria-label="Résumé des assets">
      <article className="summary-card">
        <h2>Total</h2>
        <p>{total}</p>
      </article>
      <article className="summary-card summary-card--pending">
        <h2>En attente</h2>
        <p>{counts.DECISION_PENDING}</p>
      </article>
      <article className="summary-card summary-card--keep">
        <h2>KEEP</h2>
        <p>{counts.DECIDED_KEEP}</p>
      </article>
      <article className="summary-card summary-card--reject">
        <h2>REJECT</h2>
        <p>{counts.DECIDED_REJECT}</p>
      </article>
    </section>
  )
}
