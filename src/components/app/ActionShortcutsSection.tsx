import {
  BsArrowRightCircle,
  BsClockHistory,
  BsEye,
  BsEyeSlash,
  BsKeyboard,
  BsPinAngle,
} from 'react-icons/bs'

type Props = {
  t: (key: string, values?: Record<string, string | number>) => string
  showShortcutsHelp: boolean
  onToggleShortcutsHelp: () => void
  onFocusPending: () => void
  onToggleBatchOnly: () => void
  onOpenNextPending: () => void
}

export function ActionShortcutsSection({
  t,
  showShortcutsHelp,
  onToggleShortcutsHelp,
  onFocusPending,
  onToggleBatchOnly,
  onOpenNextPending,
}: Props) {
  const buttonClass =
    'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100'
  const outlinePrimaryButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50'

  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="mb-0 text-base font-semibold text-gray-900">
          <BsKeyboard className="mr-1 inline-block" aria-hidden="true" />
          {t('actions.shortcutsTitle')}
        </h3>
        <button type="button" className={buttonClass} onClick={onToggleShortcutsHelp}>
          {showShortcutsHelp ? (
            <BsEyeSlash className="mr-1" aria-hidden="true" />
          ) : (
            <BsEye className="mr-1" aria-hidden="true" />
          )}
          {showShortcutsHelp ? t('actions.shortcutsToggleHide') : t('actions.shortcutsToggleShow')}
        </button>
      </div>
      {showShortcutsHelp ? (
        <section data-testid="shortcuts-overlay" className="mt-3 rounded border border-gray-300 p-3">
          <p className="text-xs text-gray-500 mb-2">{t('actions.shortcuts')}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('actions.shortcutsNavTitle')}</h4>
              <ul className="mb-0 text-xs text-gray-700">
                <li>{t('actions.shortcutsNavList')}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('actions.shortcutsBatchTitle')}</h4>
              <ul className="mb-0 text-xs text-gray-700">
                <li>{t('actions.shortcutsBatchList')}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('actions.shortcutsFlowTitle')}</h4>
              <ul className="mb-0 text-xs text-gray-700">
                <li>{t('actions.shortcutsFlowList')}</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={outlinePrimaryButtonClass} onClick={onFocusPending}>
              <BsClockHistory className="mr-1" aria-hidden="true" />
              {t('actions.shortcutsActionPending')}
            </button>
            <button type="button" className={outlinePrimaryButtonClass} onClick={onToggleBatchOnly}>
              <BsPinAngle className="mr-1" aria-hidden="true" />
              {t('actions.shortcutsActionBatch')}
            </button>
            <button type="button" className={outlinePrimaryButtonClass} onClick={onOpenNextPending}>
              <BsArrowRightCircle className="mr-1" aria-hidden="true" />
              {t('actions.shortcutsActionNext')}
            </button>
          </div>
        </section>
      ) : null}
    </section>
  )
}
