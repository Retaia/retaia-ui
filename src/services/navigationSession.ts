import type { AssetDateFilter, AssetFilter, AssetMediaTypeFilter } from '../domain/assets'

const REVIEW_WORKSPACE_STATE_KEY = 'retaia_review_workspace_state'
const LIBRARY_WORKSPACE_STATE_KEY = 'retaia_library_workspace_state'

export type ReviewWorkspaceState = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  search: string
  batchOnly: boolean
  batchIds: string[]
}

export type LibraryWorkspaceState = {
  search: string
}

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

export function readReviewWorkspaceState() {
  return readJson<ReviewWorkspaceState>(REVIEW_WORKSPACE_STATE_KEY)
}

export function saveReviewWorkspaceState(state: ReviewWorkspaceState) {
  writeJson(REVIEW_WORKSPACE_STATE_KEY, state)
}

export function readLibraryWorkspaceState() {
  return readJson<LibraryWorkspaceState>(LIBRARY_WORKSPACE_STATE_KEY)
}

export function saveLibraryWorkspaceState(state: LibraryWorkspaceState) {
  writeJson(LIBRARY_WORKSPACE_STATE_KEY, state)
}
