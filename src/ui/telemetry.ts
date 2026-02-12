export type UiTelemetryPayload = Record<string, string | number | boolean | null>

type UiIssueEventDetail = {
  name: string
  payload: UiTelemetryPayload
  at: string
}

export function reportUiIssue(name: string, payload: UiTelemetryPayload = {}) {
  const detail: UiIssueEventDetail = {
    name,
    payload,
    at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('retaia:ui-issue', { detail }))
  }
}
