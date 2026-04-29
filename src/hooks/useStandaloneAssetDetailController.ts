import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { mapApiSummaryToAsset } from '../api/assetMapper'
import { INITIAL_ASSETS } from '../data/mockAssets'
import { getActionAvailability } from '../domain/actionAvailability'
import {
  getStateFromDecision,
  type Asset,
  type AssetState,
  type DecisionAction,
  type ProcessingProfile,
} from '../domain/assets'
import { mergeAssetWithDetail } from '../domain/review/assetDetailMerge'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import { usePurgeFlow } from './usePurgeFlow'
import { useReviewApiRuntime } from './useReviewApiRuntime'

type Context = 'review' | 'library' | 'rejects'

function resolveLocalStandaloneAsset(context: Context, assetId: string | undefined) {
  if (!assetId) {
    return null
  }
  const asset = INITIAL_ASSETS.find((candidate) => candidate.id === assetId)
  if (!asset) {
    return null
  }
  if (context === 'library') {
    if (asset.state === 'ARCHIVED') {
      return asset
    }
    if (asset.state === 'DECIDED_KEEP') {
      return { ...asset, state: 'ARCHIVED' as const }
    }
    return null
  }
  if (context === 'rejects') {
    if (asset.state === 'REJECTED') {
      return asset
    }
    if (asset.state === 'DECIDED_REJECT') {
      return { ...asset, state: 'REJECTED' as const }
    }
    return null
  }
  return asset
}

function resolveContextQueryState(context: Context): AssetState | undefined {
  if (context === 'library') {
    return 'ARCHIVED'
  }
  if (context === 'rejects') {
    return 'REJECTED'
  }
  return undefined
}

function resolveLocalProcessingProfileState(profile: ProcessingProfile): AssetState {
  if (profile === 'audio_voice') {
    return 'READY'
  }
  if (profile === 'audio_music') {
    return 'DECISION_PENDING'
  }
  return 'REVIEW_PENDING_PROFILE'
}

function getWorkspaceLabel(
  context: Context,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  if (context === 'review') {
    return t('app.nav.review')
  }
  if (context === 'library') {
    return t('app.nav.library')
  }
  return t('app.nav.rejects')
}

