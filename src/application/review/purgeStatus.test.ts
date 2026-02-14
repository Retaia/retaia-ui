import { describe, expect, it, vi } from 'vitest'
import {
  buildPurgeErrorStatus,
  buildPurgePreviewErrorStatus,
  buildPurgePreviewReadyStatus,
  buildPurgeSuccessStatus,
} from './purgeStatus'

const t = (key: string, values?: Record<string, unknown>) =>
  values ? `${key}:${JSON.stringify(values)}` : key

describe('purgeStatus', () => {
  it('builds success statuses for preview and execute', () => {
    expect(buildPurgePreviewReadyStatus(t, 'A-001')).toEqual({
      kind: 'success',
      message: 'actions.purgePreviewReady:{"id":"A-001"}',
    })
    expect(buildPurgeSuccessStatus(t, 'A-001')).toEqual({
      kind: 'success',
      message: 'actions.purgeResult:{"id":"A-001"}',
    })
  })

  it('builds error statuses using mapped error messages', () => {
    const mapErrorToMessage = vi.fn(() => 'mapped')

    expect(buildPurgePreviewErrorStatus(t, mapErrorToMessage, new Error('preview'))).toEqual({
      kind: 'error',
      message: 'actions.purgePreviewError:{"message":"mapped"}',
    })

    expect(buildPurgeErrorStatus(t, mapErrorToMessage, new Error('execute'))).toEqual({
      kind: 'error',
      message: 'actions.purgeError:{"message":"mapped"}',
    })

    expect(mapErrorToMessage).toHaveBeenCalledTimes(2)
  })
})
