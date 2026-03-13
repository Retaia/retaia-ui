import { describe, expect, it } from 'vitest'
import {
  DEFAULT_QUICK_FILTER_STATE,
  getQuickFilterPresetState,
  getSavedViewState,
  isQuickFilterPreset,
} from './quickFilterPresets'

describe('quickFilterPresets', () => {
  it('maps quick filter presets to deterministic states', () => {
    expect(getQuickFilterPresetState('DEFAULT')).toEqual(DEFAULT_QUICK_FILTER_STATE)
    expect(getQuickFilterPresetState('PENDING_RECENT')).toEqual({
      filter: 'DECISION_PENDING',
      mediaTypeFilter: 'ALL',
      dateFilter: 'LAST_7_DAYS',
      search: '',
      batchOnly: false,
    })
    expect(getQuickFilterPresetState('IMAGES_REJECTED')).toEqual({
      filter: 'DECIDED_REJECT',
      mediaTypeFilter: 'IMAGE',
      dateFilter: 'ALL',
      search: '',
      batchOnly: false,
    })
    expect(getQuickFilterPresetState('MEDIA_REVIEW')).toEqual({
      filter: 'ALL',
      mediaTypeFilter: 'VIDEO',
      dateFilter: 'LAST_30_DAYS',
      search: '',
      batchOnly: false,
    })
  })

  it('maps saved views to deterministic states', () => {
    expect(getSavedViewState('DEFAULT')).toEqual(DEFAULT_QUICK_FILTER_STATE)
    expect(getSavedViewState('PENDING')).toEqual({
      filter: 'DECISION_PENDING',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      search: '',
      batchOnly: false,
    })
    expect(getSavedViewState('BATCH')).toEqual({
      filter: 'ALL',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      search: '',
      batchOnly: true,
    })
  })

  it('guards quick filter preset values', () => {
    expect(isQuickFilterPreset('DEFAULT')).toBe(true)
    expect(isQuickFilterPreset('MEDIA_REVIEW')).toBe(true)
    expect(isQuickFilterPreset('PENDING')).toBe(false)
    expect(isQuickFilterPreset('foo')).toBe(false)
  })
})
