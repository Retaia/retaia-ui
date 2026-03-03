import { useMemo, useState } from 'react'
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
    <main className="mx-auto w-full max-w-6xl px-3 py-4">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <h1 className="text-4xl font-bold mb-1">{t('settings.title')}</h1>
          <p className="text-gray-500 mb-0">{t('settings.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => navigate('/auth')}
          >
            {t('settings.openAuth')}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            onClick={() => navigate('/review')}
          >
            {t('app.backToContext', { context: t('app.nav.review') })}
          </button>
        </div>
      </div>

      <section className="mb-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('settings.lockedSection')}>
          <h2 className="mb-2 text-base font-semibold text-gray-900">{t('settings.lockedSection')}</h2>
          <ul className="mb-0 text-xs text-gray-700">
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
            <p className="mt-2 mb-0 text-xs text-gray-500">{t('app.apiConnectionEnvLocked')}</p>
          ) : null}
          {isAssetSourceLockedByEnv ? (
            <p className="mt-2 mb-0 text-xs text-gray-500">{t('settings.assetSourceEnvLocked')}</p>
          ) : null}
      </section>

      <section className="mb-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('settings.connectionSection')}>
          <h2 className="mb-3 text-base font-semibold text-gray-900">{t('settings.connectionSection')}</h2>
          <label htmlFor="settings-api-base-url-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.apiBaseUrlLabel')}
          </label>
          <input
            id="settings-api-base-url-input"
            data-testid="settings-api-base-url-input"
            value={apiBaseUrlInput}
            onChange={(event) => dispatch(setApiBaseUrlInput(event.target.value))}
            placeholder="/api/v1"
            disabled={isApiBaseUrlLockedByEnv}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <label htmlFor="settings-api-token-input" className="mb-1 mt-3 inline-block text-xs font-medium text-gray-700">
            {t('settings.apiTokenLabel')}
          </label>
          <input
            id="settings-api-token-input"
            data-testid="settings-api-token-input"
            value={apiTokenInput}
            onChange={(event) => dispatch(setApiTokenInput(event.target.value))}
            placeholder={t('settings.apiTokenPlaceholder')}
            disabled={isApiAuthLockedByEnv}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600"
              onClick={saveConnectionSettings}
            >
              {t('app.apiConnectionSave')}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
              onClick={() => void testConnection()}
            >
              {t('app.apiConnectionTest')}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              onClick={clearConnectionSettings}
            >
              {t('app.apiConnectionClear')}
            </button>
          </div>

          {connectionStatus ? (
            <p
              className={`mt-2 mb-0 text-xs ${connectionStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
              data-testid="settings-connection-status"
              role="status"
              aria-live="polite"
            >
              {connectionStatus.message}
            </p>
          ) : null}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-sm" aria-label={t('settings.assetSourceSection')}>
          <h2 className="mb-2 text-base font-semibold text-gray-900">{t('settings.assetSourceSection')}</h2>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700" htmlFor="settings-asset-source-mock">
            <input
              id="settings-asset-source-mock"
              type="radio"
              name="asset-source"
              checked={assetSourceInput === 'mock'}
              disabled={isAssetSourceLockedByEnv}
              onChange={() => setAssetSourceInput('mock')}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span>{t('settings.assetSourceMock')}</span>
          </label>
          <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700" htmlFor="settings-asset-source-api">
            <input
              id="settings-asset-source-api"
              type="radio"
              name="asset-source"
              checked={assetSourceInput === 'api'}
              disabled={isAssetSourceLockedByEnv}
              onChange={() => setAssetSourceInput('api')}
              className="h-4 w-4 accent-[var(--color-brand-500)]"
            />
            <span>{t('settings.assetSourceApi')}</span>
          </label>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={saveAssetSource}
              disabled={isAssetSourceLockedByEnv}
            >
              {t('settings.assetSourceSave')}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={clearAssetSourceSetting}
              disabled={isAssetSourceLockedByEnv}
            >
              {t('settings.assetSourceClear')}
            </button>
          </div>

          {assetSourceStatus ? (
            <p
              className={`mt-2 mb-0 text-xs ${assetSourceStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
              data-testid="settings-asset-source-status"
              role="status"
              aria-live="polite"
            >
              {assetSourceStatus.message}
            </p>
          ) : null}
      </section>
    </main>
  )
}
