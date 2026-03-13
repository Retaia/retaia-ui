export type ApiErrorPayload = {
  code?: string
  message: string
  details?: Record<string, unknown>
  retryable?: boolean
  correlation_id?: string
}

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
