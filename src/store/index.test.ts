import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from './index'

describe('createAppStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(window.history.state, '', '/review')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hydrates review workspace from query params over persisted state', () => {
    window.history.replaceState(
      window.history.state,
      '',
      '/review?state=DECISION_PENDING&media_type=VIDEO&sort=name&q=query',
    )

    const store = createAppStore()
    const state = store.getState().reviewWorkspace

    expect(state.filter).toBe('DECISION_PENDING')
    expect(state.mediaTypeFilter).toBe('VIDEO')
    expect(state.sort).toBe('name')
    expect(state.search).toBe('query')
    expect(state.batchOnly).toBe(false)
    expect(state.batchIds).toEqual([])
  })

  it('defaults review workspace to work queue when no state is provided', () => {
    const store = createAppStore()
    const state = store.getState().reviewWorkspace

    expect(state.filter).toBe('WORK_QUEUE')
  })

  it('hydrates library workspace from query params over persisted state', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-26T12:00:00.000Z'))
    window.history.replaceState(
      window.history.state,
      '',
      '/library?q=archive&sort=name&media_type=PHOTO&captured_at_from=2026-02-22T12:00:00.000Z',
    )

    const store = createAppStore()
    const state = store.getState().libraryWorkspace

    expect(state.search).toBe('archive')
    expect(state.mediaTypeFilter).toBe('IMAGE')
    expect(state.dateFilter).toBe('LAST_7_DAYS')
    expect(state.sort).toBe('name')
  })
})
