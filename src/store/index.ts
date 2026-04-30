import { configureStore } from '@reduxjs/toolkit'
import { libraryWorkspaceReducer } from './slices/libraryWorkspaceSlice'
import { rejectsWorkspaceReducer } from './slices/rejectsWorkspaceSlice'
import { reviewWorkspaceReducer } from './slices/reviewWorkspaceSlice'
import { authUiReducer, createInitialAuthUiState } from './slices/authUiSlice'
import { assetSyncReducer } from './slices/assetSyncSlice'
import { readLibraryFilterParams, readRejectsFilterParams, readReviewFilterParams } from '../services/workspaceQueryParams'
import { combineReducers } from 'redux'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { assetSyncMiddleware } from './middleware/assetSyncMiddleware'

const rootReducer = combineReducers({
  reviewWorkspace: reviewWorkspaceReducer,
  libraryWorkspace: libraryWorkspaceReducer,
  rejectsWorkspace: rejectsWorkspaceReducer,
  authUi: authUiReducer,
  assetSync: assetSyncReducer,
})

const persistedReducer = persistReducer(
  {
    key: 'retaia-ui',
    storage,
    whitelist: ['reviewWorkspace', 'libraryWorkspace', 'rejectsWorkspace', 'authUi'],
  },
  rootReducer,
)

function resolvePreloadedState(): ReturnType<typeof rootReducer> {
  const queryReview = readReviewFilterParams()
  const queryLibrary = readLibraryFilterParams()
  const queryRejects = readRejectsFilterParams()

  return {
    reviewWorkspace: {
      filter: queryReview.filter ?? 'WORK_QUEUE',
      mediaTypeFilter: queryReview.mediaTypeFilter ?? 'ALL',
      dateFilter: queryReview.dateFilter ?? 'ALL',
      sort: queryReview.sort ?? '-created_at',
      search: queryReview.search ?? '',
      batchOnly: false,
      batchIds: [],
    },
    libraryWorkspace: {
      search: queryLibrary.search ?? '',
      mediaTypeFilter: queryLibrary.mediaTypeFilter ?? 'ALL',
      dateFilter: queryLibrary.dateFilter ?? 'ALL',
      sort: queryLibrary.sort ?? '-created_at',
    },
    rejectsWorkspace: {
      search: queryRejects.search ?? '',
      mediaTypeFilter: queryRejects.mediaTypeFilter ?? 'ALL',
      dateFilter: queryRejects.dateFilter ?? 'ALL',
      sort: queryRejects.sort ?? '-created_at',
    },
    authUi: createInitialAuthUiState(),
    assetSync: {
      patchesById: {},
      pendingByMutationId: {},
      lastError: null,
    },
  }
}

export function createAppStore() {
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState: resolvePreloadedState() as unknown as ReturnType<typeof persistedReducer>,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredActionPaths: ['meta.arg'],
        },
      }).concat(assetSyncMiddleware),
  })
  return store
}

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export function createAppPersistor(store: AppStore) {
  return persistStore(store)
}
