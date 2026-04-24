import { useEffect, useMemo, useState } from 'react'
import {
  BsCardChecklist,
  BsCheck2Circle,
  BsFilterCircle,
  BsInbox,
  BsTag,
  BsTrash3,
  BsXCircle,
} from 'react-icons/bs'
import type { Asset, DecisionAction, ProcessingProfile } from '../../domain/assets'
import { ASSET_STATE_LABEL_KEYS, getStateFromDecision } from '../../domain/assets'
import { getActionAvailability } from '../../domain/actionAvailability'
import { AssetMediaPreview } from './AssetMediaPreview'

function getTranscriptStatusLabel(
  t: (key: string, values?: Record<string, string>) => string,
  status: NonNullable<Asset['transcriptStatus']>,
) {
  if (status === 'DONE') {
    return t('detail.transcriptStatusDone')
  }
  if (status === 'RUNNING') {
    return t('detail.transcriptStatusRunning')
  }
  if (status === 'FAILED') {
    return t('detail.transcriptStatusFailed')
  }
  return t('detail.transcriptStatusNone')
}

function getProcessingProfileLabel(
  t: (key: string, values?: Record<string, string>) => string,
  processingProfile: ProcessingProfile,
) {
  if (processingProfile === 'audio_music') {
    return t('detail.processingProfileAudioMusic')
  }
  if (processingProfile === 'audio_voice') {
    return t('detail.processingProfileAudioVoice')
  }
  if (processingProfile === 'audio_undefined') {
    return t('detail.processingProfileAudioUndefined')
  }
  if (processingProfile === 'video_standard') {
    return t('detail.processingProfileVideoStandard')
  }
  return t('detail.processingProfilePhotoStandard')
}

type PurgeStatus = {
  kind: 'success' | 'error'
  message: string
}

type MetadataStatus = {
  kind: 'success' | 'error'
  message: string
}

type DecisionStatus = {
  kind: 'success' | 'error'
  message: string
}

type ProcessingProfileStatus = {
  kind: 'success' | 'error'
  message: string
}

type TransitionStatus = {
  kind: 'success' | 'error'
  message: string
}

type Props = {
  selectedAsset: Asset | null
  availability?: ReturnType<typeof getActionAvailability>
  previewingPurge?: boolean
  executingPurge?: boolean
  purgeStatus?: PurgeStatus | null
  decisionStatus: DecisionStatus | null
  processingProfileStatus?: ProcessingProfileStatus | null
  savingMetadata: boolean
  savingProcessingProfile?: boolean
  metadataStatus: MetadataStatus | null
  t: (key: string, values?: Record<string, string>) => string
  onDecision?: (assetId: string, action: DecisionAction) => void
  onChooseProcessingProfile?: (processingProfile: ProcessingProfile) => Promise<void> | void
  onSaveMetadata: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
  onPreviewPurge?: () => Promise<void>
  onExecutePurge?: () => Promise<void>
  onRefreshAsset?: () => Promise<void>
  showRefreshAction?: boolean
  refreshingAsset?: boolean
  showDecisionActions?: boolean
  showPurgeActions?: boolean
  showLibraryActions?: boolean
  onReopenAsset?: () => Promise<void>
  onReprocessAsset?: () => Promise<void>
  reopeningAsset?: boolean
  reprocessingAsset?: boolean
  transitionStatus?: TransitionStatus | null
  onOpenStandaloneDetail?: (assetId: string) => void
  standaloneHref?: string
  onKeywordClick?: (keyword: string) => void
  onMetadataDirtyChange?: (dirty: boolean) => void
  layoutMode?: 'inline' | 'sidebar'
  onClose?: () => void
}

type MetadataEditorProps = {
  selectedAsset: Asset
  savingMetadata: boolean
  t: (key: string, values?: Record<string, string>) => string
  onSaveMetadata: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
  onKeywordClick?: (keyword: string) => void
  onMetadataDirtyChange?: (dirty: boolean) => void
}

