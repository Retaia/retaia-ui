import { beforeEach, describe, expect, it } from 'vitest'
import {
  persistLastRoute,
  persistScrollY,
  persistSelectedAssetId,
  readLastRoute,
  readScrollY,
  readSelectedAssetId,
} from './workspaceContextPersistence'

describe('workspaceContextPersistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists and reads last route', () => {
    persistLastRoute('/review', '?q=interview&sort=name')
    expect(readLastRoute()).toBe('/review?q=interview&sort=name')
  })

  it('persists selected asset ids by scope', () => {
    persistSelectedAssetId('review', 'A-001')
    persistSelectedAssetId('library', 'A-002')

    expect(readSelectedAssetId('review')).toBe('A-001')
    expect(readSelectedAssetId('library')).toBe('A-002')

    persistSelectedAssetId('review', null)
    expect(readSelectedAssetId('review')).toBeNull()
  })

  it('persists scroll values by scope with safe normalization', () => {
    persistScrollY('review', 120.7)
    persistScrollY('library', -5)

    expect(readScrollY('review')).toBe(121)
    expect(readScrollY('library')).toBe(0)
  })
})
