import type { components } from './generated/openapi'

export type ApiErrorPayload = components['schemas']['ErrorResponse']

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}