function MetadataEditor({
  selectedAsset,
  savingMetadata,
  t,
  onSaveMetadata,
  onKeywordClick,
  onMetadataDirtyChange,
}: MetadataEditorProps) {
  const [tagInput, setTagInput] = useState('')
  const [tagsDraft, setTagsDraft] = useState<string[]>(() => selectedAsset.tags ?? [])
  const [notesDraft, setNotesDraft] = useState(() => selectedAsset.notes ?? '')
  const initialTags = useMemo(
    () => [...(selectedAsset.tags ?? [])].sort(),
    [selectedAsset.tags],
  )
  const currentTags = useMemo(
    () => [...tagsDraft].sort(),
    [tagsDraft],
  )
  const isDirty = notesDraft !== (selectedAsset.notes ?? '') || initialTags.join('|') !== currentTags.join('|')

  useEffect(() => {
    onMetadataDirtyChange?.(isDirty)
  }, [isDirty, onMetadataDirtyChange])

  return (
    <section className="border rounded p-3 mt-3" aria-label={t('detail.taggingTitle')}>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">
        <BsTag className="mr-1 inline-block" aria-hidden="true" />
        {t('detail.taggingTitle')}
      </h3>
      <div className="flex flex-wrap gap-2 mb-2" data-testid="asset-tag-list">
        {tagsDraft.length > 0 ? (
          tagsDraft.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {onKeywordClick ? (
                <button
                  type="button"
                  data-testid="asset-tag-filter"
                  className="p-0 text-xs text-gray-700 underline"
                  onClick={() => onKeywordClick(tag)}
                >
                  {tag}
                </button>
              ) : (
                tag
              )}
              <button
                type="button"
                className="ml-1 p-0 text-xs text-gray-700"
                onClick={() => {
                  setTagsDraft((current) => current.filter((value) => value !== tag))
                }}
                aria-label={t('detail.removeTag', { tag })}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">{t('detail.noTags')}</span>
        )}
      </div>
      <label htmlFor="asset-tag-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
        {t('detail.tagInputLabel')}
      </label>
      <div className="mb-2 flex gap-2">
        <input
          id="asset-tag-input"
          data-testid="asset-tag-input"
          value={tagInput}
          onChange={(event) => {
            setTagInput(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') {
              return
            }
            event.preventDefault()
            const normalized = tagInput.trim()
            if (!normalized || tagsDraft.includes(normalized)) {
              return
            }
            setTagsDraft((current) => [...current, normalized])
            setTagInput('')
          }}
          placeholder={t('detail.tagInputPlaceholder')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="asset-tag-add"
          onClick={() => {
            const normalized = tagInput.trim()
            if (!normalized || tagsDraft.includes(normalized)) {
              return
            }
            setTagsDraft((current) => [...current, normalized])
            setTagInput('')
          }}
          disabled={tagInput.trim().length === 0}
        >
          {t('detail.addTag')}
        </button>
      </div>
      <label htmlFor="asset-notes-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
        {t('detail.notesLabel')}
      </label>
      <textarea
        id="asset-notes-input"
        rows={3}
        data-testid="asset-notes-input"
        value={notesDraft}
        onChange={(event) => {
          setNotesDraft(event.currentTarget.value)
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <div className="mt-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="asset-tag-save"
          onClick={() => void onSaveMetadata(selectedAsset.id, {
            tags: tagsDraft,
            notes: notesDraft,
          })}
          disabled={savingMetadata}
        >
          {savingMetadata ? t('detail.taggingSaving') : t('detail.taggingSave')}
        </button>
      </div>
    </section>
  )
}

export function AssetDetailPanel({
  selectedAsset,
  availability,
  previewingPurge = false,
  executingPurge = false,
  purgeStatus = null,
  decisionStatus,
  processingProfileStatus = null,
  savingMetadata,
  savingProcessingProfile = false,
  metadataStatus,
  t,
  onDecision,
  onChooseProcessingProfile,
  onSaveMetadata,
  onPreviewPurge,
  onExecutePurge,
  onRefreshAsset,
  showRefreshAction = false,
  refreshingAsset = false,
  showDecisionActions = true,
  showPurgeActions = true,
  showLibraryActions = false,
  onReopenAsset,
  onReprocessAsset,
  reopeningAsset = false,
  reprocessingAsset = false,
  transitionStatus = null,
  onOpenStandaloneDetail,
  standaloneHref,
  onKeywordClick,
  onMetadataDirtyChange,
  layoutMode = 'inline',
  onClose,
}: Props) {
  const effectiveAvailability = availability ?? getActionAvailability({
    visibleCount: 0,
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
    purgePreviewMatchesSelected: false,
  })
  const keepDisabled = selectedAsset ? getStateFromDecision('KEEP', selectedAsset.state) === selectedAsset.state : true
  const rejectDisabled = selectedAsset ? getStateFromDecision('REJECT', selectedAsset.state) === selectedAsset.state : true
  const clearDisabled = selectedAsset ? getStateFromDecision('CLEAR', selectedAsset.state) === selectedAsset.state : true

  useEffect(() => {
    if (!selectedAsset) {
      onMetadataDirtyChange?.(false)
    }
  }, [onMetadataDirtyChange, selectedAsset])

  return (
    <section className={layoutMode === 'sidebar' ? 'w-full' : 'w-full xl:w-4/12'} aria-label={t('detail.region')}>
      <div
        className={[
          'h-full rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm',
          layoutMode === 'inline' ? 'xl:sticky xl:top-4' : '',
        ].join(' ').trim()}
      >
          {layoutMode === 'sidebar' ? (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                onClick={onClose}
                data-testid="review-detail-close"
              >
                {t('actions.close')}
              </button>
            </div>
          ) : null}
          <h2 className="text-lg font-semibold text-gray-900">
            <BsCardChecklist className="mr-2 inline-block" aria-hidden="true" />
            {t('detail.title')}
          </h2>
          {selectedAsset ? (
            <div>
              <strong className="block">{selectedAsset.name}</strong>
              <p className="text-gray-500 mb-1">{t('detail.id', { id: selectedAsset.id })}</p>
              <p className="text-gray-500 mb-3">
                {t('detail.state', { state: t(ASSET_STATE_LABEL_KEYS[selectedAsset.state]) })}
              </p>
              {selectedAsset.processingProfile ? (
                <p className="text-gray-500 mb-3">
                  {t('detail.processingProfileCurrent', {
                    profile: getProcessingProfileLabel(t, selectedAsset.processingProfile),
                  })}
                </p>
              ) : null}
              <section className="mb-3" aria-label={t('detail.previewTitle')}>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{t('detail.previewTitle')}</h3>
                <AssetMediaPreview selectedAsset={selectedAsset} t={t} />
              </section>
              {selectedAsset.transcriptPreview ? (
                <section className="mb-3" aria-label={t('detail.transcriptTitle')}>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900">{t('detail.transcriptTitle')}</h3>
                  {selectedAsset.transcriptStatus ? (
                    <p className="text-xs text-gray-500 mb-1">
                      {t('detail.transcriptStatus', {
                        status: getTranscriptStatusLabel(t, selectedAsset.transcriptStatus),
                      })}
                    </p>
                  ) : null}
                  <p className="text-xs mb-0" data-testid="asset-transcript-preview">
                    {selectedAsset.transcriptPreview}
                  </p>
                </section>
              ) : null}
              {onOpenStandaloneDetail || standaloneHref ? (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {onOpenStandaloneDetail ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        data-testid="asset-open-standalone"
                        onClick={() => onOpenStandaloneDetail(selectedAsset.id)}
                      >
                        {t('detail.openStandalone')}
                      </button>
                    ) : null}
                    {standaloneHref ? (
                      <a
                        href={standaloneHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        data-testid="asset-open-standalone-new-tab"
                      >
                        {t('detail.openStandaloneNewTab')}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {showDecisionActions && onDecision ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-success-300 bg-white px-3 py-2 text-sm font-semibold text-success-700 transition-colors hover:bg-success-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onDecision(selectedAsset.id, 'KEEP')}
                    disabled={keepDisabled}
                  >
                    <BsCheck2Circle className="mr-1" aria-hidden="true" />
                    {t('actions.decisionKeep')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onDecision(selectedAsset.id, 'REJECT')}
                    disabled={rejectDisabled}
                  >
                    <BsXCircle className="mr-1" aria-hidden="true" />
                    {t('actions.decisionReject')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onDecision(selectedAsset.id, 'CLEAR')}
                    disabled={clearDisabled}
                  >
                    <BsTrash3 className="mr-1" aria-hidden="true" />
                    {t('actions.decisionClear')}
                  </button>
                </div>
              ) : null}
              {selectedAsset.state === 'REVIEW_PENDING_PROFILE' && onChooseProcessingProfile ? (
                <section className="border border-2 border-warning-200 rounded p-3 mt-3" aria-label={t('detail.processingProfileTitle')}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">{t('detail.processingProfileTitle')}</h3>
                  <p className="text-xs text-gray-500 mb-2">{t('detail.processingProfileBody')}</p>
                  <p className="text-xs text-warning-700 mb-2">{t('detail.processingProfileDecisionBlocked')}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void onChooseProcessingProfile('audio_music')}
                      disabled={savingProcessingProfile || selectedAsset.processingProfile === 'audio_music'}
                      data-testid="asset-processing-profile-music"
                    >
                      {savingProcessingProfile ? t('detail.processingProfileSaving') : t('detail.processingProfileAudioMusic')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void onChooseProcessingProfile('audio_voice')}
                      disabled={savingProcessingProfile || selectedAsset.processingProfile === 'audio_voice'}
                      data-testid="asset-processing-profile-voice"
                    >
                      {savingProcessingProfile ? t('detail.processingProfileSaving') : t('detail.processingProfileAudioVoice')}
                    </button>
                  </div>
                </section>
              ) : null}
              <MetadataEditor
                key={selectedAsset.id}
                selectedAsset={selectedAsset}
                savingMetadata={savingMetadata}
                t={t}
                onSaveMetadata={onSaveMetadata}
                onKeywordClick={onKeywordClick}
                onMetadataDirtyChange={onMetadataDirtyChange}
              />
              {showLibraryActions && (onReopenAsset || onReprocessAsset) ? (
                <section className="border rounded p-3 mt-3" aria-label={t('actions.requalificationTitle')}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">{t('actions.requalificationTitle')}</h3>
                  <p className="text-xs text-gray-500 mb-2">{t('actions.requalificationHelp')}</p>
                  <div className="flex flex-wrap gap-2">
                    {onReopenAsset ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void onReopenAsset()}
                        disabled={reopeningAsset || reprocessingAsset}
                        data-testid="asset-reopen-action"
                      >
                        {reopeningAsset ? t('actions.reopening') : t('actions.reopen')}
                      </button>
                    ) : null}
                    {onReprocessAsset ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void onReprocessAsset()}
                        disabled={reopeningAsset || reprocessingAsset}
                        data-testid="asset-reprocess-action"
                      >
                        {reprocessingAsset ? t('actions.reprocessing') : t('actions.reprocess')}
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : null}
              {showPurgeActions && onPreviewPurge && onExecutePurge ? (
                <section className="border border-2 border-error-200 rounded p-3 mt-3">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">{t('actions.purgeTitle')}</h3>
                  <p className="text-xs text-gray-500 mb-2">{t('actions.purgeHelp')}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void onPreviewPurge()}
                      disabled={effectiveAvailability.previewPurgeDisabled}
                    >
                      <BsFilterCircle className="mr-1" aria-hidden="true" />
                      {previewingPurge ? t('actions.purgePreviewing') : t('actions.purgePreview')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-error-500 bg-error-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void onExecutePurge()}
                      disabled={effectiveAvailability.executePurgeDisabled}
                    >
                      <BsTrash3 className="mr-1" aria-hidden="true" />
                      {executingPurge ? t('actions.purging') : t('actions.purgeConfirm')}
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-500 mb-0">
              <BsInbox className="mr-1 inline-block" aria-hidden="true" />
              {t('detail.empty')}
            </p>
          )}
          {purgeStatus ? (
            <p
              data-testid="asset-purge-status"
              role="status"
              aria-live="polite"
              className={[
                'text-xs',
                'mt-3',
                'mb-0',
                purgeStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
              ].join(' ')}
            >
              {purgeStatus.message}
            </p>
          ) : null}
          {transitionStatus ? (
            <p
              data-testid="asset-transition-status"
              role="status"
              aria-live="polite"
              className={[
                'text-xs',
                transitionStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
              ].join(' ')}
            >
              {transitionStatus.message}
            </p>
          ) : null}
          {decisionStatus ? (
            <p
              data-testid="asset-decision-status"
              role="status"
              aria-live="polite"
              className={[
                'text-xs',
                'mt-2',
                'mb-0',
                decisionStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
              ].join(' ')}
            >
              {decisionStatus.message}
            </p>
          ) : null}
          {processingProfileStatus ? (
            <p
              data-testid="asset-processing-profile-status"
              role="status"
              aria-live="polite"
              className={[
                'text-xs',
                'mt-2',
                'mb-0',
                processingProfileStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
              ].join(' ')}
            >
              {processingProfileStatus.message}
            </p>
          ) : null}
          {metadataStatus ? (
            <p
              data-testid="asset-metadata-status"
              role="status"
              aria-live="polite"
              className={[
                'text-xs',
                'mt-2',
                'mb-0',
                metadataStatus.kind === 'success' ? 'text-success-700' : 'text-error-700',
              ].join(' ')}
            >
              {metadataStatus.message}
            </p>
          ) : null}
          {selectedAsset && showRefreshAction && onRefreshAsset ? (
            <div className="mt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="asset-refresh-action"
                onClick={() => void onRefreshAsset()}
                disabled={refreshingAsset}
              >
                {refreshingAsset ? t('detail.refreshing') : t('detail.refreshAction')}
              </button>
            </div>
          ) : null}
      </div>
    </section>
  )
}
