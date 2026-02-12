import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { mapApiErrorToMessage } from './errorMapping'

const t = (key: string, params?: Record<string, string | number>) => {
  const templates: Record<string, string> = {
    'error.scope': 'scope',
    'error.stateConflict': 'state',
    'error.idempotency': 'idempotency',
    'error.validation': 'validation',
    'error.temporary': 'temporary',
    'error.fallback': `fallback:${params?.message ?? ''}`,
  }
  return templates[key] ?? key
}

describe('mapApiErrorToMessage', () => {
  it('maps authz errors to scope message', () => {
    const error = new ApiError(403, 'forbidden', {
      code: 'FORBIDDEN_SCOPE',
      message: 'forbidden',
      retryable: false,
      correlation_id: 'c1',
    })
    expect(mapApiErrorToMessage(error, t)).toBe('scope')
  })

  it('maps state and idempotency conflicts', () => {
    const state = new ApiError(409, 'state', {
      code: 'STATE_CONFLICT',
      message: 'state',
      retryable: false,
      correlation_id: 'c2',
    })
    const idem = new ApiError(409, 'idem', {
      code: 'IDEMPOTENCY_CONFLICT',
      message: 'idem',
      retryable: false,
      correlation_id: 'c3',
    })
    expect(mapApiErrorToMessage(state, t)).toBe('state')
    expect(mapApiErrorToMessage(idem, t)).toBe('idempotency')
  })

  it('maps temporary, validation and fallback errors', () => {
    const temporary = new ApiError(503, 'down')
    const validation = new ApiError(418, 'teapot', {
      code: 'VALIDATION_FAILED',
      message: 'teapot',
      retryable: false,
      correlation_id: 'c4',
    })
    const fallback = new ApiError(418, 'teapot')
    expect(mapApiErrorToMessage(temporary, t)).toBe('temporary')
    expect(mapApiErrorToMessage(validation, t)).toBe('validation')
    expect(mapApiErrorToMessage(fallback, t)).toBe('fallback:HTTP 418')
  })
})
