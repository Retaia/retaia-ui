import { describe, expect, it } from 'vitest'

import {
  countAssetsByState,
  filterAssets,
  getStateFromDecision,
  updateAssetsState,
  updateAssetState,
  type Asset,
} from './assets'

const assets: Asset[] = [
  { id: 'A-001', name: 'interview-camera-a.mov', state: 'DECISION_PENDING' },
  { id: 'A-002', name: 'ambiance-plateau.wav', state: 'DECIDED_KEEP' },
  { id: 'A-003', name: 'behind-the-scenes.jpg', state: 'DECIDED_REJECT' },
]

describe('assets domain', () => {
  it('filters by state and search text', () => {
    const result = filterAssets(assets, 'DECISION_PENDING', 'camera')
    expect(result).toEqual([assets[0]])
  })

  it('counts assets by state', () => {
    expect(countAssetsByState(assets)).toEqual({
      DECISION_PENDING: 1,
      DECIDED_KEEP: 1,
      DECIDED_REJECT: 1,
    })
  })

  it('updates state for a single asset', () => {
    const result = updateAssetState(assets, 'A-001', 'DECIDED_KEEP')
    expect(result[0].state).toBe('DECIDED_KEEP')
    expect(result[1].state).toBe('DECIDED_KEEP')
  })

  it('updates state for a list of assets', () => {
    const result = updateAssetsState(assets, ['A-001', 'A-003'], 'DECIDED_KEEP')
    expect(result[0].state).toBe('DECIDED_KEEP')
    expect(result[1].state).toBe('DECIDED_KEEP')
    expect(result[2].state).toBe('DECIDED_KEEP')
  })

  it('maps decision actions to states', () => {
    expect(getStateFromDecision('KEEP', 'DECISION_PENDING')).toBe('DECIDED_KEEP')
    expect(getStateFromDecision('REJECT', 'DECISION_PENDING')).toBe('DECIDED_REJECT')
    expect(getStateFromDecision('CLEAR', 'DECIDED_KEEP')).toBe('DECISION_PENDING')
    expect(getStateFromDecision('CLEAR', 'DECISION_PENDING')).toBe('DECISION_PENDING')
  })
})
