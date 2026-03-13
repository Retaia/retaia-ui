export const API_TOKEN_STORAGE_KEY = 'retaia_api_token'
export const API_BASE_URL_STORAGE_KEY = 'retaia_api_base_url'
export const API_LOGIN_EMAIL_STORAGE_KEY = 'retaia_auth_email'
export const ASSET_SOURCE_STORAGE_KEY = 'retaia_asset_source'

export type AssetSourceSetting = 'mock' | 'api'

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

export function readStoredAssetSource(): AssetSourceSetting | '' {
  const value = safeGetStorageItem(ASSET_SOURCE_STORAGE_KEY).trim().toLowerCase()
  if (value === 'mock' || value === 'api') {
    return value
  }
  return ''
}

export function persistAssetSource(source: AssetSourceSetting) {
  return safeSetStorageItem(ASSET_SOURCE_STORAGE_KEY, source)
}

export function clearAssetSource() {
  return safeRemoveStorageItem(ASSET_SOURCE_STORAGE_KEY)
}
