import type { TFunction } from 'i18next'

type AuthVerifyEmailSectionProps = {
  t: TFunction
  mode: 'request' | 'confirm' | 'admin'
  setMode: (mode: 'request' | 'confirm' | 'admin') => void
  authUserIsAdmin: boolean
  emailInput: string
  setEmailInput: (value: string) => void
  tokenInput: string
  setTokenInput: (value: string) => void
  loading: boolean
  status: { kind: 'success' | 'error'; message: string } | null
  onRequest: () => Promise<void>
  onConfirm: () => Promise<void>
  onAdminConfirm: () => Promise<void>
}

export function AuthVerifyEmailSection({
  t,
  mode,
  setMode,
  authUserIsAdmin,
  emailInput,
  setEmailInput,
  tokenInput,
  setTokenInput,
  loading,
  status,
  onRequest,
  onConfirm,
  onAdminConfirm,
}: AuthVerifyEmailSectionProps) {
  const modeButtonClass = (active: boolean) =>
    [
      'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
      active ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-500 bg-white text-brand-600 hover:bg-brand-50',
    ].join(' ')

  return (
    <section className="border border-2 border-gray-200 rounded p-3 mt-3" aria-label={t('app.authVerifyEmailTitle')}>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{t('app.authVerifyEmailTitle')}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          className={modeButtonClass(mode === 'request')}
          data-testid="auth-verify-email-mode-request"
          onClick={() => setMode('request')}
        >
          {t('app.authVerifyEmailModeRequest')}
        </button>
        <button
          type="button"
          className={modeButtonClass(mode === 'confirm')}
          data-testid="auth-verify-email-mode-confirm"
          onClick={() => setMode('confirm')}
        >
          {t('app.authVerifyEmailModeConfirm')}
        </button>
        {authUserIsAdmin ? (
          <button
            type="button"
            className={modeButtonClass(mode === 'admin')}
            data-testid="auth-verify-email-mode-admin"
            onClick={() => setMode('admin')}
          >
            {t('app.authVerifyEmailModeAdmin')}
          </button>
        ) : null}
      </div>
      {mode === 'confirm' ? (
        <>
          <label htmlFor="auth-verify-email-token-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authVerifyEmailTokenLabel')}
          </label>
          <input
            id="auth-verify-email-token-input"
            data-testid="auth-verify-email-token-input"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="auth-verify-email-confirm"
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {t('app.authVerifyEmailModeConfirm')}
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="auth-verify-email-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authEmailLabel')}
          </label>
          <input
            id="auth-verify-email-input"
            data-testid="auth-verify-email-input"
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
              data-testid={mode === 'admin' ? 'auth-verify-email-admin-confirm' : 'auth-verify-email-request'}
              disabled={loading || (mode === 'admin' && !authUserIsAdmin)}
              onClick={() => (mode === 'admin' ? void onAdminConfirm() : void onRequest())}
            >
              {mode === 'admin' ? t('app.authVerifyEmailModeAdmin') : t('app.authVerifyEmailModeRequest')}
            </button>
          </div>
        </>
      )}
      {status ? (
        <p className={`text-xs mt-2 mb-0 ${status.kind === 'success' ? 'text-success-700' : 'text-error-700'}`} data-testid="auth-verify-email-status">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
