import { BsArrowRightCircle, BsCardChecklist, BsCheck2Circle, BsInbox, BsXCircle } from 'react-icons/bs'
import type { Asset, DecisionAction } from '../../domain/assets'

type Props = {
  nextPendingAsset: Asset | null
  t: (key: string) => string
  onOpenNextPending: () => void
  onDecision: (assetId: string, action: DecisionAction) => void
}

export function NextPendingCard({
  nextPendingAsset,
  t,
  onOpenNextPending,
  onDecision,
}: Props) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('next.region')}>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsCardChecklist className="mr-2 inline-block" aria-hidden="true" />
          {t('next.title')}
        </h2>
        {nextPendingAsset ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="block">{nextPendingAsset.name}</strong>
              <p className="text-gray-500 mb-0">{nextPendingAsset.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                onClick={onOpenNextPending}
                data-testid="next-open"
              >
                <BsArrowRightCircle className="mr-1" aria-hidden="true" />
                {t('next.open')}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-success-300 bg-white px-3 py-2 text-sm font-semibold text-success-700 transition-colors hover:bg-success-50"
                onClick={() => onDecision(nextPendingAsset.id, 'KEEP')}
                data-testid="next-keep"
              >
                <BsCheck2Circle className="mr-1" aria-hidden="true" />
                {t('actions.decisionKeep')}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50"
                onClick={() => onDecision(nextPendingAsset.id, 'REJECT')}
                data-testid="next-reject"
              >
                <BsXCircle className="mr-1" aria-hidden="true" />
                {t('actions.decisionReject')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-0">
            <BsInbox className="mr-1 inline-block" aria-hidden="true" />
            {t('next.empty')}
          </p>
        )}
    </section>
  )
}
