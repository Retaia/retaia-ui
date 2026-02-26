import type { ReviewWorkspaceState } from '../slices/reviewWorkspaceSlice'
import type { LibraryWorkspaceState } from '../slices/libraryWorkspaceSlice'

const REVIEW_WORKSPACE_STATE_KEY = 'retaia_review_workspace_state'
const LIBRARY_WORKSPACE_STATE_KEY = 'retaia_library_workspace_state'

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function readPersistedReviewWorkspaceState() {
  return readJson<ReviewWorkspaceState>(REVIEW_WORKSPACE_STATE_KEY)
}

export function savePersistedReviewWorkspaceState(state: ReviewWorkspaceState) {
  writeJson(REVIEW_WORKSPACE_STATE_KEY, state)
}

export function readPersistedLibraryWorkspaceState() {
  return readJson<LibraryWorkspaceState>(LIBRARY_WORKSPACE_STATE_KEY)
}

export function savePersistedLibraryWorkspaceState(state: LibraryWorkspaceState) {
  writeJson(LIBRARY_WORKSPACE_STATE_KEY, state)
}
