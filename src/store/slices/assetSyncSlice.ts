import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AssetState } from '../../domain/assets'

type AssetPatch = {
  tags?: string[]
  notes?: string
  state?: AssetState
  updatedAt: string
}

type PendingMutation =
  | {
      kind: 'metadata'
      assetId: string
      tags: string[]
      notes: string
      revisionEtag?: string | null
    }
  | {
      kind: 'decision'
      assetId: string
      action: 'KEEP' | 'REJECT'
      revisionEtag?: string | null
    }

export type AssetSyncState = {
  patchesById: Record<string, AssetPatch>
  pendingByMutationId: Record<string, PendingMutation>
  lastError: string | null
}

const initialState: AssetSyncState = {
  patchesById: {},
  pendingByMutationId: {},
  lastError: null,
}

const assetSyncSlice = createSlice({
  name: 'assetSync',
  initialState,
  reducers: {
    assetMetadataSyncRequested: (
      state,
      action: PayloadAction<{
        mutationId: string
        assetId: string
        tags: string[]
        notes: string
        revisionEtag?: string | null
      }>,
    ) => {
      state.pendingByMutationId[action.payload.mutationId] = {
        kind: 'metadata',
        assetId: action.payload.assetId,
        tags: action.payload.tags,
        notes: action.payload.notes,
        revisionEtag: action.payload.revisionEtag,
      }
      state.lastError = null
    },
    assetDecisionSyncRequested: (
      state,
      action: PayloadAction<{
        mutationId: string
        assetId: string
        action: 'KEEP' | 'REJECT'
        revisionEtag?: string | null
      }>,
    ) => {
      state.pendingByMutationId[action.payload.mutationId] = {
        kind: 'decision',
        assetId: action.payload.assetId,
        action: action.payload.action,
        revisionEtag: action.payload.revisionEtag,
      }
      state.lastError = null
    },
    assetSyncSucceeded: (
      state,
      action: PayloadAction<{ mutationId: string; assetId: string; patch: Omit<AssetPatch, 'updatedAt'> }>,
    ) => {
      const current = state.patchesById[action.payload.assetId] ?? { updatedAt: new Date().toISOString() }
      state.patchesById[action.payload.assetId] = {
        ...current,
        ...action.payload.patch,
        updatedAt: new Date().toISOString(),
      }
      delete state.pendingByMutationId[action.payload.mutationId]
    },
    assetSyncFailed: (
      state,
      action: PayloadAction<{ mutationId: string; message: string }>,
    ) => {
      delete state.pendingByMutationId[action.payload.mutationId]
      state.lastError = action.payload.message
    },
    clearAssetSyncError: (state) => {
      state.lastError = null
    },
  },
})

export const {
  assetMetadataSyncRequested,
  assetDecisionSyncRequested,
  assetSyncSucceeded,
  assetSyncFailed,
  clearAssetSyncError,
} = assetSyncSlice.actions

export const assetSyncReducer = assetSyncSlice.reducer
