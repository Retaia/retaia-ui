import { useState } from 'react'
import { Badge, Button, Card, Col, Form, Stack } from 'react-bootstrap'
import {
  BsCardChecklist,
  BsCheck2Circle,
  BsFilterCircle,
  BsInbox,
  BsTag,
  BsTrash3,
  BsXCircle,
} from 'react-icons/bs'
import ReactPlayer from 'react-player/file'
import type { Asset, DecisionAction } from '../../domain/assets'
import { getActionAvailability } from '../../domain/actionAvailability'

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

type Props = {
  selectedAsset: Asset | null
  availability: ReturnType<typeof getActionAvailability>
  previewingPurge: boolean
  executingPurge: boolean
  purgeStatus: PurgeStatus | null
  decisionStatus: DecisionStatus | null
  savingMetadata: boolean
  metadataStatus: MetadataStatus | null
  t: (key: string, values?: Record<string, string>) => string
  onDecision: (assetId: string, action: DecisionAction) => void
  onSaveMetadata: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
  onPreviewPurge: () => Promise<void>
  onExecutePurge: () => Promise<void>
  onRefreshAsset: () => Promise<void>
  showRefreshAction: boolean
  refreshingAsset: boolean
}

type MetadataEditorProps = {
  selectedAsset: Asset
  savingMetadata: boolean
  t: (key: string, values?: Record<string, string>) => string
  onSaveMetadata: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
}

function buildWaveformBars(seed: string, count = 48): number[] {
  let value = 0
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0
  }

  const bars: number[] = []
  for (let index = 0; index < count; index += 1) {
    value = (value * 1664525 + 1013904223) >>> 0
    const normalized = value / 0xffffffff
    bars.push(Math.round(20 + normalized * 80))
  }
  return bars
}

function MetadataEditor({ selectedAsset, savingMetadata, t, onSaveMetadata }: MetadataEditorProps) {
  const [tagInput, setTagInput] = useState('')
  const [tagsDraft, setTagsDraft] = useState<string[]>(() => selectedAsset.tags ?? [])
  const [notesDraft, setNotesDraft] = useState(() => selectedAsset.notes ?? '')

  return (
    <section className="border rounded p-3 mt-3" aria-label={t('detail.taggingTitle')}>
      <h3 className="h6 mb-2">
        <BsTag className="me-1" aria-hidden="true" />
        {t('detail.taggingTitle')}
      </h3>
      <div className="d-flex flex-wrap gap-2 mb-2" data-testid="asset-tag-list">
        {tagsDraft.length > 0 ? (
          tagsDraft.map((tag) => (
            <Badge key={tag} bg="secondary" className="d-inline-flex align-items-center">
              {tag}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-white text-decoration-none ms-1 p-0"
                onClick={() => {
                  setTagsDraft((current) => current.filter((value) => value !== tag))
                }}
                aria-label={t('detail.removeTag', { tag })}
              >
                ×
              </Button>
            </Badge>
          ))
        ) : (
          <span className="small text-secondary">{t('detail.noTags')}</span>
        )}
      </div>
      <Form.Label htmlFor="asset-tag-input" className="small mb-1">
        {t('detail.tagInputLabel')}
      </Form.Label>
      <Stack direction="horizontal" className="gap-2 mb-2">
        <Form.Control
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
        />
        <Button
          type="button"
          variant="outline-secondary"
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
        </Button>
      </Stack>
      <Form.Label htmlFor="asset-notes-input" className="small mb-1">
        {t('detail.notesLabel')}
      </Form.Label>
      <Form.Control
        id="asset-notes-input"
        as="textarea"
        rows={3}
        data-testid="asset-notes-input"
        value={notesDraft}
        onChange={(event) => {
          setNotesDraft(event.currentTarget.value)
        }}
      />
      <div className="mt-2">
        <Button
          type="button"
          variant="primary"
          data-testid="asset-tag-save"
          onClick={() => void onSaveMetadata(selectedAsset.id, {
            tags: tagsDraft,
            notes: notesDraft,
          })}
          disabled={savingMetadata}
        >
          {savingMetadata ? t('detail.taggingSaving') : t('detail.taggingSave')}
        </Button>
      </div>
    </section>
  )
}

