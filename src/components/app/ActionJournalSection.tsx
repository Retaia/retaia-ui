import { BsInbox, BsListUl, BsTrash3Fill } from 'react-icons/bs'

type ActivityEntry = {
  id: number
  label: string
}

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  activityLog: ActivityEntry[]
  onClearActivityLog: () => void
}

export function ActionJournalSection({ t, activityLog, onClearActivityLog }: Props) {
  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-3" aria-label={t('actions.journal')}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="mb-0 text-base font-semibold text-gray-900">
          <BsListUl className="mr-1 inline-block" aria-hidden="true" />
          {t('actions.journal')}
        </h3>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClearActivityLog}
          disabled={activityLog.length === 0}
        >
          <BsTrash3Fill className="mr-1" aria-hidden="true" />
          {t('actions.journalClear')}
        </button>
      </div>
      {activityLog.length === 0 ? (
        <p className="text-gray-500 mb-0">
          <BsInbox className="mr-1 inline-block" aria-hidden="true" />
          {t('actions.journalEmpty')}
        </p>
      ) : (
        <ul className="mb-0">
          {activityLog.map((entry) => (
            <li key={entry.id}>{entry.label}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
