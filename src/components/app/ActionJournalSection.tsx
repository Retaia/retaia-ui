import { Button, Stack } from '@tailadmin'
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
      <Stack direction="horizontal" className="justify-between items-center gap-2 mb-2">
        <h3 className="h6 mb-0">
          <BsListUl className="me-1" aria-hidden="true" />
          {t('actions.journal')}
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          onClick={onClearActivityLog}
          disabled={activityLog.length === 0}
        >
          <BsTrash3Fill className="me-1" aria-hidden="true" />
          {t('actions.journalClear')}
        </Button>
      </Stack>
      {activityLog.length === 0 ? (
        <p className="text-gray-500 mb-0">
          <BsInbox className="me-1" aria-hidden="true" />
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
