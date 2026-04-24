import { describe, expect, it } from 'vitest'
import {
  appendActivityLogEntry,
  clearActivityLog,
  readActivityLog,
} from './activityLogPersistence'

describe('activityLogPersistence', () => {
  it('appends entries with metadata in reverse chronological order', () => {
    appendActivityLogEntry({ label: 'Decision A-001', assetId: 'A-001' })
    appendActivityLogEntry({ label: 'Tagging A-002', assetId: 'A-002', scope: 'library' })

    const entries = readActivityLog()

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      label: 'Tagging A-002',
      assetId: 'A-002',
      scope: 'library',
    })
    expect(entries[1]).toMatchObject({
      label: 'Decision A-001',
      assetId: 'A-001',
      scope: 'review',
    })
  })

  it('clears all persisted entries', () => {
    appendActivityLogEntry({ label: 'Decision A-001', assetId: 'A-001' })

    clearActivityLog()

    expect(readActivityLog()).toEqual([])
  })
})
