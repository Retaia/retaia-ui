import { beforeEach, describe, expect, it } from 'vitest'
import { createAppStore } from './index'

describe('createAppStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(window.history.state, '', '/review')
  })

  it('hydrates review workspace from query params over persisted state', () => {
    window.localStorage.setItem(
      'retaia_review_workspace_state',
      JSON.stringify({
        filter: 'DECIDED_KEEP',
        mediaTypeFilter: 'AUDIO',
        dateFilter: 'LAST_30_DAYS',
        sort: '-updated_at',
        search: 'persisted',
        batchOnly: true,
        batchIds: ['A-001'],
      }),
    )
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
    expect(state.batchOnly).toBe(true)
    expect(state.batchIds).toEqual(['A-001'])
  })

  it('hydrates library workspace from query params over persisted state', () => {
    window.localStorage.setItem(
      'retaia_library_workspace_state',
      JSON.stringify({
        search: 'persisted',
        sort: '-updated_at',
      }),
    )
    window.history.replaceState(window.history.state, '', '/library?q=archive&sort=name')

    const store = createAppStore()
    const state = store.getState().libraryWorkspace

    expect(state.search).toBe('archive')
    expect(state.sort).toBe('name')
  })
})
