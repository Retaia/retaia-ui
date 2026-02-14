import { Button, Form } from 'react-bootstrap'
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
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authVerifyEmailTitle')}>
      <h4 className="h6 mb-2">{t('app.authVerifyEmailTitle')}</h4>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'request' ? 'primary' : 'outline-primary'}
          data-testid="auth-verify-email-mode-request"
          onClick={() => setMode('request')}
        >
          {t('app.authVerifyEmailModeRequest')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'confirm' ? 'primary' : 'outline-primary'}
          data-testid="auth-verify-email-mode-confirm"
          onClick={() => setMode('confirm')}
        >
          {t('app.authVerifyEmailModeConfirm')}
        </Button>
        {authUserIsAdmin ? (
          <Button
            type="button"
            size="sm"
            variant={mode === 'admin' ? 'primary' : 'outline-primary'}
            data-testid="auth-verify-email-mode-admin"
            onClick={() => setMode('admin')}
          >
            {t('app.authVerifyEmailModeAdmin')}
          </Button>
        ) : null}
      </div>
      {mode === 'confirm' ? (
        <>
          <Form.Label htmlFor="auth-verify-email-token-input" className="small mb-1">
            {t('app.authVerifyEmailTokenLabel')}
          </Form.Label>
          <Form.Control
            id="auth-verify-email-token-input"
            data-testid="auth-verify-email-token-input"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            disabled={loading}
          />
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              data-testid="auth-verify-email-confirm"
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {t('app.authVerifyEmailModeConfirm')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Form.Label htmlFor="auth-verify-email-input" className="small mb-1">
            {t('app.authEmailLabel')}
          </Form.Label>
          <Form.Control
            id="auth-verify-email-input"
            data-testid="auth-verify-email-input"
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            disabled={loading}
          />
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              data-testid={mode === 'admin' ? 'auth-verify-email-admin-confirm' : 'auth-verify-email-request'}
              disabled={loading || (mode === 'admin' && !authUserIsAdmin)}
              onClick={() => (mode === 'admin' ? void onAdminConfirm() : void onRequest())}
            >
              {mode === 'admin' ? t('app.authVerifyEmailModeAdmin') : t('app.authVerifyEmailModeRequest')}
            </Button>
          </div>
        </>
      )}
      {status ? (
        <p className={`small mt-2 mb-0 ${status.kind === 'success' ? 'text-success' : 'text-danger'}`} data-testid="auth-verify-email-status">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
