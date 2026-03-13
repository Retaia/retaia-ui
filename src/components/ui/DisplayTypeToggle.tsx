import { BsCardList, BsTable } from 'react-icons/bs'
import type { DisplayType } from '../../hooks/useDisplayType'
import { AppButton } from './AppButton'

type Props = {
  label: string
  tableLabel: string
  cardsLabel: string
  value: DisplayType
  onChange: (value: DisplayType) => void
}

export function DisplayTypeToggle({
  label,
  tableLabel,
  cardsLabel,
  value,
  onChange,
}: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      <span className="px-2 text-xs font-semibold text-gray-600">{label}</span>
      <AppButton
        size="sm"
        variant={value === 'TABLE' ? 'primary' : 'secondary'}
        aria-pressed={value === 'TABLE'}
        onClick={() => onChange('TABLE')}
      >
        <BsTable className="mr-1" aria-hidden="true" />
        {tableLabel}
      </AppButton>
      <AppButton
        size="sm"
        variant={value === 'CARDS' ? 'primary' : 'secondary'}
        aria-pressed={value === 'CARDS'}
        onClick={() => onChange('CARDS')}
      >
        <BsCardList className="mr-1" aria-hidden="true" />
        {cardsLabel}
      </AppButton>
    </div>
  )
}
