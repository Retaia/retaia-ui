import { beforeEach, describe, expect, it } from 'vitest'
import {
  ASSET_SOURCE_STORAGE_KEY,
  clearAssetSource,
  persistAssetSource,
  readStoredAssetSource,
} from './apiSession'

describe('apiSession', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists and reads asset source', () => {
    expect(persistAssetSource('api')).toBe(true)
    expect(readStoredAssetSource()).toBe('api')
    expect(window.localStorage.getItem(ASSET_SOURCE_STORAGE_KEY)).toBe('api')
  })

  it('clears asset source', () => {
    window.localStorage.setItem(ASSET_SOURCE_STORAGE_KEY, 'mock')
    expect(clearAssetSource()).toBe(true)
    expect(readStoredAssetSource()).toBe('')
    expect(window.localStorage.getItem(ASSET_SOURCE_STORAGE_KEY)).toBeNull()
  })
})
