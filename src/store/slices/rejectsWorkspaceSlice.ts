import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AssetDateFilter, AssetMediaTypeFilter, AssetSort } from '../../domain/assets'

export type RejectsWorkspaceState = {
  search: string
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
}

const initialState: RejectsWorkspaceState = {
  search: '',
  mediaTypeFilter: 'ALL',
  dateFilter: 'ALL',
  sort: '-created_at',
}

const rejectsWorkspaceSlice = createSlice({
  name: 'rejectsWorkspace',
  initialState,
  reducers: {
    hydrateRejectsWorkspace: (state, action: PayloadAction<Partial<RejectsWorkspaceState>>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    setRejectsSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
    },
    setRejectsMediaTypeFilter: (state, action: PayloadAction<AssetMediaTypeFilter>) => {
      state.mediaTypeFilter = action.payload
    },
    setRejectsDateFilter: (state, action: PayloadAction<AssetDateFilter>) => {
      state.dateFilter = action.payload
    },
    setRejectsSort: (state, action: PayloadAction<AssetSort>) => {
      state.sort = action.payload
    },
  },
})

export const {
  hydrateRejectsWorkspace,
  setRejectsSearch,
  setRejectsMediaTypeFilter,
  setRejectsDateFilter,
  setRejectsSort,
} = rejectsWorkspaceSlice.actions

export const rejectsWorkspaceReducer = rejectsWorkspaceSlice.reducer