export function useStandaloneAssetDetailController(context: Context) {
  const { t } = useTranslation()
  const { assetId } = useParams<{ assetId: string }>()
  const { apiClient, isApiAssetSource, retryStatus, setRetryStatus } = useReviewApiRuntime()
  const localSelectedAsset = useMemo(
    () => resolveLocalStandaloneAsset(context, assetId),
    [assetId, context],
  )
  const [apiSelectedAsset, setApiSelectedAsset] = useState<Asset | null>(null)
  const [localSelectedAssetOverride, setLocalSelectedAssetOverride] = useState<Asset | null>(null)
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [metadataStatus, setMetadataStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [decisionStatus, setDecisionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [processingProfileStatus, setProcessingProfileStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [savingProcessingProfile, setSavingProcessingProfile] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [reopeningAsset, setReopeningAsset] = useState(false)
  const [reprocessingAsset, setReprocessingAsset] = useState(false)
  const [refreshingAsset, setRefreshingAsset] = useState(false)

  useEffect(() => {
    if (!assetId || !isApiAssetSource) {
      return
    }

    let canceled = false
    const load = async () => {
      setLoadingState('loading')
      try {
        const summaries = await apiClient.listAssetSummaries({
          state: resolveContextQueryState(context),
        })
        if (canceled) {
          return
        }
        const mappedSummaries = summaries.map((summary, index) => mapApiSummaryToAsset(summary, index))
        const summaryAsset = mappedSummaries.find((asset) => asset.id === assetId) ?? null
        const detail = await apiClient.getAssetDetail(assetId)
        if (canceled) {
          return
        }

        const fallbackAsset = mapApiSummaryToAsset(detail.summary, 0)
        const merged = mergeAssetWithDetail(summaryAsset ?? fallbackAsset, detail, {
          includeDecisionState: true,
        })
        setApiSelectedAsset(merged)
        setLoadingState('idle')
      } catch {
        if (canceled) {
          return
        }
        setApiSelectedAsset(null)
        setLoadingState('error')
      }
    }

    void load()
    return () => {
      canceled = true
    }
  }, [apiClient, assetId, context, isApiAssetSource])

  const selectedAsset = isApiAssetSource
    ? apiSelectedAsset
    : localSelectedAssetOverride?.id === assetId
      ? localSelectedAssetOverride
      : localSelectedAsset

  const refreshSelectedAsset = useCallback(async () => {
    if (!assetId || !isApiAssetSource || refreshingAsset) {
      return
    }

    setRefreshingAsset(true)
    setRetryStatus(null)
    setDecisionStatus(null)
    try {
      const detail = await apiClient.getAssetDetail(assetId)
      setApiSelectedAsset((current) =>
        mergeAssetWithDetail(current ?? mapApiSummaryToAsset(detail.summary, 0), detail, {
          includeDecisionState: true,
        }),
      )
      setDecisionStatus({
        kind: 'success',
        message: t('detail.refreshDone'),
      })
    } catch (error) {
      setDecisionStatus({
        kind: 'error',
        message: t('detail.refreshError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setRefreshingAsset(false)
      setRetryStatus(null)
    }
  }, [apiClient, assetId, isApiAssetSource, refreshingAsset, setRetryStatus, t])

  const saveMetadata = useCallback(
    async (targetAssetId: string, payload: { tags: string[]; notes: string }) => {
      setSavingMetadata(true)
      setMetadataStatus(null)
      try {
        if (isApiAssetSource) {
          await apiClient.updateAssetMetadata(targetAssetId, payload, selectedAsset?.revisionEtag)
        }
        const updateAsset = (current: Asset | null) =>
          current && current.id === targetAssetId
            ? { ...current, tags: payload.tags, notes: payload.notes }
            : current
        if (isApiAssetSource) {
          setApiSelectedAsset(updateAsset)
        } else {
          setLocalSelectedAssetOverride(updateAsset)
        }
        setMetadataStatus({
          kind: 'success',
          message: t('detail.taggingSaved', { id: targetAssetId }),
        })
      } catch (error) {
        setMetadataStatus({
          kind: 'error',
          message: t('detail.taggingError', {
            message: mapReviewApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setSavingMetadata(false)
      }
    },
    [apiClient, isApiAssetSource, selectedAsset, t],
  )

  const handleDecision = useCallback(
    async (targetAssetId: string, action: DecisionAction) => {
      const targetAsset = selectedAsset?.id === targetAssetId ? selectedAsset : null
      if (!targetAsset) {
        return
      }

      setDecisionStatus(null)
      const nextState = getStateFromDecision(action, targetAsset.state)
      if (nextState === targetAsset.state) {
        return
      }

      try {
        if (isApiAssetSource) {
          const decisionState =
            action === 'KEEP'
              ? 'DECIDED_KEEP'
              : action === 'REJECT'
                ? 'DECIDED_REJECT'
                : 'DECISION_PENDING'
          await apiClient.submitAssetDecision(
            targetAssetId,
            { state: decisionState },
            undefined,
            targetAsset.revisionEtag,
          )
        }
        const updateAsset = (current: Asset | null): Asset | null =>
          current && current.id === targetAssetId ? { ...current, state: nextState } : current
        if (isApiAssetSource) {
          setApiSelectedAsset(updateAsset)
        } else {
          setLocalSelectedAssetOverride(updateAsset)
        }
        setDecisionStatus({
          kind: 'success',
          message: t('detail.decisionSaved', {
            id: targetAssetId,
            action:
              action === 'KEEP'
                ? t('actions.decisionKeep')
                : action === 'REJECT'
                  ? t('actions.decisionReject')
                  : t('actions.decisionClear'),
          }),
        })
      } catch (error) {
        setDecisionStatus({
          kind: 'error',
          message: t('detail.decisionError', {
            message: mapReviewApiErrorToMessage(error, t),
          }),
        })
      }
    },
    [apiClient, isApiAssetSource, selectedAsset, t],
  )

  const chooseProcessingProfile = useCallback(
    async (processingProfile: ProcessingProfile) => {
      if (!selectedAsset) {
        return
      }

      setSavingProcessingProfile(true)
      setProcessingProfileStatus(null)
      try {
        if (isApiAssetSource) {
          await apiClient.updateAssetProcessingProfile(
            selectedAsset.id,
            { processing_profile: processingProfile },
            selectedAsset.revisionEtag,
          )
        }
        const updateAsset = (current: Asset | null): Asset | null =>
          current
            ? {
                ...current,
                processingProfile,
                state: resolveLocalProcessingProfileState(processingProfile),
              }
            : current
        if (isApiAssetSource) {
          setApiSelectedAsset(updateAsset)
        } else {
          setLocalSelectedAssetOverride(updateAsset)
        }
        if (isApiAssetSource) {
          const detail = await apiClient.getAssetDetail(selectedAsset.id)
          setApiSelectedAsset((current) =>
            mergeAssetWithDetail(current ?? mapApiSummaryToAsset(detail.summary, 0), detail, {
              includeDecisionState: true,
            }),
          )
        }
        setProcessingProfileStatus({
          kind: 'success',
          message: t('detail.processingProfileSaved', {
            profile:
              processingProfile === 'audio_music'
                ? t('detail.processingProfileAudioMusic')
                : processingProfile === 'audio_voice'
                  ? t('detail.processingProfileAudioVoice')
                  : processingProfile === 'audio_undefined'
                    ? t('detail.processingProfileAudioUndefined')
                    : processingProfile === 'video_standard'
                      ? t('detail.processingProfileVideoStandard')
                      : t('detail.processingProfilePhotoStandard'),
          }),
        })
      } catch (error) {
        setProcessingProfileStatus({
          kind: 'error',
          message: t('detail.processingProfileError', {
            message: mapReviewApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setSavingProcessingProfile(false)
      }
    },
    [apiClient, isApiAssetSource, selectedAsset, t],
  )

  const reopenAsset = useCallback(async () => {
    if (!selectedAsset || reopeningAsset || reprocessingAsset) {
      return
    }
    setReopeningAsset(true)
    setTransitionStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reopenAsset(selectedAsset.id, selectedAsset.revisionEtag)
      }
      const updateAsset = (current: Asset | null): Asset | null =>
        current ? { ...current, state: 'DECISION_PENDING' as const } : current
      if (isApiAssetSource) {
        setApiSelectedAsset(updateAsset)
      } else {
        setLocalSelectedAssetOverride(updateAsset)
      }
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reopenDone', { id: selectedAsset.id }),
      })
    } catch (error) {
      setTransitionStatus({
        kind: 'error',
        message: t('actions.reopenError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setReopeningAsset(false)
    }
  }, [apiClient, isApiAssetSource, reopeningAsset, reprocessingAsset, selectedAsset, t])

  const reprocessAsset = useCallback(async () => {
    if (!selectedAsset || reopeningAsset || reprocessingAsset) {
      return
    }
    setReprocessingAsset(true)
    setTransitionStatus(null)
    try {
      if (isApiAssetSource) {
        await apiClient.reprocessAsset(
          selectedAsset.id,
          crypto.randomUUID(),
          selectedAsset.revisionEtag,
        )
      }
      const updateAsset = (current: Asset | null): Asset | null =>
        current ? { ...current, state: 'READY' as const } : current
      if (isApiAssetSource) {
        setApiSelectedAsset(updateAsset)
      } else {
        setLocalSelectedAssetOverride(updateAsset)
      }
      setTransitionStatus({
        kind: 'success',
        message: t('actions.reprocessDone', { id: selectedAsset.id }),
      })
    } catch (error) {
      setTransitionStatus({
        kind: 'error',
        message: t('actions.reprocessError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    } finally {
      setReprocessingAsset(false)
    }
  }, [apiClient, isApiAssetSource, reopeningAsset, reprocessingAsset, selectedAsset, t])

  const onPurgeSuccess = useCallback((purgedAssetId: string) => {
    const updateAsset = (current: Asset | null): Asset | null =>
      current && current.id === purgedAssetId ? { ...current, state: 'PURGED' as const } : current
    if (isApiAssetSource) {
      setApiSelectedAsset(updateAsset)
    } else {
      setLocalSelectedAssetOverride(updateAsset)
    }
  }, [isApiAssetSource])

  const {
    previewingPurge,
    executingPurge,
    purgePreviewAssetId,
    purgeStatus,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
  } = usePurgeFlow({
    apiClient,
    selectedAsset,
    t,
    setRetryStatus,
    mapErrorToMessage: (error) => mapReviewApiErrorToMessage(error, t),
    recordAction: () => {},
    onPurgeSuccess,
  })

  const availability = useMemo(
    () =>
      getActionAvailability({
        visibleCount: selectedAsset ? 1 : 0,
        batchCount: 0,
        previewingBatch: false,
        executingBatch: false,
        schedulingBatchExecution: false,
        reportBatchId: null,
        reportLoading: false,
        undoCount: 0,
        selectedAssetState: selectedAsset?.state ?? null,
        previewingPurge,
        executingPurge,
        purgePreviewMatchesSelected: purgePreviewAssetId === selectedAsset?.id,
      }),
    [executingPurge, previewingPurge, purgePreviewAssetId, selectedAsset],
  )

  const routePrefix = context === 'review' ? '/review' : context === 'library' ? '/library' : '/rejects'

  return {
    t,
    assetId,
    selectedAsset,
    loadingState,
    showNotFound: !selectedAsset && loadingState !== 'loading',
    savingMetadata,
    metadataStatus,
    decisionStatus,
    processingProfileStatus,
    savingProcessingProfile,
    availability,
    previewingPurge,
    executingPurge,
    purgeStatus,
    retryStatus,
    transitionStatus,
    reopeningAsset,
    reprocessingAsset,
    refreshingAsset,
    routePrefix,
    workspaceLabel: getWorkspaceLabel(context, t),
    showDecisionActions: context === 'review',
    showLibraryActions: context === 'library' || context === 'rejects',
    showPurgeActions: context === 'rejects',
    showRefreshAction: context === 'review' && isApiAssetSource,
    saveMetadata,
    handleDecision,
    chooseProcessingProfile,
    reopenAsset,
    reprocessAsset,
    previewSelectedAssetPurge,
    executeSelectedAssetPurge,
    refreshSelectedAsset,
  }
}