export function AssetDetailPanel({
  selectedAsset,
  availability,
  previewingPurge,
  executingPurge,
  purgeStatus,
  decisionStatus,
  savingMetadata,
  metadataStatus,
  t,
  onDecision,
  onSaveMetadata,
  onPreviewPurge,
  onExecutePurge,
  onRefreshAsset,
  showRefreshAction,
  refreshingAsset,
}: Props) {
  const mediaUrl =
    selectedAsset?.mediaType === 'VIDEO'
      ? selectedAsset.proxyVideoUrl
      : selectedAsset?.mediaType === 'AUDIO'
        ? selectedAsset.proxyAudioUrl
        : selectedAsset?.mediaType === 'IMAGE'
          ? selectedAsset.proxyPhotoUrl
          : null

  return (
    <Col as="section" xs={12} xl={4} aria-label={t('detail.region')}>
      <Card className="shadow-sm border-0 h-100 sticky-xl-top">
        <Card.Body>
          <h2 className="h5">
            <BsCardChecklist className="me-2" aria-hidden="true" />
            {t('detail.title')}
          </h2>
          {selectedAsset ? (
            <div>
              <strong className="d-block">{selectedAsset.name}</strong>
              <p className="text-secondary mb-1">{t('detail.id', { id: selectedAsset.id })}</p>
              <p className="text-secondary mb-3">
                {t('detail.state', { state: selectedAsset.state })}
              </p>
              <section className="mb-3" aria-label={t('detail.previewTitle')}>
                <h3 className="h6 mb-2">{t('detail.previewTitle')}</h3>
                {selectedAsset.mediaType === 'IMAGE' && mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt={selectedAsset.name}
                    className="img-fluid rounded border"
                  />
                ) : selectedAsset.mediaType === 'VIDEO' && mediaUrl ? (
                  <div className="rounded border overflow-hidden">
                    <ReactPlayer
                      url={mediaUrl}
                      controls
                      width="100%"
                      height="220px"
                      config={{
                        attributes: {
                          controlsList: 'nodownload',
                        },
                      }}
                    />
                  </div>
                ) : selectedAsset.mediaType === 'AUDIO' && mediaUrl ? (
                  <div>
                    <ReactPlayer
                      url={mediaUrl}
                      controls
                      width="100%"
                      height="56px"
                      config={{
                        forceAudio: true,
                        attributes: {
                          controlsList: 'nodownload',
                        },
                      }}
                    />
                    {selectedAsset.waveformUrl ? (
                      <img
                        src={selectedAsset.waveformUrl}
                        alt={t('detail.waveformImageAlt', { id: selectedAsset.id })}
                        className="img-fluid rounded border mt-2"
                        data-testid="asset-waveform-image"
                      />
                    ) : (
                      <div
                        className="audio-waveform-fallback mt-2"
                        role="img"
                        aria-label={t('detail.waveformFallbackLabel')}
                        data-testid="asset-waveform-fallback"
                      >
                        {buildWaveformBars(selectedAsset.id).map((height, index) => (
                          <span
                            // Deterministic local fallback: enough for simple timeline orientation without server waveform.
                            key={`${selectedAsset.id}-wave-${index}`}
                            className="audio-waveform-fallback__bar"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="small text-secondary mb-0">{t('detail.previewUnavailable')}</p>
                )}
              </section>
              {selectedAsset.transcriptPreview ? (
                <section className="mb-3" aria-label={t('detail.transcriptTitle')}>
                  <h3 className="h6 mb-1">{t('detail.transcriptTitle')}</h3>
                  {selectedAsset.transcriptStatus ? (
                    <p className="small text-secondary mb-1">
                      {t('detail.transcriptStatus', { status: selectedAsset.transcriptStatus })}
                    </p>
                  ) : null}
                  <p className="small mb-0" data-testid="asset-transcript-preview">
                    {selectedAsset.transcriptPreview}
                  </p>
                </section>
              ) : null}
              <Stack direction="horizontal" className="flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => onDecision(selectedAsset.id, 'KEEP')}
                >
                  <BsCheck2Circle className="me-1" aria-hidden="true" />
                  KEEP
                </Button>
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={() => onDecision(selectedAsset.id, 'REJECT')}
                >
                  <BsXCircle className="me-1" aria-hidden="true" />
                  REJECT
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => onDecision(selectedAsset.id, 'CLEAR')}
                >
                  <BsTrash3 className="me-1" aria-hidden="true" />
                  CLEAR
                </Button>
              </Stack>
              <MetadataEditor
                key={selectedAsset.id}
                selectedAsset={selectedAsset}
                savingMetadata={savingMetadata}
                t={t}
                onSaveMetadata={onSaveMetadata}
              />
              <section className="border border-2 border-danger-subtle rounded p-3 mt-3">
                <h3 className="h6 mb-2">{t('actions.purgeTitle')}</h3>
                <p className="small text-secondary mb-2">{t('actions.purgeHelp')}</p>
                <Stack direction="horizontal" className="flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() => void onPreviewPurge()}
                    disabled={availability.previewPurgeDisabled}
                  >
                    <BsFilterCircle className="me-1" aria-hidden="true" />
                    {previewingPurge ? t('actions.purgePreviewing') : t('actions.purgePreview')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void onExecutePurge()}
                    disabled={availability.executePurgeDisabled}
                  >
                    <BsTrash3 className="me-1" aria-hidden="true" />
                    {executingPurge ? t('actions.purging') : t('actions.purgeConfirm')}
                  </Button>
                </Stack>
              </section>
            </div>
          ) : (
            <p className="text-secondary mb-0">
              <BsInbox className="me-1" aria-hidden="true" />
              {t('detail.empty')}
            </p>
          )}
          {purgeStatus ? (
            <p
              data-testid="asset-purge-status"
              role="status"
              aria-live="polite"
              className={[
                'small',
                'mt-3',
                'mb-0',
                purgeStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {purgeStatus.message}
            </p>
          ) : null}
          {decisionStatus ? (
            <p
              data-testid="asset-decision-status"
              role="status"
              aria-live="polite"
              className={[
                'small',
                'mt-2',
                'mb-0',
                decisionStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {decisionStatus.message}
            </p>
          ) : null}
          {metadataStatus ? (
            <p
              data-testid="asset-metadata-status"
              role="status"
              aria-live="polite"
              className={[
                'small',
                'mt-2',
                'mb-0',
                metadataStatus.kind === 'success' ? 'text-success' : 'text-danger',
              ].join(' ')}
            >
              {metadataStatus.message}
            </p>
          ) : null}
          {selectedAsset && showRefreshAction ? (
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                data-testid="asset-refresh-action"
                onClick={() => void onRefreshAsset()}
                disabled={refreshingAsset}
              >
                {refreshingAsset ? t('detail.refreshing') : t('detail.refreshAction')}
              </Button>
            </div>
          ) : null}
        </Card.Body>
      </Card>
    </Col>
  )
}
