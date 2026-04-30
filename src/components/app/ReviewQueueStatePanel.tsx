import type { ReactNode } from 'react'
import {
  BsArrowRepeat,
  BsCheck2Circle,
  BsClipboardCheck,
  BsExclamationTriangle,
  BsHourglassSplit,
  BsInbox,
  BsXCircle,
} from 'react-icons/bs'

export type ReviewQueueStateGroup = {
  key: 'qualificationBlocked' | 'decisionPending' | 'decidedKeep' | 'decidedReject'
  assets: Array<{
    id: string
    name: string
  }>
}

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  groups: ReviewQueueStateGroup[]
  onOpenAsset: (assetId: string) => void
}

function resolveGroupPresentation(
  key: ReviewQueueStateGroup['key'],
  t: Props['t'],
): { title: string; emptyLabel: string; toneClassName: string; icon: ReactNode } {
  if (key === 'qualificationBlocked') {
    return {
      title: t('todo.blockedTitle'),
      emptyLabel: t('todo.blockedEmpty'),
      toneClassName: 'border-blue-200 bg-blue-50',
      icon: <BsArrowRepeat className="mr-1 inline-block text-blue-600" aria-hidden="true" />,
    }
  }
  if (key === 'decisionPending') {
    return {
      title: t('todo.pendingTitle'),
      emptyLabel: t('todo.pendingEmpty'),
      toneClassName: 'border-warning-200 bg-warning-50',
      icon: <BsHourglassSplit className="mr-1 inline-block text-warning-600" aria-hidden="true" />,
    }
  }
  if (key === 'decidedKeep') {
    return {
      title: t('todo.keepTitle'),
      emptyLabel: t('todo.keepEmpty'),
      toneClassName: 'border-success-200 bg-success-50',
      icon: <BsCheck2Circle className="mr-1 inline-block text-success-600" aria-hidden="true" />,
    }
  }
  return {
    title: t('todo.rejectTitle'),
    emptyLabel: t('todo.rejectEmpty'),
    toneClassName: 'border-danger-200 bg-danger-50',
    icon: <BsXCircle className="mr-1 inline-block text-danger-600" aria-hidden="true" />,
  }
}

function AssetMiniList({
  title,
  emptyLabel,
  assets,
  onOpenAsset,
  icon,
  toneClassName,
}: {
  title: string
  emptyLabel: string
  assets: ReviewQueueStateGroup['assets']
  onOpenAsset: (assetId: string) => void
  icon: ReactNode
  toneClassName: string
}) {
  return (
    <section className={`rounded-lg border p-3 ${toneClassName}`}>
      <h3 className="mb-2 text-base font-semibold text-gray-900">
        {icon}
        {title}
      </h3>
      {assets.length === 0 ? (
        <p className="mb-0 text-sm text-gray-500">
          <BsInbox className="mr-1 inline-block" aria-hidden="true" />
          {emptyLabel}
        </p>
      ) : (
        <ul className="mb-0 space-y-1">
          {assets.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                className="inline-flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm text-gray-700 transition-colors hover:bg-white"
                onClick={() => onOpenAsset(asset.id)}
              >
                <span className="font-medium">{asset.name}</span>
                <span className="text-xs text-gray-500">{asset.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ReviewQueueStatePanel({ t, groups, onOpenAsset }: Props) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('todo.region')}>
      <h2 className="mb-1 text-lg font-semibold text-gray-900">
        <BsClipboardCheck className="mr-2 inline-block" aria-hidden="true" />
        {t('todo.title')}
      </h2>
      <p className="mb-3 text-sm text-gray-600">
        <BsExclamationTriangle className="mr-1 inline-block text-warning-600" aria-hidden="true" />
        {t('todo.body')}
      </p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {groups.map((group) => {
          const presentation = resolveGroupPresentation(group.key, t)
          return (
            <AssetMiniList
              key={group.key}
              title={`${presentation.title} (${group.assets.length})`}
              emptyLabel={presentation.emptyLabel}
              assets={group.assets}
              onOpenAsset={onOpenAsset}
              icon={presentation.icon}
              toneClassName={presentation.toneClassName}
            />
          )
        })}
      </div>
    </section>
  )
}
