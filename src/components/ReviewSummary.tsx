import type { AssetState } from '../domain/assets'
import { BsCheckCircleFill, BsClock, BsCollection, BsXCircle } from 'react-icons/bs'

type ReviewSummaryProps = {
  total: number
  counts: Record<AssetState, number>
  labels: {
    region: string
    total: string
    pending: string
    keep: string
    reject: string
  }
}

export function ReviewSummary({ total, counts, labels }: ReviewSummaryProps) {
  return (
    <section className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={labels.region}>
      <article>
        <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-500">
              <BsCollection className="mr-1 inline-block" aria-hidden="true" />
              {labels.total}
            </h2>
            <p className="text-4xl font-bold mb-0">{total}</p>
        </div>
      </article>
      <article>
        <div className="h-full rounded-xl border border-blue-light-200 bg-white p-4 shadow-theme-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-500">
              <BsClock className="mr-1 inline-block" aria-hidden="true" />
              {labels.pending}
            </h2>
            <p className="text-4xl font-bold mb-0">{counts.DECISION_PENDING}</p>
        </div>
      </article>
      <article>
        <div className="h-full rounded-xl border border-success-200 bg-white p-4 shadow-theme-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-500">
              <BsCheckCircleFill className="mr-1 inline-block" aria-hidden="true" />
              {labels.keep}
            </h2>
            <p className="text-4xl font-bold mb-0">{counts.DECIDED_KEEP}</p>
        </div>
      </article>
      <article>
        <div className="h-full rounded-xl border border-error-200 bg-white p-4 shadow-theme-sm">
            <h2 className="mb-1 text-base font-semibold text-gray-500">
              <BsXCircle className="mr-1 inline-block" aria-hidden="true" />
              {labels.reject}
            </h2>
            <p className="text-4xl font-bold mb-0">{counts.DECIDED_REJECT}</p>
        </div>
      </article>
    </section>
  )
}
