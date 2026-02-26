import { describe, expect, it, vi } from 'vitest'
import {
  reportUiIssue,
  reportUiNavigationAction,
  reportUiNavigationScreenView,
} from './telemetry'

describe('telemetry', () => {
  it('dispatches ui issue events', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    reportUiIssue('test.issue', { status: 'failed' })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'retaia:ui-issue',
      }),
    )
  })

  it('dispatches navigation screen_view events with origin path', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    reportUiNavigationScreenView({
      pathname: '/review',
      search: '?q=foo',
      from: '/library',
    })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'retaia:navigation',
        detail: expect.objectContaining({
          kind: 'screen_view',
          pathname: '/review',
          search: '?q=foo',
          from: '/library',
        }),
      }),
    )
  })

  it('dispatches navigation action events with origin source', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    reportUiNavigationAction({
      origin: 'header:review',
      pathname: '/review',
      search: '',
    })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'retaia:navigation',
        detail: expect.objectContaining({
          kind: 'action',
          origin: 'header:review',
          pathname: '/review',
        }),
      }),
    )
  })
})

