type WorkspaceScope = 'review' | 'library' | 'rejects'

type WorkspaceContext = {
  lastRoute?: string
  reviewSelectedAssetId?: string | null
  librarySelectedAssetId?: string | null
  rejectsSelectedAssetId?: string | null
  reviewScrollY?: number
  libraryScrollY?: number
  rejectsScrollY?: number
}

const STORAGE_KEY = 'retaia_ui_workspace_context'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readContext(): WorkspaceContext {
  if (!canUseStorage()) {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as WorkspaceContext
    return parsed ?? {}
  } catch {
    return {}
  }
}

function writeContext(next: WorkspaceContext) {
  if (!canUseStorage()) {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function updateContext(patch: Partial<WorkspaceContext>) {
  const current = readContext()
  writeContext({ ...current, ...patch })
}

export function persistLastRoute(pathname: string, search = '') {
  const route = `${pathname}${search}`
  updateContext({ lastRoute: route })
}

export function readLastRoute(): string | undefined {
  return readContext().lastRoute
}

export function persistSelectedAssetId(scope: WorkspaceScope, assetId: string | null) {
  updateContext(
    scope === 'review'
      ? { reviewSelectedAssetId: assetId }
      : scope === 'library'
        ? { librarySelectedAssetId: assetId }
        : { rejectsSelectedAssetId: assetId },
  )
}

export function readSelectedAssetId(scope: WorkspaceScope): string | null {
  const context = readContext()
  const value =
    scope === 'review'
      ? context.reviewSelectedAssetId
      : scope === 'library'
        ? context.librarySelectedAssetId
        : context.rejectsSelectedAssetId
  return typeof value === 'string' || value === null ? value : null
}

export function persistScrollY(scope: WorkspaceScope, scrollY: number) {
  const value = Number.isFinite(scrollY) && scrollY > 0 ? Math.round(scrollY) : 0
  updateContext(
    scope === 'review'
      ? { reviewScrollY: value }
      : scope === 'library'
        ? { libraryScrollY: value }
        : { rejectsScrollY: value },
  )
}

export function readScrollY(scope: WorkspaceScope): number {
  const context = readContext()
  const value =
    scope === 'review'
      ? context.reviewScrollY
      : scope === 'library'
        ? context.libraryScrollY
        : context.rejectsScrollY
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0
  }
  return value
}
