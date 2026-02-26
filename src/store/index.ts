import { configureStore } from '@reduxjs/toolkit'
import { libraryWorkspaceReducer } from './slices/libraryWorkspaceSlice'
import { reviewWorkspaceReducer } from './slices/reviewWorkspaceSlice'
import {
  readPersistedLibraryWorkspaceState,
  readPersistedReviewWorkspaceState,
} from './persistence/workspaceStorage'
import { readLibraryFilterParams, readReviewFilterParams } from '../services/workspaceQueryParams'

function resolvePreloadedState() {
  const persistedReview = readPersistedReviewWorkspaceState()
  const queryReview = readReviewFilterParams()
  const persistedLibrary = readPersistedLibraryWorkspaceState()
  const queryLibrary = readLibraryFilterParams()

  return {
    reviewWorkspace: {
      filter: queryReview.filter ?? persistedReview?.filter ?? 'ALL',
      mediaTypeFilter: queryReview.mediaTypeFilter ?? persistedReview?.mediaTypeFilter ?? 'ALL',
      dateFilter: queryReview.dateFilter ?? persistedReview?.dateFilter ?? 'ALL',
      sort: queryReview.sort ?? persistedReview?.sort ?? '-created_at',
      search: queryReview.search ?? persistedReview?.search ?? '',
      batchOnly: persistedReview?.batchOnly ?? false,
      batchIds: persistedReview?.batchIds ?? [],
    },
    libraryWorkspace: {
      search: queryLibrary.search ?? persistedLibrary?.search ?? '',
      sort: queryLibrary.sort ?? persistedLibrary?.sort ?? '-created_at',
    },
  }
}

export function createAppStore() {
  return configureStore({
    reducer: {
      reviewWorkspace: reviewWorkspaceReducer,
      libraryWorkspace: libraryWorkspaceReducer,
    },
    preloadedState: resolvePreloadedState(),
  })
}

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
