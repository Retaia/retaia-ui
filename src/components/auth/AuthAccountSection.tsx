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
    <section className="border border-2 border-gray-200 rounded p-3 mb-3" aria-label={t('app.authTitle')}>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{t('app.authTitle')}</h3>
      {authUser ? (
        <p className="text-xs mb-2 text-gray-500" data-testid="auth-user-status">
          {t('app.authSignedInAs', {
            identity: authUser.displayName ?? authUser.email,
          })}
          {authUser.mfaEnabled ? ` · ${t('app.authMfaEnabled')}` : ''}
        </p>
      ) : (
        <p className="text-xs mb-2 text-gray-500" data-testid="auth-user-status">
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
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="auth-logout"
            disabled={authLoading}
            onClick={() => void handleLogout()}
          >
            {t('app.authLogout')}
          </button>
        </div>
      ) : null}

      {isApiAuthLockedByEnv ? <p className="text-xs text-gray-500 mb-0">{t('app.authEnvLocked')}</p> : null}
      {authStatus ? (
        <p
          className={`text-xs mt-2 mb-0 ${authStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
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
