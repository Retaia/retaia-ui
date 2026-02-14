export const API_TOKEN_STORAGE_KEY = 'retaia_api_token'
export const API_BASE_URL_STORAGE_KEY = 'retaia_api_base_url'
export const API_LOGIN_EMAIL_STORAGE_KEY = 'retaia_auth_email'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function safeGetStorageItem(key: string) {
  if (!canUseStorage()) {
    return ''
  }
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function safeSetStorageItem(key: string, value: string) {
  if (!canUseStorage()) {
    return false
  }
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeRemoveStorageItem(key: string) {
  if (!canUseStorage()) {
    return false
  }
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function readStoredApiToken() {
  return safeGetStorageItem(API_TOKEN_STORAGE_KEY)
}

export function readStoredApiBaseUrl() {
  return safeGetStorageItem(API_BASE_URL_STORAGE_KEY)
}

export function readStoredLoginEmail() {
  return safeGetStorageItem(API_LOGIN_EMAIL_STORAGE_KEY)
}

export function persistApiToken(token: string) {
  return safeSetStorageItem(API_TOKEN_STORAGE_KEY, token)
}

export function clearApiToken() {
  return safeRemoveStorageItem(API_TOKEN_STORAGE_KEY)
}

export function persistApiBaseUrl(baseUrl: string) {
  return safeSetStorageItem(API_BASE_URL_STORAGE_KEY, baseUrl)
}

export function clearApiBaseUrl() {
  return safeRemoveStorageItem(API_BASE_URL_STORAGE_KEY)
}

export function persistLoginEmail(email: string) {
  return safeSetStorageItem(API_LOGIN_EMAIL_STORAGE_KEY, email)
}
