import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AssetDateFilter,
  AssetFilter,
  AssetMediaTypeFilter,
  AssetSort,
} from '../../domain/assets'

export type ReviewWorkspaceState = {
  filter: AssetFilter
  mediaTypeFilter: AssetMediaTypeFilter
  dateFilter: AssetDateFilter
  sort: AssetSort
  search: string
  batchOnly: boolean
  batchIds: string[]
}

const initialState: ReviewWorkspaceState = {
  filter: 'ALL',
  mediaTypeFilter: 'ALL',
  dateFilter: 'ALL',
  sort: '-created_at',
  search: '',
  batchOnly: false,
  batchIds: [],
}

const reviewWorkspaceSlice = createSlice({
  name: 'reviewWorkspace',
  initialState,
  reducers: {
    hydrateReviewWorkspace: (state, action: PayloadAction<Partial<ReviewWorkspaceState>>) => {
      return {
        ...state,
        ...action.payload,
      }
    },
    setReviewFilter: (state, action: PayloadAction<AssetFilter>) => {
      state.filter = action.payload
    },
    setReviewMediaTypeFilter: (state, action: PayloadAction<AssetMediaTypeFilter>) => {
      state.mediaTypeFilter = action.payload
    },
    setReviewDateFilter: (state, action: PayloadAction<AssetDateFilter>) => {
      state.dateFilter = action.payload
    },
    setReviewSort: (state, action: PayloadAction<AssetSort>) => {
      state.sort = action.payload
    },
    setReviewSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
    },
    setReviewBatchOnly: (state, action: PayloadAction<boolean>) => {
      state.batchOnly = action.payload
    },
    setReviewBatchIds: (state, action: PayloadAction<string[]>) => {
      state.batchIds = action.payload
    },
  },
})

export const {
  hydrateReviewWorkspace,
  setReviewFilter,
  setReviewMediaTypeFilter,
  setReviewDateFilter,
  setReviewSort,
  setReviewSearch,
  setReviewBatchOnly,
  setReviewBatchIds,
} = reviewWorkspaceSlice.actions

export const reviewWorkspaceReducer = reviewWorkspaceSlice.reducer
