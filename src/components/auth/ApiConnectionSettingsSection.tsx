import type { TFunction } from 'i18next'
import type { useAuthPageController } from '../../hooks/useAuthPageController'

type ApiConnectionSettingsSectionProps = {
  t: TFunction
  controller: ReturnType<typeof useAuthPageController>
}

export function ApiConnectionSettingsSection({ t, controller }: ApiConnectionSettingsSectionProps) {
  const {
    isApiConfigLockedByEnv,
    apiBaseUrlInput,
    setApiBaseUrlInput,
    isApiBaseUrlLockedByEnv,
    saveApiConnectionSettings,
    testApiConnection,
    clearApiConnectionSettings,
    apiConnectionStatus,
    retryStatus,
  } = controller

  return (
    <>
      {isApiConfigLockedByEnv ? (
        <p className="text-xs text-gray-500 mb-3">{t('app.apiConnectionEnvLocked')}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label htmlFor="api-base-url-input" className="mb-1 inline-block text-xs font-medium text-gray-700">
            {t('app.apiBaseUrlLabel')}
          </label>
          <input
            id="api-base-url-input"
            data-testid="api-base-url-input"
            value={apiBaseUrlInput}
            onChange={(event) => setApiBaseUrlInput(event.target.value)}
            placeholder="/api/v1"
            disabled={isApiBaseUrlLockedByEnv}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-brand-600 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="api-connection-save"
          onClick={saveApiConnectionSettings}
          disabled={isApiBaseUrlLockedByEnv}
        >
          {t('app.apiConnectionSave')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-500 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          data-testid="api-connection-test"
          onClick={() => void testApiConnection()}
        >
          {t('app.apiConnectionTest')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="api-connection-clear"
          onClick={clearApiConnectionSettings}
          disabled={isApiBaseUrlLockedByEnv}
        >
          {t('app.apiConnectionClear')}
        </button>
      </div>
      {apiConnectionStatus ? (
        <p
          className={`text-xs mt-2 mb-0 ${apiConnectionStatus.kind === 'success' ? 'text-success-700' : 'text-error-700'}`}
          data-testid="api-connection-status"
          role="status"
          aria-live="polite"
        >
          {apiConnectionStatus.message}
        </p>
      ) : null}
      {retryStatus ? (
        <p className="text-xs text-gray-500 mt-2 mb-0" data-testid="retry-status">
          {retryStatus}
        </p>
      ) : null}
    </>
  )
}
