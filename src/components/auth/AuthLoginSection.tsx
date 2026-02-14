import { Button, Col, Form, Row } from 'react-bootstrap'
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
      <Row className="g-2">
        <Col md={4}>
          <Form.Label htmlFor="auth-email-input" className="small mb-1">
            {t('app.authEmailLabel')}
          </Form.Label>
          <Form.Control
            id="auth-email-input"
            data-testid="auth-email-input"
            value={authEmailInput}
            type="email"
            onChange={(event) => setAuthEmailInput(event.target.value)}
            autoComplete="username"
            disabled={authLoading}
          />
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="auth-password-input" className="small mb-1">
            {t('app.authPasswordLabel')}
          </Form.Label>
          <Form.Control
            id="auth-password-input"
            data-testid="auth-password-input"
            value={authPasswordInput}
            type="password"
            onChange={(event) => setAuthPasswordInput(event.target.value)}
            autoComplete="current-password"
            disabled={authLoading}
          />
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="auth-otp-input" className="small mb-1">
            {t('app.authOtpLabel')}
          </Form.Label>
          <Form.Control
            id="auth-otp-input"
            data-testid="auth-otp-input"
            value={authOtpInput}
            type="text"
            inputMode="numeric"
            onChange={(event) => setAuthOtpInput(event.target.value)}
            placeholder={authRequiresOtp ? t('app.authOtpRequiredPlaceholder') : t('app.authOtpOptionalPlaceholder')}
            disabled={authLoading}
          />
        </Col>
      </Row>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <Button
          type="button"
          size="sm"
          variant="primary"
          data-testid="auth-login"
          disabled={authLoading}
          onClick={() => void onLogin()}
        >
          {authLoading ? t('app.authLoggingIn') : t('app.authLogin')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="link"
          data-testid="auth-lost-password-toggle"
          onClick={onToggleLostPasswordMode}
        >
          {t('app.authLostPasswordLink')}
        </Button>
      </div>
    </>
  )
}
