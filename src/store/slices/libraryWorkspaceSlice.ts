import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AssetSort } from '../../domain/assets'

export type LibraryWorkspaceState = {
  search: string
  sort: AssetSort
}

const initialState: LibraryWorkspaceState = {
  search: '',
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
    setLibrarySort: (state, action: PayloadAction<AssetSort>) => {
      state.sort = action.payload
    },
  },
})

export const {
  hydrateLibraryWorkspace,
  setLibrarySearch,
  setLibrarySort,
} = libraryWorkspaceSlice.actions

export const libraryWorkspaceReducer = libraryWorkspaceSlice.reducer
