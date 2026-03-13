import type { TFunction } from 'i18next'

type AuthLoginSectionProps = {
  t: TFunction
  authLoading: boolean
  authEmailInput: string
  setAuthEmailInput: (value: string) => void
  authPasswordInput: string
  setAuthPasswordInput: (value: string) => void
  authOtpInput: string
  setAuthOtpInput: (value: string) => void
  authRequiresOtp: boolean
  onLogin: () => Promise<void>
  onToggleLostPasswordMode: () => void
}

export function AuthLoginSection({
  t,
  authLoading,
  authEmailInput,
  setAuthEmailInput,
  authPasswordInput,
  setAuthPasswordInput,
  authOtpInput,
  setAuthOtpInput,
  authRequiresOtp,
  onLogin,
  onToggleLostPasswordMode,
}: AuthLoginSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div>
          <label htmlFor="auth-email-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authEmailLabel')}
          </label>
          <input
            id="auth-email-input"
            data-testid="auth-email-input"
            value={authEmailInput}
            type="email"
            onChange={(event) => setAuthEmailInput(event.target.value)}
            autoComplete="username"
            disabled={authLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="auth-password-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authPasswordLabel')}
          </label>
          <input
            id="auth-password-input"
            data-testid="auth-password-input"
            value={authPasswordInput}
            type="password"
            onChange={(event) => setAuthPasswordInput(event.target.value)}
            autoComplete="current-password"
            disabled={authLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="auth-otp-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.authOtpLabel')}
          </label>
          <input
            id="auth-otp-input"
            data-testid="auth-otp-input"
            value={authOtpInput}
            type="text"
            inputMode="numeric"
            onChange={(event) => setAuthOtpInput(event.target.value)}
            placeholder={authRequiresOtp ? t('app.authOtpRequiredPlaceholder') : t('app.authOtpOptionalPlaceholder')}
            disabled={authLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="auth-login"
          disabled={authLoading}
          onClick={() => void onLogin()}
        >
          {authLoading ? t('app.authLoggingIn') : t('app.authLogin')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center px-1 py-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
          data-testid="auth-lost-password-toggle"
          onClick={onToggleLostPasswordMode}
        >
          {t('app.authLostPasswordLink')}
        </button>
      </div>
    </>
  )
}
