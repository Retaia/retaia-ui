export type UiTelemetryPayload = Record<string, string | number | boolean | null>

type UiIssueEventDetail = {
  name: string
  payload: UiTelemetryPayload
  at: string
}

type UiNavigationEventDetail = {
  kind: 'screen_view' | 'action'
  pathname: string
  search?: string
  from?: string
  origin?: string
  at: string
}

function dispatchTelemetryEvent(eventName: string, detail: UiIssueEventDetail | UiNavigationEventDetail) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}

export function reportUiIssue(name: string, payload: UiTelemetryPayload = {}) {
  const detail: UiIssueEventDetail = {
    name,
    payload,
    at: new Date().toISOString(),
  }

  dispatchTelemetryEvent('retaia:ui-issue', detail)
}

export function reportUiNavigationScreenView(args: {
  pathname: string
  search?: string
  from?: string
}) {
  const detail: UiNavigationEventDetail = {
    kind: 'screen_view',
    pathname: args.pathname,
    search: args.search,
    from: args.from,
    at: new Date().toISOString(),
  }
  dispatchTelemetryEvent('retaia:navigation', detail)
}

export function reportUiNavigationAction(args: {
  origin: string
  pathname: string
  search?: string
}) {
  const detail: UiNavigationEventDetail = {
    kind: 'action',
    origin: args.origin,
    pathname: args.pathname,
    search: args.search,
    at: new Date().toISOString(),
  }
  dispatchTelemetryEvent('retaia:navigation', detail)
}
