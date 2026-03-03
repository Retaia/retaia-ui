import type { TFunction } from 'i18next'

type AuthLostPasswordSectionProps = {
  t: TFunction
  mode: 'request' | 'reset'
  setMode: (mode: 'request' | 'reset') => void
  emailInput: string
  setEmailInput: (value: string) => void
  tokenInput: string
  setTokenInput: (value: string) => void
  newPasswordInput: string
  setNewPasswordInput: (value: string) => void
  loading: boolean
  status: { kind: 'success' | 'error'; message: string } | null
  onRequest: () => Promise<void>
  onReset: () => Promise<void>
}

export function AuthLostPasswordSection({
  t,
  mode,
  setMode,
  emailInput,
  setEmailInput,
  tokenInput,
  setTokenInput,
  newPasswordInput,
  setNewPasswordInput,
  loading,
  status,
  onRequest,
  onReset,
}: AuthLostPasswordSectionProps) {
  const modeButtonClass = (active: boolean) =>
    [
      'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
      active ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-500 bg-white text-brand-600 hover:bg-brand-50',
    ].join(' ')

  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-3" aria-label={t('app.authLostPasswordTitle')}>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('app.authLostPasswordTitle')}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          className={modeButtonClass(mode === 'request')}
          data-testid="auth-lost-password-mode-request"
          onClick={() => setMode('request')}
        >
          {t('app.authLostPasswordModeRequest')}
        </button>
        <button
          type="button"
          className={modeButtonClass(mode === 'reset')}
          data-testid="auth-lost-password-mode-reset"
          onClick={() => setMode('reset')}
        >
          {t('app.authLostPasswordModeReset')}
        </button>
      </div>
      {mode === 'request' ? (
        <>
          <label htmlFor="auth-lost-password-email-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authEmailLabel')}
          </label>
          <input
            id="auth-lost-password-email-input"
            data-testid="auth-lost-password-email-input"
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="auth-lost-password-request"
              disabled={loading}
              onClick={() => void onRequest()}
            >
              {t('app.authLostPasswordModeRequest')}
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="auth-lost-password-token-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authLostPasswordTokenLabel')}
          </label>
          <input
            id="auth-lost-password-token-input"
            data-testid="auth-lost-password-token-input"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <label htmlFor="auth-lost-password-new-password-input" className="mb-1 mt-2 inline-block text-xs font-medium text-gray-700">
            {t('app.authLostPasswordNewPasswordLabel')}
          </label>
          <input
            id="auth-lost-password-new-password-input"
            data-testid="auth-lost-password-new-password-input"
            type="password"
            value={newPasswordInput}
            onChange={(event) => setNewPasswordInput(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="auth-lost-password-reset"
              disabled={loading}
              onClick={() => void onReset()}
            >
              {t('app.authLostPasswordModeReset')}
            </button>
          </div>
        </>
      )}
      {status ? (
        <p className={`text-xs mt-2 mb-0 ${status.kind === 'success' ? 'text-success-700' : 'text-error-700'}`} data-testid="auth-lost-password-status">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
