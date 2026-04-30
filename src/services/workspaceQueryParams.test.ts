import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readActivityFilterParams,
  readLibraryFilterParams,
  readReviewFilterParams,
  writeActivityFilterParams,
  writeLibraryFilterParams,
  writeReviewFilterParams,
} from './workspaceQueryParams'

describe('workspaceQueryParams', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/review')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads review params using API-compatible keys', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-26T12:00:00.000Z'))
    window.history.replaceState(
      {},
      '',
      '/review?state=DECISION_PENDING&media_type=PHOTO&sort=name&q=interview&captured_at_from=2026-02-22T12:00:00.000Z',
    )

    const params = readReviewFilterParams()

    expect(params.filter).toBe('DECISION_PENDING')
    expect(params.mediaTypeFilter).toBe('IMAGE')
    expect(params.sort).toBe('name')
    expect(params.search).toBe('interview')
    expect(params.dateFilter).toBe('LAST_7_DAYS')
  })

  it('writes review params and keeps unrelated query keys', () => {
    window.history.replaceState({}, '', '/review?source=api')

    writeReviewFilterParams({
      filter: 'DECISION_PENDING',
      mediaTypeFilter: 'IMAGE',
      dateFilter: 'ALL',
      sort: '-created_at',
      search: ' interview ',
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('state')).toBe('DECISION_PENDING')
    expect(params.get('media_type')).toBe('PHOTO')
    expect(params.get('q')).toBe('interview')
    expect(params.get('source')).toBe('api')
    expect(params.get('sort')).toBeNull()
    expect(params.get('captured_at_from')).toBeNull()
    expect(params.get('captured_at_to')).toBeNull()
  })

  it('uses work queue as implicit review default and keeps all as explicit override', () => {
    window.history.replaceState({}, '', '/review')

    writeReviewFilterParams({
      filter: 'WORK_QUEUE',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      sort: '-created_at',
      search: '',
    })

    let params = new URLSearchParams(window.location.search)
    expect(params.get('state')).toBeNull()

    writeReviewFilterParams({
      filter: 'ALL',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      sort: '-created_at',
      search: '',
    })

    params = new URLSearchParams(window.location.search)
    expect(params.get('state')).toBe('ALL')

    const parsed = readReviewFilterParams()
    expect(parsed.filter).toBe('ALL')
  })

  it('reads and writes library params with shared q/sort behavior', () => {
    window.history.replaceState({}, '', '/library?foo=bar')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-26T12:00:00.000Z'))
    writeLibraryFilterParams({
      search: ' ambiance ',
      mediaTypeFilter: 'IMAGE',
      dateFilter: 'LAST_30_DAYS',
      sort: 'name',
    })

    let params = new URLSearchParams(window.location.search)
    expect(params.get('q')).toBe('ambiance')
    expect(params.get('media_type')).toBe('PHOTO')
    expect(params.get('captured_at_from')).not.toBeNull()
    expect(params.get('sort')).toBe('name')
    expect(params.get('foo')).toBe('bar')

    const parsed = readLibraryFilterParams()
    expect(parsed.search).toBe('ambiance')
    expect(parsed.mediaTypeFilter).toBe('IMAGE')
    expect(parsed.dateFilter).toBe('LAST_30_DAYS')
    expect(parsed.sort).toBe('name')

    writeLibraryFilterParams({
      search: '',
      mediaTypeFilter: 'ALL',
      dateFilter: 'ALL',
      sort: '-created_at',
    })
    params = new URLSearchParams(window.location.search)
    expect(params.get('q')).toBeNull()
    expect(params.get('media_type')).toBeNull()
    expect(params.get('captured_at_from')).toBeNull()
    expect(params.get('sort')).toBeNull()
  })

  it('reads and writes activity params with explicit local filters', () => {
    window.history.replaceState({}, '', '/activity?foo=bar')

    writeActivityFilterParams(' decision ', 'library', true)

    let params = new URLSearchParams(window.location.search)
    expect(params.get('q')).toBe('decision')
    expect(params.get('scope')).toBe('library')
    expect(params.get('linked')).toBe('1')
    expect(params.get('foo')).toBe('bar')
    expect(params.get('sort')).toBeNull()

    const parsed = readActivityFilterParams()
    expect(parsed.search).toBe('decision')
    expect(parsed.scope).toBe('library')
    expect(parsed.linkedOnly).toBe(true)

    writeActivityFilterParams('', 'ALL', false)
    params = new URLSearchParams(window.location.search)
    expect(params.get('q')).toBeNull()
    expect(params.get('scope')).toBeNull()
    expect(params.get('linked')).toBeNull()
  })
})
