import { createAsyncThunk } from '@reduxjs/toolkit'
import { createAssetSyncWaiter } from '../middleware/assetSyncWaiters'
import {
  assetDecisionSyncRequested,
  assetMetadataSyncRequested,
} from '../slices/assetSyncSlice'

export const syncAssetMetadataThunk = createAsyncThunk(
  'assetSync/syncMetadata',
  async (
    args: { assetId: string; tags: string[]; notes: string },
    { dispatch, rejectWithValue },
  ) => {
    const mutationId = crypto.randomUUID()
    const waiter = createAssetSyncWaiter(mutationId)
    dispatch(
      assetMetadataSyncRequested({
        mutationId,
        assetId: args.assetId,
        tags: args.tags,
        notes: args.notes,
      }),
    )
    try {
      await waiter
      return { mutationId, args }
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const syncAssetDecisionThunk = createAsyncThunk(
  'assetSync/syncDecision',
  async (
    args: { assetId: string; action: 'KEEP' | 'REJECT' },
    { dispatch, rejectWithValue },
  ) => {
    const mutationId = crypto.randomUUID()
    const waiter = createAssetSyncWaiter(mutationId)
    dispatch(
      assetDecisionSyncRequested({
        mutationId,
        assetId: args.assetId,
        action: args.action,
      }),
    )
    try {
      await waiter
      return { mutationId, args }
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)
