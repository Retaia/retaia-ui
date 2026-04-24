export type ActivityLogScope = 'review' | 'library' | 'rejects'

export type ActivityLogEntry = {
  id: number
  label: string
  createdAt: string
  scope: ActivityLogScope
  assetId?: string
}

type CreateActivityLogEntryInput = {
  label: string
  scope?: ActivityLogScope
  assetId?: string
}

const STORAGE_KEY = 'retaia_ui_activity_log'
const CHANGE_EVENT = 'retaia:activity-log-change'
const MAX_ENTRIES = 24
const EMPTY_ENTRIES: ActivityLogEntry[] = []

let cachedRaw: string | null | undefined
let cachedEntries: ActivityLogEntry[] = EMPTY_ENTRIES

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function emitChange() {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function readActivityLog(): ActivityLogEntry[] {
  if (!canUseStorage()) {
    return EMPTY_ENTRIES
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      cachedRaw = raw
      cachedEntries = EMPTY_ENTRIES
      return cachedEntries
    }
    if (raw === cachedRaw) {
      return cachedEntries
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      cachedRaw = raw
      cachedEntries = EMPTY_ENTRIES
      return cachedEntries
    }

    cachedEntries = parsed
      .filter((entry): entry is ActivityLogEntry => {
        if (!entry || typeof entry !== 'object') {
          return false
        }
        const candidate = entry as Partial<ActivityLogEntry>
        return (
          typeof candidate.id === 'number' &&
          typeof candidate.label === 'string' &&
          typeof candidate.createdAt === 'string' &&
          (candidate.scope === 'review' ||
            candidate.scope === 'library' ||
            candidate.scope === 'rejects') &&
          (typeof candidate.assetId === 'undefined' || typeof candidate.assetId === 'string')
        )
      })
      .slice(0, MAX_ENTRIES)
    cachedRaw = raw
    return cachedEntries
  } catch {
    return EMPTY_ENTRIES
  }
}

function writeActivityLog(entries: ActivityLogEntry[]) {
  if (!canUseStorage()) {
    return
  }

  const normalizedEntries = entries.slice(0, MAX_ENTRIES)
  const raw = JSON.stringify(normalizedEntries)
  cachedRaw = raw
  cachedEntries = normalizedEntries.length > 0 ? normalizedEntries : EMPTY_ENTRIES
  window.localStorage.setItem(STORAGE_KEY, raw)
  emitChange()
}

export function appendActivityLogEntry({
  label,
  scope = 'review',
  assetId,
}: CreateActivityLogEntryInput) {
  const current = readActivityLog()
  const nextId = current.reduce((maxId, entry) => Math.max(maxId, entry.id), 0) + 1
  writeActivityLog([
    {
      id: nextId,
      label,
      createdAt: new Date().toISOString(),
      scope,
      assetId,
    },
    ...current,
  ])
}

export function clearActivityLog() {
  writeActivityLog([])
}

export function subscribeActivityLog(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => {
    onStoreChange()
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange()
    }
  }

  window.addEventListener(CHANGE_EVENT, handleChange)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange)
    window.removeEventListener('storage', handleStorage)
  }
}
