import { Button, Form } from 'react-bootstrap'
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
  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authLostPasswordTitle')}>
      <h4 className="h6 mb-2">{t('app.authLostPasswordTitle')}</h4>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'request' ? 'primary' : 'outline-primary'}
          data-testid="auth-lost-password-mode-request"
          onClick={() => setMode('request')}
        >
          {t('app.authLostPasswordModeRequest')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'reset' ? 'primary' : 'outline-primary'}
          data-testid="auth-lost-password-mode-reset"
          onClick={() => setMode('reset')}
        >
          {t('app.authLostPasswordModeReset')}
        </Button>
      </div>
      {mode === 'request' ? (
        <>
          <Form.Label htmlFor="auth-lost-password-email-input" className="small mb-1">
            {t('app.authEmailLabel')}
          </Form.Label>
          <Form.Control
            id="auth-lost-password-email-input"
            data-testid="auth-lost-password-email-input"
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
              data-testid="auth-lost-password-request"
              disabled={loading}
              onClick={() => void onRequest()}
            >
              {t('app.authLostPasswordModeRequest')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Form.Label htmlFor="auth-lost-password-token-input" className="small mb-1">
            {t('app.authLostPasswordTokenLabel')}
          </Form.Label>
          <Form.Control
            id="auth-lost-password-token-input"
            data-testid="auth-lost-password-token-input"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            disabled={loading}
          />
          <Form.Label htmlFor="auth-lost-password-new-password-input" className="small mb-1 mt-2">
            {t('app.authLostPasswordNewPasswordLabel')}
          </Form.Label>
          <Form.Control
            id="auth-lost-password-new-password-input"
            data-testid="auth-lost-password-new-password-input"
            type="password"
            value={newPasswordInput}
            onChange={(event) => setNewPasswordInput(event.target.value)}
            disabled={loading}
          />
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              data-testid="auth-lost-password-reset"
              disabled={loading}
              onClick={() => void onReset()}
            >
              {t('app.authLostPasswordModeReset')}
            </Button>
          </div>
        </>
      )}
      {status ? (
        <p className={`small mt-2 mb-0 ${status.kind === 'success' ? 'text-success' : 'text-danger'}`} data-testid="auth-lost-password-status">
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
