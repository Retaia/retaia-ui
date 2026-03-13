import { describe, expect, it, vi } from 'vitest'
import {
  buildExecuteCanceledStatus,
  buildExecuteErrorStatus,
  buildExecuteQueuedStatus,
  buildExecuteSuccessStatus,
  buildPreviewErrorStatus,
  buildPreviewSuccessStatus,
} from './batchExecutionStatus'

const t = (key: string, values?: Record<string, unknown>) =>
  values ? `${key}:${JSON.stringify(values)}` : key

describe('batchExecutionStatus', () => {
  it('builds preview statuses', () => {
    expect(buildPreviewSuccessStatus(t, 3)).toEqual({
      kind: 'success',
      message: 'actions.previewResult:{"include":"BOTH","count":3}',
    })

    const mapErrorToMessage = vi.fn(() => 'mapped')
    expect(buildPreviewErrorStatus(t, mapErrorToMessage, new Error('boom'))).toEqual({
      kind: 'error',
      message: 'actions.previewError:{"message":"mapped"}',
    })
    expect(mapErrorToMessage).toHaveBeenCalled()
  })

  it('builds execute statuses', () => {
    expect(buildExecuteSuccessStatus(t)).toEqual({
      kind: 'success',
      message: 'actions.executeResult',
    })
    expect(buildExecuteQueuedStatus(t, 6)).toEqual({
      kind: 'success',
      message: 'actions.executeQueued:{"seconds":6}',
    })
    expect(buildExecuteCanceledStatus(t)).toEqual({
      kind: 'success',
      message: 'actions.executeCanceled',
    })

    const mapErrorToMessage = vi.fn(() => 'mapped')
    expect(buildExecuteErrorStatus(t, mapErrorToMessage, new Error('boom'))).toEqual({
      kind: 'error',
      message: 'actions.executeError:{"message":"mapped"}',
    })
    expect(mapErrorToMessage).toHaveBeenCalled()
  })
})
