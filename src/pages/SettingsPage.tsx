import { useMemo, useState } from 'react'
import { Button, Card, Container, Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useApiClient } from '../hooks/useApiClient'
import { mapReviewApiErrorToMessage } from '../infrastructure/review/apiReviewErrorAdapter'
import {
  clearAssetSource,
  persistAssetSource,
  readStoredAssetSource,
  type AssetSourceSetting,
} from '../services/apiSession'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setApiBaseUrlInput, setApiTokenInput } from '../store/slices/authUiSlice'

type Status = {
  kind: 'success' | 'error'
  message: string
} | null

function resolveEnvAssetSource(value: unknown): AssetSourceSetting | null {
  const envSource = String(value ?? '')
    .trim()
    .toLowerCase()
  if (envSource === 'api' || envSource === 'mock') {
    return envSource
  }
  return null
}

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const apiBaseUrlInput = useAppSelector((state) => state.authUi.apiBaseUrlInput)
  const apiTokenInput = useAppSelector((state) => state.authUi.apiTokenInput)
  const [assetSourceInput, setAssetSourceInput] = useState<AssetSourceSetting>(
    readStoredAssetSource() || 'mock',
  )
  const [connectionStatus, setConnectionStatus] = useState<Status>(null)
  const [assetSourceStatus, setAssetSourceStatus] = useState<Status>(null)

  const {
    apiClient,
    effectiveApiBaseUrl,
    effectiveApiToken,
    isApiBaseUrlLockedByEnv,
    isApiAuthLockedByEnv,
    isApiConfigLockedByEnv,
  } = useApiClient({
    apiBaseUrlInput,
    apiTokenInput,
  })

  const envAssetSource = resolveEnvAssetSource(import.meta.env.VITE_ASSET_SOURCE)
  const isAssetSourceLockedByEnv = envAssetSource !== null
  const effectiveAssetSource = envAssetSource ?? assetSourceInput
  const shouldUseInMemoryMockDb = useMemo(
    () => String(import.meta.env.APP_ENV ?? import.meta.env.VITE_APP_ENV ?? '').toLowerCase() === 'test',
    [],
  )

  const saveConnectionSettings = () => {
    const nextBaseUrl = apiBaseUrlInput.trim()
    const nextToken = apiTokenInput.trim()
    if (!isApiBaseUrlLockedByEnv) {
      dispatch(setApiBaseUrlInput(nextBaseUrl))
    }

    if (!isApiAuthLockedByEnv) {
      dispatch(setApiTokenInput(nextToken))
    }

    setConnectionStatus(
      { kind: 'success', message: t('settings.connectionSaved') },
    )
  }

  const clearConnectionSettings = () => {
    if (!isApiBaseUrlLockedByEnv) {
      dispatch(setApiBaseUrlInput(''))
    }
    if (!isApiAuthLockedByEnv) {
      dispatch(setApiTokenInput(''))
    }
    setConnectionStatus(
      { kind: 'success', message: t('settings.connectionCleared') },
    )
  }

  const testConnection = async () => {
    setConnectionStatus(null)
    try {
      await apiClient.getCurrentUser()
      setConnectionStatus({ kind: 'success', message: t('settings.connectionTestOk') })
    } catch (error) {
      setConnectionStatus({
        kind: 'error',
        message: t('settings.connectionTestError', {
          message: mapReviewApiErrorToMessage(error, t),
        }),
      })
    }
  }

  const saveAssetSource = () => {
    if (isAssetSourceLockedByEnv) {
      return
    }
    const ok = persistAssetSource(assetSourceInput)
    setAssetSourceStatus(
      ok
        ? { kind: 'success', message: t('settings.assetSourceSaved') }
        : { kind: 'error', message: t('settings.assetSourceSaveError') },
    )
  }

  const clearAssetSourceSetting = () => {
    if (isAssetSourceLockedByEnv) {
      return
    }
    const ok = clearAssetSource()
    setAssetSourceInput('mock')
    setAssetSourceStatus(
      ok
        ? { kind: 'success', message: t('settings.assetSourceCleared') }
        : { kind: 'error', message: t('settings.assetSourceSaveError') },
    )
  }

  return (
    <Container as="main" className="py-4">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="display-6 fw-bold mb-1">{t('settings.title')}</h1>
          <p className="text-secondary mb-0">{t('settings.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          <Button type="button" size="sm" variant="outline-secondary" onClick={() => navigate('/auth')}>
            {t('settings.openAuth')}
          </Button>
          <Button type="button" size="sm" variant="outline-secondary" onClick={() => navigate('/review')}>
            {t('app.backToReview')}
          </Button>
        </div>
      </div>

      <Card as="section" className="shadow-sm border-0 mb-3" aria-label={t('settings.lockedSection')}>
        <Card.Body>
          <h2 className="h6 mb-2">{t('settings.lockedSection')}</h2>
          <ul className="small mb-0">
            <li>{t('settings.effectiveApiBaseUrl', { value: effectiveApiBaseUrl })}</li>
            <li>
              {t('settings.effectiveApiToken', {
                value: effectiveApiToken ? t('settings.defined') : t('settings.notDefined'),
              })}
            </li>
            <li>{t('settings.effectiveAssetSource', { value: effectiveAssetSource.toUpperCase() })}</li>
            <li>{t('settings.mockDbMode', { value: shouldUseInMemoryMockDb ? 'ON' : 'OFF' })}</li>
          </ul>
          {isApiConfigLockedByEnv ? (
            <p className="small text-secondary mt-2 mb-0">{t('app.apiConnectionEnvLocked')}</p>
          ) : null}
          {isAssetSourceLockedByEnv ? (
            <p className="small text-secondary mt-2 mb-0">{t('settings.assetSourceEnvLocked')}</p>
          ) : null}
        </Card.Body>
      </Card>

      <Card as="section" className="shadow-sm border-0 mb-3" aria-label={t('settings.connectionSection')}>
        <Card.Body>
          <h2 className="h6 mb-3">{t('settings.connectionSection')}</h2>
          <Form.Label htmlFor="settings-api-base-url-input" className="small mb-1">
            {t('app.apiBaseUrlLabel')}
          </Form.Label>
          <Form.Control
            id="settings-api-base-url-input"
            data-testid="settings-api-base-url-input"
            value={apiBaseUrlInput}
            onChange={(event) => dispatch(setApiBaseUrlInput(event.target.value))}
            placeholder="/api/v1"
            disabled={isApiBaseUrlLockedByEnv}
          />
          <Form.Label htmlFor="settings-api-token-input" className="small mb-1 mt-3">
            {t('settings.apiTokenLabel')}
          </Form.Label>
          <Form.Control
            id="settings-api-token-input"
            data-testid="settings-api-token-input"
            value={apiTokenInput}
            onChange={(event) => dispatch(setApiTokenInput(event.target.value))}
            placeholder={t('settings.apiTokenPlaceholder')}
            disabled={isApiAuthLockedByEnv}
          />

          <div className="d-flex flex-wrap gap-2 mt-3">
            <Button type="button" size="sm" variant="primary" onClick={saveConnectionSettings}>
              {t('app.apiConnectionSave')}
            </Button>
            <Button type="button" size="sm" variant="outline-primary" onClick={() => void testConnection()}>
              {t('app.apiConnectionTest')}
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={clearConnectionSettings}>
              {t('app.apiConnectionClear')}
            </Button>
          </div>

          {connectionStatus ? (
            <p
              className={`small mt-2 mb-0 ${connectionStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
              data-testid="settings-connection-status"
              role="status"
              aria-live="polite"
            >
              {connectionStatus.message}
            </p>
          ) : null}
        </Card.Body>
      </Card>

      <Card as="section" className="shadow-sm border-0" aria-label={t('settings.assetSourceSection')}>
        <Card.Body>
          <h2 className="h6 mb-2">{t('settings.assetSourceSection')}</h2>
          <Form.Check
            id="settings-asset-source-mock"
            type="radio"
            name="asset-source"
            label={t('settings.assetSourceMock')}
            checked={assetSourceInput === 'mock'}
            disabled={isAssetSourceLockedByEnv}
            onChange={() => setAssetSourceInput('mock')}
          />
          <Form.Check
            id="settings-asset-source-api"
            type="radio"
            name="asset-source"
            className="mt-1"
            label={t('settings.assetSourceApi')}
            checked={assetSourceInput === 'api'}
            disabled={isAssetSourceLockedByEnv}
            onChange={() => setAssetSourceInput('api')}
          />

          <div className="d-flex flex-wrap gap-2 mt-3">
            <Button type="button" size="sm" variant="primary" onClick={saveAssetSource} disabled={isAssetSourceLockedByEnv}>
              {t('settings.assetSourceSave')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              onClick={clearAssetSourceSetting}
              disabled={isAssetSourceLockedByEnv}
            >
              {t('settings.assetSourceClear')}
            </Button>
          </div>

          {assetSourceStatus ? (
            <p
              className={`small mt-2 mb-0 ${assetSourceStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
              data-testid="settings-asset-source-status"
              role="status"
              aria-live="polite"
            >
              {assetSourceStatus.message}
            </p>
          ) : null}
        </Card.Body>
      </Card>
    </Container>
  )
}
