import { Button, Col, Form, Row } from 'react-bootstrap'
import type { TFunction } from 'i18next'
import type { useAuthPageController } from '../../hooks/useAuthPageController'

type AuthAccountSectionProps = {
  t: TFunction
  controller: ReturnType<typeof useAuthPageController>
}

export function AuthAccountSection({ t, controller }: AuthAccountSectionProps) {
  const {
    authUser,
    isApiAuthLockedByEnv,
    authLoading,
    authEmailInput,
    setAuthEmailInput,
    authPasswordInput,
    setAuthPasswordInput,
    authOtpInput,
    setAuthOtpInput,
    authRequiresOtp,
    handleLogin,
    handleLogout,
    lostPasswordMode,
    setLostPasswordMode,
    lostPasswordEmailInput,
    setLostPasswordEmailInput,
    lostPasswordTokenInput,
    setLostPasswordTokenInput,
    lostPasswordNewPasswordInput,
    setLostPasswordNewPasswordInput,
    lostPasswordLoading,
    lostPasswordStatus,
    handleLostPasswordRequest,
    handleLostPasswordReset,
    verifyEmailMode,
    setVerifyEmailMode,
    verifyEmailInput,
    setVerifyEmailInput,
    verifyEmailTokenInput,
    setVerifyEmailTokenInput,
    verifyEmailLoading,
    verifyEmailStatus,
    handleVerifyEmailRequest,
    handleVerifyEmailConfirm,
    handleVerifyEmailAdminConfirm,
    appMfaFeatureKey,
    appMfaFeatureEnabled,
    appFeatureBusy,
    appFeatureStatus,
    setAppFeature,
    mfaFeatureKey,
    mfaFeatureAvailable,
    mfaFeatureUserCanDisable,
    mfaFeatureUserEnabled,
    setUserFeature,
    authMfaBusy,
    startMfaSetup,
    authMfaSetup,
    authMfaOtpAction,
    setAuthMfaOtpAction,
    enableMfa,
    disableMfa,
    authMfaStatus,
    authStatus,
  } = controller

  return (
    <section className="border border-2 border-secondary-subtle rounded p-3 mb-3" aria-label={t('app.authTitle')}>
      <h3 className="h6 mb-2">{t('app.authTitle')}</h3>
      {authUser ? (
        <p className="small mb-2 text-secondary" data-testid="auth-user-status">
          {t('app.authSignedInAs', {
            identity: authUser.displayName ?? authUser.email,
          })}
          {authUser.mfaEnabled ? ` · ${t('app.authMfaEnabled')}` : ''}
        </p>
      ) : (
        <p className="small mb-2 text-secondary" data-testid="auth-user-status">
          {t('app.authSignedOut')}
        </p>
      )}
      {!isApiAuthLockedByEnv && !authUser ? (
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
              onClick={() => void handleLogin()}
            >
              {authLoading ? t('app.authLoggingIn') : t('app.authLogin')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="link"
              data-testid="auth-lost-password-toggle"
              onClick={() => setLostPasswordMode((current) => (current === 'request' ? 'reset' : 'request'))}
            >
              {t('app.authLostPasswordLink')}
            </Button>
          </div>
        </>
      ) : null}
      {authUser && !isApiAuthLockedByEnv ? (
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            data-testid="auth-logout"
            disabled={authLoading}
            onClick={() => void handleLogout()}
          >
            {t('app.authLogout')}
          </Button>
        </div>
      ) : null}
      {isApiAuthLockedByEnv ? (
        <p className="small text-secondary mb-0">{t('app.authEnvLocked')}</p>
      ) : null}
      {authStatus ? (
        <p
          className={`small mt-2 mb-0 ${authStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
          data-testid="auth-status"
          role="status"
          aria-live="polite"
        >
          {authStatus.message}
        </p>
      ) : null}
      {!authUser ? (
        <section
          className="border border-2 border-secondary-subtle rounded p-3 mt-3"
          aria-label={t('app.authLostPasswordTitle')}
        >
          <h4 className="h6 mb-2">{t('app.authLostPasswordTitle')}</h4>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Button
              type="button"
              size="sm"
              variant={lostPasswordMode === 'request' ? 'primary' : 'outline-primary'}
              data-testid="auth-lost-password-mode-request"
              onClick={() => setLostPasswordMode('request')}
            >
              {t('app.authLostPasswordModeRequest')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={lostPasswordMode === 'reset' ? 'primary' : 'outline-primary'}
              data-testid="auth-lost-password-mode-reset"
              onClick={() => setLostPasswordMode('reset')}
            >
              {t('app.authLostPasswordModeReset')}
            </Button>
          </div>
          {lostPasswordMode === 'request' ? (
            <>
              <Form.Label htmlFor="auth-lost-password-email-input" className="small mb-1">
                {t('app.authEmailLabel')}
              </Form.Label>
              <Form.Control
                id="auth-lost-password-email-input"
                data-testid="auth-lost-password-email-input"
                type="email"
                value={lostPasswordEmailInput}
                onChange={(event) => setLostPasswordEmailInput(event.target.value)}
                disabled={lostPasswordLoading}
              />
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline-primary"
                  data-testid="auth-lost-password-request"
                  disabled={lostPasswordLoading}
                  onClick={() => void handleLostPasswordRequest()}
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
                value={lostPasswordTokenInput}
                onChange={(event) => setLostPasswordTokenInput(event.target.value)}
                disabled={lostPasswordLoading}
              />
              <Form.Label htmlFor="auth-lost-password-new-password-input" className="small mb-1 mt-2">
                {t('app.authLostPasswordNewPasswordLabel')}
              </Form.Label>
              <Form.Control
                id="auth-lost-password-new-password-input"
                data-testid="auth-lost-password-new-password-input"
                type="password"
                value={lostPasswordNewPasswordInput}
                onChange={(event) => setLostPasswordNewPasswordInput(event.target.value)}
                disabled={lostPasswordLoading}
              />
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline-primary"
                  data-testid="auth-lost-password-reset"
                  disabled={lostPasswordLoading}
                  onClick={() => void handleLostPasswordReset()}
                >
                  {t('app.authLostPasswordModeReset')}
                </Button>
              </div>
            </>
          )}
          {lostPasswordStatus ? (
            <p
              className={`small mt-2 mb-0 ${lostPasswordStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
              data-testid="auth-lost-password-status"
            >
              {lostPasswordStatus.message}
            </p>
          ) : null}
        </section>
      ) : null}
      <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authVerifyEmailTitle')}>
        <h4 className="h6 mb-2">{t('app.authVerifyEmailTitle')}</h4>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <Button
            type="button"
            size="sm"
            variant={verifyEmailMode === 'request' ? 'primary' : 'outline-primary'}
            data-testid="auth-verify-email-mode-request"
            onClick={() => setVerifyEmailMode('request')}
          >
            {t('app.authVerifyEmailModeRequest')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={verifyEmailMode === 'confirm' ? 'primary' : 'outline-primary'}
            data-testid="auth-verify-email-mode-confirm"
            onClick={() => setVerifyEmailMode('confirm')}
          >
            {t('app.authVerifyEmailModeConfirm')}
          </Button>
          {authUser?.isAdmin ? (
            <Button
              type="button"
              size="sm"
              variant={verifyEmailMode === 'admin' ? 'primary' : 'outline-primary'}
              data-testid="auth-verify-email-mode-admin"
              onClick={() => setVerifyEmailMode('admin')}
            >
              {t('app.authVerifyEmailModeAdmin')}
            </Button>
          ) : null}
        </div>
        {verifyEmailMode === 'confirm' ? (
          <>
            <Form.Label htmlFor="auth-verify-email-token-input" className="small mb-1">
              {t('app.authVerifyEmailTokenLabel')}
            </Form.Label>
            <Form.Control
              id="auth-verify-email-token-input"
              data-testid="auth-verify-email-token-input"
              type="text"
              value={verifyEmailTokenInput}
              onChange={(event) => setVerifyEmailTokenInput(event.target.value)}
              disabled={verifyEmailLoading}
            />
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline-primary"
                data-testid="auth-verify-email-confirm"
                disabled={verifyEmailLoading}
                onClick={() => void handleVerifyEmailConfirm()}
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
              value={verifyEmailInput}
              onChange={(event) => setVerifyEmailInput(event.target.value)}
              disabled={verifyEmailLoading}
            />
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline-primary"
                data-testid={verifyEmailMode === 'admin' ? 'auth-verify-email-admin-confirm' : 'auth-verify-email-request'}
                disabled={verifyEmailLoading || (verifyEmailMode === 'admin' && !authUser?.isAdmin)}
                onClick={() =>
                  verifyEmailMode === 'admin' ? void handleVerifyEmailAdminConfirm() : void handleVerifyEmailRequest()
                }
              >
                {verifyEmailMode === 'admin' ? t('app.authVerifyEmailModeAdmin') : t('app.authVerifyEmailModeRequest')}
              </Button>
            </div>
          </>
        )}
        {verifyEmailStatus ? (
          <p
            className={`small mt-2 mb-0 ${verifyEmailStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
            data-testid="auth-verify-email-status"
          >
            {verifyEmailStatus.message}
          </p>
        ) : null}
      </section>
      {authUser?.isAdmin && appMfaFeatureKey ? (
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authAppFeatureTitle')}>
          <h4 className="h6 mb-2">{t('app.authAppFeatureTitle')}</h4>
          <p className="small text-secondary mb-2" data-testid="auth-app-feature-state">
            {appMfaFeatureEnabled ? t('app.authAppFeatureStateOn') : t('app.authAppFeatureStateOff')}
          </p>
          <Button
            type="button"
            size="sm"
            variant={appMfaFeatureEnabled ? 'outline-danger' : 'outline-primary'}
            data-testid="auth-app-feature-toggle"
            disabled={appFeatureBusy}
            onClick={() => void setAppFeature(!appMfaFeatureEnabled)}
          >
            {appMfaFeatureEnabled ? t('app.authAppFeatureDisable') : t('app.authAppFeatureEnable')}
          </Button>
          {appFeatureStatus ? (
            <p
              className={`small mt-2 mb-0 ${appFeatureStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
              data-testid="auth-app-feature-status"
              role="status"
              aria-live="polite"
            >
              {appFeatureStatus.message}
            </p>
          ) : null}
        </section>
      ) : null}
      {authUser && mfaFeatureKey ? (
        <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('app.authMfaTitle')}>
          <h4 className="h6 mb-2">{t('app.authMfaTitle')}</h4>
          {!mfaFeatureAvailable ? (
            <p className="small text-secondary mb-0" data-testid="auth-mfa-feature-disabled">
              {t('app.authMfaFeatureUnavailable')}
            </p>
          ) : (
            <>
              <p className="small text-secondary mb-2" data-testid="auth-mfa-state">
                {authUser.mfaEnabled ? t('app.authMfaStateOn') : t('app.authMfaStateOff')}
              </p>
              {mfaFeatureUserCanDisable ? (
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={mfaFeatureUserEnabled ? 'outline-secondary' : 'outline-primary'}
                    data-testid="auth-mfa-user-toggle"
                    disabled={authMfaBusy}
                    onClick={() => void setUserFeature(!mfaFeatureUserEnabled)}
                  >
                    {mfaFeatureUserEnabled ? t('app.authMfaFeatureOptOut') : t('app.authMfaFeatureOptIn')}
                  </Button>
                </div>
              ) : null}
              {mfaFeatureUserEnabled ? (
                <>
                  {!authUser.mfaEnabled ? (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        data-testid="auth-mfa-setup"
                        disabled={authMfaBusy}
                        onClick={() => void startMfaSetup()}
                      >
                        {t('app.authMfaSetup')}
                      </Button>
                    </div>
                  ) : null}
                  {authMfaSetup ? (
                    <div className="small text-secondary mb-2" data-testid="auth-mfa-setup-material">
                      <div>
                        {t('app.authMfaSecretLabel')}: {authMfaSetup.secret}
                      </div>
                      <div>
                        {t('app.authMfaUriLabel')}: {authMfaSetup.otpauthUri}
                      </div>
                    </div>
                  ) : null}
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <Form.Label htmlFor="auth-mfa-otp-action-input" className="small mb-1">
                        {t('app.authOtpLabel')}
                      </Form.Label>
                      <Form.Control
                        id="auth-mfa-otp-action-input"
                        data-testid="auth-mfa-otp-action-input"
                        value={authMfaOtpAction}
                        type="text"
                        inputMode="numeric"
                        onChange={(event) => setAuthMfaOtpAction(event.target.value)}
                        disabled={authMfaBusy}
                      />
                    </div>
                    {!authUser.mfaEnabled ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        data-testid="auth-mfa-enable"
                        disabled={authMfaBusy}
                        onClick={() => void enableMfa()}
                      >
                        {t('app.authMfaEnable')}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        data-testid="auth-mfa-disable"
                        disabled={authMfaBusy}
                        onClick={() => void disableMfa()}
                      >
                        {t('app.authMfaDisable')}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <p className="small text-secondary mb-0" data-testid="auth-mfa-user-disabled">
                  {t('app.authMfaFeatureUserDisabled')}
                </p>
              )}
            </>
          )}
          {authMfaStatus ? (
            <p
              className={`small mt-2 mb-0 ${authMfaStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
              data-testid="auth-mfa-status"
              role="status"
              aria-live="polite"
            >
              {authMfaStatus.message}
            </p>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
