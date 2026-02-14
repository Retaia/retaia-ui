import { describe, expect, it } from 'vitest'
import {
  getMfaToggleErrorKey,
  getMfaToggleSuccessKey,
  updateAuthUserMfaFlag,
} from './mfaPresentation'

describe('mfaPresentation', () => {
  it('maps toggle targets to i18n keys', () => {
    expect(getMfaToggleErrorKey('enable')).toBe('app.authMfaEnableError')
    expect(getMfaToggleErrorKey('disable')).toBe('app.authMfaDisableError')
    expect(getMfaToggleSuccessKey('enable')).toBe('app.authMfaEnabledNow')
    expect(getMfaToggleSuccessKey('disable')).toBe('app.authMfaDisabledNow')
  })

  it('updates MFA flag while preserving other user fields', () => {
    expect(
      updateAuthUserMfaFlag(
        {
          email: 'user@retaia.test',
          displayName: 'User',
          isAdmin: false,
          mfaEnabled: false,
        },
        true,
      ),
    ).toEqual({
      email: 'user@retaia.test',
      displayName: 'User',
      isAdmin: false,
      mfaEnabled: true,
    })
  })

  it('keeps null user unchanged', () => {
    expect(updateAuthUserMfaFlag(null, true)).toBeNull()
  })
})
