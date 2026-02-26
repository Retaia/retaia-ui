import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useReviewWorkspaceFilters } from './useReviewWorkspaceFilters'

const STORAGE_KEY = 'retaia_review_workspace_state'

describe('useReviewWorkspaceFilters', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(window.history.state, '', '/review')
  })

  it('prioritizes query params over persisted workspace values', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
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

    const { result } = renderHook(() => useReviewWorkspaceFilters())

    expect(result.current.filter).toBe('DECISION_PENDING')
    expect(result.current.mediaTypeFilter).toBe('VIDEO')
    expect(result.current.sort).toBe('name')
    expect(result.current.search).toBe('query')
    expect(result.current.batchOnly).toBe(true)
    expect(result.current.batchIds).toEqual(['A-001'])
  })

  it('reacts to browser popstate by restoring filters from URL', () => {
    const { result } = renderHook(() => useReviewWorkspaceFilters())

    act(() => {
      window.history.pushState(
        window.history.state,
        '',
        '/review?state=DECIDED_REJECT&media_type=PHOTO&sort=-updated_at&q=back',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current.filter).toBe('DECIDED_REJECT')
    expect(result.current.mediaTypeFilter).toBe('IMAGE')
    expect(result.current.sort).toBe('-updated_at')
    expect(result.current.search).toBe('back')
  })
})
