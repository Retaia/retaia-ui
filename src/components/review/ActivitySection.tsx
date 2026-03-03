import { Button, Card, Stack } from '@ui-kit'
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
    <Card as="section" className="shadow-sm border-0 mt-3">
      <Card.Body>
        <h2 className="h5 mb-3">
          <BsListUl className="me-2" aria-hidden="true" />
          {t('app.nav.activity')}
        </h2>
        <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-2">
          <Button
            type="button"
            variant="warning"
            onClick={onUndoLastAction}
            disabled={undoDisabled}
          >
            <BsArrowClockwise className="me-1" aria-hidden="true" />
            {t('actions.undo')}
          </Button>
          <p className="mb-0 fw-semibold text-secondary">
            {t('actions.history', { count: undoStackLength })}
          </p>
        </Stack>
        <ActionJournalSection t={t} activityLog={activityLog} onClearActivityLog={onClearActivityLog} />
      </Card.Body>
    </Card>
  )
}
