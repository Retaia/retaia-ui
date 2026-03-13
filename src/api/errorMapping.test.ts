import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { mapApiErrorToMessage } from './errorMapping'

const t = (key: string, params?: Record<string, string | number>) => {
  const templates: Record<string, string> = {
    'error.scope': 'scope',
    'error.stateConflict': 'state',
    'error.idempotency': 'idempotency',
    'error.validation': 'validation',
    'error.lock': 'lock',
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

  it('maps lock-related conflicts', () => {
    const invalid = new ApiError(409, 'invalid lock', {
      code: 'LOCK_INVALID',
      message: 'invalid',
      retryable: false,
      correlation_id: 'c-lock-1',
    })
    const required = new ApiError(409, 'required lock', {
      code: 'LOCK_REQUIRED',
      message: 'required',
      retryable: false,
      correlation_id: 'c-lock-2',
    })
    expect(mapApiErrorToMessage(invalid, t)).toBe('lock')
    expect(mapApiErrorToMessage(required, t)).toBe('lock')
  })

  it('maps temporary, validation and fallback errors', () => {
    const temporary = new ApiError(503, 'down')
    const rateLimited = new ApiError(429, 'rate limited', {
      code: 'RATE_LIMITED',
      message: 'rate',
      retryable: true,
      correlation_id: 'c-rate',
    })
    const validation = new ApiError(418, 'teapot', {
      code: 'VALIDATION_FAILED',
      message: 'teapot',
      retryable: false,
      correlation_id: 'c4',
    })
    const fallback = new ApiError(418, 'teapot')
    expect(mapApiErrorToMessage(temporary, t)).toBe('temporary')
    expect(mapApiErrorToMessage(rateLimited, t)).toBe('temporary')
    expect(mapApiErrorToMessage(validation, t)).toBe('validation')
    expect(mapApiErrorToMessage(fallback, t)).toBe('fallback:HTTP 418')
  })
})
