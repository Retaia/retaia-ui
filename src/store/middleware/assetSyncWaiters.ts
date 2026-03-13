type Deferred = {
  resolve: () => void
  reject: (error: unknown) => void
  promise: Promise<void>
}

const waiters = new Map<string, Deferred>()

export function createAssetSyncWaiter(mutationId: string): Promise<void> {
  const existing = waiters.get(mutationId)
  if (existing) {
    return existing.promise
  }
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  waiters.set(mutationId, { resolve, reject, promise })
  return promise
}

export function resolveAssetSyncWaiter(mutationId: string) {
  const deferred = waiters.get(mutationId)
  if (!deferred) {
    return
  }
  deferred.resolve()
  waiters.delete(mutationId)
}

export function rejectAssetSyncWaiter(mutationId: string, error: unknown) {
  const deferred = waiters.get(mutationId)
  if (!deferred) {
    return
  }
  deferred.reject(error)
  waiters.delete(mutationId)
}
