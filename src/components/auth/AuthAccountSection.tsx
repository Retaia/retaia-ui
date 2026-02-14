import { Button } from 'react-bootstrap'
import type { TFunction } from 'i18next'
import type { useAuthPageController } from '../../hooks/useAuthPageController'
import { AuthAppFeatureSection } from './AuthAppFeatureSection'
import { AuthLoginSection } from './AuthLoginSection'
import { AuthLostPasswordSection } from './AuthLostPasswordSection'
import { AuthMfaSection } from './AuthMfaSection'
import { AuthVerifyEmailSection } from './AuthVerifyEmailSection'

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
        <AuthLoginSection
          t={t}
          authLoading={authLoading}
          authEmailInput={authEmailInput}
          setAuthEmailInput={setAuthEmailInput}
          authPasswordInput={authPasswordInput}
          setAuthPasswordInput={setAuthPasswordInput}
          authOtpInput={authOtpInput}
          setAuthOtpInput={setAuthOtpInput}
          authRequiresOtp={authRequiresOtp}
          onLogin={handleLogin}
          onToggleLostPasswordMode={() =>
            setLostPasswordMode((current) => (current === 'request' ? 'reset' : 'request'))
          }
        />
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

      {isApiAuthLockedByEnv ? <p className="small text-secondary mb-0">{t('app.authEnvLocked')}</p> : null}
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
        <AuthLostPasswordSection
          t={t}
          mode={lostPasswordMode}
          setMode={setLostPasswordMode}
          emailInput={lostPasswordEmailInput}
          setEmailInput={setLostPasswordEmailInput}
          tokenInput={lostPasswordTokenInput}
          setTokenInput={setLostPasswordTokenInput}
          newPasswordInput={lostPasswordNewPasswordInput}
          setNewPasswordInput={setLostPasswordNewPasswordInput}
          loading={lostPasswordLoading}
          status={lostPasswordStatus}
          onRequest={handleLostPasswordRequest}
          onReset={handleLostPasswordReset}
        />
      ) : null}

      <AuthVerifyEmailSection
        t={t}
        mode={verifyEmailMode}
        setMode={setVerifyEmailMode}
        authUserIsAdmin={authUser?.isAdmin === true}
        emailInput={verifyEmailInput}
        setEmailInput={setVerifyEmailInput}
        tokenInput={verifyEmailTokenInput}
        setTokenInput={setVerifyEmailTokenInput}
        loading={verifyEmailLoading}
        status={verifyEmailStatus}
        onRequest={handleVerifyEmailRequest}
        onConfirm={handleVerifyEmailConfirm}
        onAdminConfirm={handleVerifyEmailAdminConfirm}
      />

      {authUser?.isAdmin && appMfaFeatureKey ? (
        <AuthAppFeatureSection
          t={t}
          appMfaFeatureEnabled={appMfaFeatureEnabled}
          appFeatureBusy={appFeatureBusy}
          appFeatureStatus={appFeatureStatus}
          onToggle={() => setAppFeature(!appMfaFeatureEnabled)}
        />
      ) : null}

      {authUser && mfaFeatureKey ? (
        <AuthMfaSection
          t={t}
          authUserMfaEnabled={authUser.mfaEnabled}
          mfaFeatureAvailable={mfaFeatureAvailable}
          mfaFeatureUserCanDisable={mfaFeatureUserCanDisable}
          mfaFeatureUserEnabled={mfaFeatureUserEnabled}
          authMfaBusy={authMfaBusy}
          authMfaSetup={authMfaSetup}
          authMfaOtpAction={authMfaOtpAction}
          setAuthMfaOtpAction={setAuthMfaOtpAction}
          authMfaStatus={authMfaStatus}
          onToggleUserFeature={() => setUserFeature(!mfaFeatureUserEnabled)}
          onStartSetup={startMfaSetup}
          onEnableMfa={enableMfa}
          onDisableMfa={disableMfa}
        />
      ) : null}
    </section>
  )
}
