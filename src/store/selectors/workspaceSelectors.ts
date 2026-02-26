import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

export const selectReviewWorkspaceState = (state: RootState) => state.reviewWorkspace
export const selectLibraryWorkspaceState = (state: RootState) => state.libraryWorkspace

export const selectReviewWorkspaceQueryModel = createSelector(
  [selectReviewWorkspaceState],
  (workspace) => ({
    filter: workspace.filter,
    mediaTypeFilter: workspace.mediaTypeFilter,
    dateFilter: workspace.dateFilter,
    sort: workspace.sort,
    search: workspace.search,
    batchOnly: workspace.batchOnly,
    batchIds: workspace.batchIds,
  }),
)

export const selectLibraryWorkspaceQueryModel = createSelector(
  [selectLibraryWorkspaceState],
  (workspace) => ({
    search: workspace.search,
    sort: workspace.sort,
  }),
)
