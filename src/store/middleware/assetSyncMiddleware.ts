import type { Middleware } from '@reduxjs/toolkit'
import { createApiClient } from '../../api/client'
import { mapReviewApiErrorToMessage } from '../../infrastructure/review/apiReviewErrorAdapter'
import {
  assetDecisionSyncRequested,
  assetMetadataSyncRequested,
  assetProcessingProfileSyncRequested,
  assetSyncFailed,
  assetSyncSucceeded,
} from '../slices/assetSyncSlice'
import { rejectAssetSyncWaiter, resolveAssetSyncWaiter } from './assetSyncWaiters'
import { i18next } from '../../i18n'

const DEFAULT_API_BASE_URL = '/api/v1'

type AuthRuntimeState = {
  authUi: {
    apiBaseUrlInput: string
    apiTokenInput: string
  }
}

function resolveApiRuntime(state: AuthRuntimeState) {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
  const tokenFromEnv = String(import.meta.env.VITE_API_TOKEN ?? '').trim()
  const baseUrlInput = state.authUi.apiBaseUrlInput.trim()
  const tokenInput = state.authUi.apiTokenInput.trim()
  return {
    baseUrl: baseUrl || baseUrlInput || DEFAULT_API_BASE_URL,
    token: tokenFromEnv || tokenInput || null,
  }
}

function normalizeSerializableError(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { message: String(error) }
  }
  const candidate = error as {
    status?: unknown
    message?: unknown
    payload?: unknown
  }
  return {
    ...(typeof candidate.status === 'number' ? { status: candidate.status } : {}),
    ...(typeof candidate.message === 'string' ? { message: candidate.message } : {}),
    ...(typeof candidate.payload === 'object' && candidate.payload !== null ? { payload: candidate.payload } : {}),
  }
}

export const assetSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)

  if (assetMetadataSyncRequested.match(action)) {
    const payload = action.payload
    const runtime = resolveApiRuntime(store.getState() as AuthRuntimeState)
    const apiClient = createApiClient({
      baseUrl: runtime.baseUrl,
      getAccessToken: () => runtime.token,
      getAcceptLanguage: () => i18next.resolvedLanguage ?? i18next.language ?? null,
    })
    void apiClient
      .updateAssetMetadata(payload.assetId, {
        tags: payload.tags,
        notes: payload.notes,
      }, payload.revisionEtag)
      .then(() => {
        store.dispatch(
          assetSyncSucceeded({
            mutationId: payload.mutationId,
            assetId: payload.assetId,
            patch: {
              tags: payload.tags,
              notes: payload.notes,
            },
          }),
        )
        resolveAssetSyncWaiter(payload.mutationId)
      })
      .catch((error) => {
        const message = mapReviewApiErrorToMessage(error, i18next.t.bind(i18next))
        store.dispatch(
          assetSyncFailed({
            mutationId: payload.mutationId,
            message,
          }),
        )
        rejectAssetSyncWaiter(payload.mutationId, normalizeSerializableError(error))
      })
  }

  if (assetDecisionSyncRequested.match(action)) {
    const payload = action.payload
    const runtime = resolveApiRuntime(store.getState() as AuthRuntimeState)
    const apiClient = createApiClient({
      baseUrl: runtime.baseUrl,
      getAccessToken: () => runtime.token,
      getAcceptLanguage: () => i18next.resolvedLanguage ?? i18next.language ?? null,
    })
    void apiClient
      .submitAssetDecision(
        payload.assetId,
        { state: payload.action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT' },
        undefined,
        payload.revisionEtag,
      )
      .then(() => {
        store.dispatch(
          assetSyncSucceeded({
            mutationId: payload.mutationId,
            assetId: payload.assetId,
            patch: {
              state: payload.action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT',
            },
          }),
        )
        resolveAssetSyncWaiter(payload.mutationId)
      })
      .catch((error) => {
        const message = mapReviewApiErrorToMessage(error, i18next.t.bind(i18next))
        store.dispatch(
          assetSyncFailed({
            mutationId: payload.mutationId,
            message,
          }),
        )
        rejectAssetSyncWaiter(payload.mutationId, normalizeSerializableError(error))
      })
  }

  if (assetProcessingProfileSyncRequested.match(action)) {
    const payload = action.payload
    const runtime = resolveApiRuntime(store.getState() as AuthRuntimeState)
    const apiClient = createApiClient({
      baseUrl: runtime.baseUrl,
      getAccessToken: () => runtime.token,
      getAcceptLanguage: () => i18next.resolvedLanguage ?? i18next.language ?? null,
    })
    void apiClient
      .updateAssetProcessingProfile(
        payload.assetId,
        { processing_profile: payload.processingProfile },
        payload.revisionEtag,
      )
      .then(() => {
        store.dispatch(
          assetSyncSucceeded({
            mutationId: payload.mutationId,
            assetId: payload.assetId,
            patch: {
              processingProfile: payload.processingProfile,
            },
          }),
        )
        resolveAssetSyncWaiter(payload.mutationId)
      })
      .catch((error) => {
        const message = mapReviewApiErrorToMessage(error, i18next.t.bind(i18next))
        store.dispatch(
          assetSyncFailed({
            mutationId: payload.mutationId,
            message,
          }),
        )
        rejectAssetSyncWaiter(payload.mutationId, normalizeSerializableError(error))
      })
  }

  return result
}
