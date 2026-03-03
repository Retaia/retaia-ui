import type { ReactNode } from 'react'
import { BsCheck2Circle, BsClipboardCheck, BsHourglassSplit, BsInbox } from 'react-icons/bs'
import type { Asset } from '../../domain/assets'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  todoAssets: Asset[]
  doneAssets: Asset[]
  onOpenAsset: (assetId: string) => void
}

function AssetMiniList({
  title,
  emptyLabel,
  assets,
  onOpenAsset,
  icon,
}: {
  title: string
  emptyLabel: string
  assets: Asset[]
  onOpenAsset: (assetId: string) => void
  icon: ReactNode
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-3">
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

export function ReviewTodoDonePanel({ t, todoAssets, doneAssets, onOpenAsset }: Props) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('todo.region')}>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        <BsClipboardCheck className="mr-2 inline-block" aria-hidden="true" />
        {t('todo.title')}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AssetMiniList
          title={t('todo.todoTitle', { count: todoAssets.length })}
          emptyLabel={t('todo.todoEmpty')}
          assets={todoAssets}
          onOpenAsset={onOpenAsset}
          icon={<BsHourglassSplit className="mr-1 inline-block text-warning-500" aria-hidden="true" />}
        />
        <AssetMiniList
          title={t('todo.doneTitle', { count: doneAssets.length })}
          emptyLabel={t('todo.doneEmpty')}
          assets={doneAssets}
          onOpenAsset={onOpenAsset}
          icon={<BsCheck2Circle className="mr-1 inline-block text-success-600" aria-hidden="true" />}
        />
      </div>
    </section>
  )
}
