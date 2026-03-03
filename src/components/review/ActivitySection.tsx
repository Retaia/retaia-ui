import { BsArrowClockwise, BsListUl } from 'react-icons/bs'
import { ActionJournalSection } from '../app/ActionJournalSection'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  undoDisabled: boolean
  undoStackLength: number
  activityLog: Array<{ id: number; label: string }>
  onUndoLastAction: () => void
  onClearActivityLog: () => void
}

export function ActivitySection({
  t,
  undoDisabled,
  undoStackLength,
  activityLog,
  onUndoLastAction,
  onClearActivityLog,
}: Props) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          <BsListUl className="mr-2 inline-block" aria-hidden="true" />
          {t('app.nav.activity')}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-warning-400 bg-warning-400 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-warning-500 hover:bg-warning-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onUndoLastAction}
            disabled={undoDisabled}
          >
            <BsArrowClockwise className="mr-1" aria-hidden="true" />
            {t('actions.undo')}
          </button>
          <p className="mb-0 font-semibold text-gray-500">
            {t('actions.history', { count: undoStackLength })}
          </p>
        </div>
        <ActionJournalSection t={t} activityLog={activityLog} onClearActivityLog={onClearActivityLog} />
    </section>
  )
}
