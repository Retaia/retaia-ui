import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AssetDateFilter, AssetMediaTypeFilter, AssetSort } from '../../domain/assets'

export type LibraryWorkspaceState = {
  search: string
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
}

const initialState: LibraryWorkspaceState = {
  search: '',
  mediaTypeFilter: 'ALL',
  dateFilter: 'ALL',
  sort: '-created_at',
}

const libraryWorkspaceSlice = createSlice({
  name: 'libraryWorkspace',
  initialState,
  reducers: {
    hydrateLibraryWorkspace: (state, action: PayloadAction<Partial<LibraryWorkspaceState>>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    setLibrarySearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
    },
    setLibraryMediaTypeFilter: (state, action: PayloadAction<AssetMediaTypeFilter>) => {
      state.mediaTypeFilter = action.payload
    },
    setLibraryDateFilter: (state, action: PayloadAction<AssetDateFilter>) => {
      state.dateFilter = action.payload
    },
    setLibrarySort: (state, action: PayloadAction<AssetSort>) => {
      state.sort = action.payload
    },
  },
})

export const {
  hydrateLibraryWorkspace,
  setLibrarySearch,
  setLibraryMediaTypeFilter,
  setLibraryDateFilter,
  setLibrarySort,
} = libraryWorkspaceSlice.actions

export const libraryWorkspaceReducer = libraryWorkspaceSlice.reducer
