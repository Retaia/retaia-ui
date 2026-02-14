import type { AuthUserProfile } from './authUseCases'

export type MfaToggleTarget = 'enable' | 'disable'

export function getMfaToggleErrorKey(target: MfaToggleTarget) {
  return target === 'enable' ? 'app.authMfaEnableError' : 'app.authMfaDisableError'
}

export function getMfaToggleSuccessKey(target: MfaToggleTarget) {
  return target === 'enable' ? 'app.authMfaEnabledNow' : 'app.authMfaDisabledNow'
}

export function updateAuthUserMfaFlag(
  currentUser: AuthUserProfile | null,
  nextMfaEnabled: boolean,
): AuthUserProfile | null {
  if (!currentUser) {
    return currentUser
  }

  return {
    ...currentUser,
    mfaEnabled: nextMfaEnabled,
  }
}
