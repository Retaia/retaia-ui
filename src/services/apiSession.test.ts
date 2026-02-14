import { beforeEach, describe, expect, it } from 'vitest'
import {
  API_BASE_URL_STORAGE_KEY,
  API_LOGIN_EMAIL_STORAGE_KEY,
  API_TOKEN_STORAGE_KEY,
  clearApiBaseUrl,
  clearApiToken,
  persistApiBaseUrl,
  persistApiToken,
  persistLoginEmail,
  readStoredApiBaseUrl,
  readStoredApiToken,
  readStoredLoginEmail,
} from './apiSession'

describe('apiSession', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists and reads api token', () => {
    expect(persistApiToken('token-1')).toBe(true)
    expect(readStoredApiToken()).toBe('token-1')
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBe('token-1')
  })

  it('persists and clears base url', () => {
    expect(persistApiBaseUrl('/api/custom')).toBe(true)
    expect(readStoredApiBaseUrl()).toBe('/api/custom')
    expect(clearApiBaseUrl()).toBe(true)
    expect(readStoredApiBaseUrl()).toBe('')
    expect(window.localStorage.getItem(API_BASE_URL_STORAGE_KEY)).toBeNull()
  })

  it('persists login email and clears token', () => {
    persistLoginEmail('dev@retaia.test')
    persistApiToken('token-2')
    expect(readStoredLoginEmail()).toBe('dev@retaia.test')
    expect(window.localStorage.getItem(API_LOGIN_EMAIL_STORAGE_KEY)).toBe('dev@retaia.test')

    expect(clearApiToken()).toBe(true)
    expect(readStoredApiToken()).toBe('')
  })
})
