import { Button, Col, Form, Row } from 'react-bootstrap'
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
        <p className="small text-secondary mb-3">{t('app.apiConnectionEnvLocked')}</p>
      ) : null}
      <Row className="g-2">
        <Col md={12}>
          <Form.Label htmlFor="api-base-url-input" className="small mb-1">
            {t('app.apiBaseUrlLabel')}
          </Form.Label>
          <Form.Control
            id="api-base-url-input"
            data-testid="api-base-url-input"
            value={apiBaseUrlInput}
            onChange={(event) => setApiBaseUrlInput(event.target.value)}
            placeholder="/api/v1"
            disabled={isApiBaseUrlLockedByEnv}
          />
        </Col>
      </Row>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <Button
          type="button"
          size="sm"
          variant="primary"
          data-testid="api-connection-save"
          onClick={saveApiConnectionSettings}
          disabled={isApiBaseUrlLockedByEnv}
        >
          {t('app.apiConnectionSave')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-primary"
          data-testid="api-connection-test"
          onClick={() => void testApiConnection()}
        >
          {t('app.apiConnectionTest')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          data-testid="api-connection-clear"
          onClick={clearApiConnectionSettings}
          disabled={isApiBaseUrlLockedByEnv}
        >
          {t('app.apiConnectionClear')}
        </Button>
      </div>
      {apiConnectionStatus ? (
        <p
          className={`small mt-2 mb-0 ${apiConnectionStatus.kind === 'success' ? 'text-success' : 'text-danger'}`}
          data-testid="api-connection-status"
          role="status"
          aria-live="polite"
        >
          {apiConnectionStatus.message}
        </p>
      ) : null}
      {retryStatus ? (
        <p className="small text-secondary mt-2 mb-0" data-testid="retry-status">
          {retryStatus}
        </p>
      ) : null}
    </>
  )
}
