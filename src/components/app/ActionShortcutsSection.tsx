import { useState } from 'react'
import { BsKeyboard } from 'react-icons/bs'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
}

export function ActionShortcutsSection({ t }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            <BsKeyboard className="mr-2 inline-block" aria-hidden="true" />
            {t('actions.shortcutsTitle')}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t('actions.shortcuts')}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          data-testid="shortcuts-toggle"
        >
          {isOpen ? t('actions.shortcutsToggleHide') : t('actions.shortcutsToggleShow')}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3" data-testid="shortcuts-panel">
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('actions.shortcutsNavTitle')}
            </p>
            <p className="mb-0 text-sm text-gray-700 dark:text-gray-200">{t('actions.shortcutsNavList')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('actions.shortcutsBatchTitle')}
            </p>
            <p className="mb-0 text-sm text-gray-700 dark:text-gray-200">{t('actions.shortcutsBatchList')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('actions.shortcutsFlowTitle')}
            </p>
            <p className="mb-0 text-sm text-gray-700 dark:text-gray-200">{t('actions.shortcutsFlowList')}</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
