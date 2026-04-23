import type { TFunction } from 'i18next'

type Session = {
  sessionId: string
  clientId: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string | null
  isCurrent: boolean
  deviceLabel: string | null
  browser: string | null
  os: string | null
  ipAddressLastSeen: string | null
}

type Props = {
  t: TFunction
  sessions: Session[]
  loading: boolean
  busySessionId: string | null
  revokingOthers: boolean
  status: { kind: 'success' | 'error'; message: string } | null
  onRefresh: () => Promise<void>
  onRevokeSession: (sessionId: string) => Promise<void>
  onRevokeOthers: () => Promise<void>
}

function formatDate(value: string) {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) {
    return value
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(parsed))
}

export function AccountSessionsSection({
  t,
  sessions,
  loading,
  busySessionId,
  revokingOthers,
  status,
  onRefresh,
  onRevokeSession,
  onRevokeOthers,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('account.sessionsTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t('account.sessionsBody')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onRefresh()}
            disabled={loading}
            data-testid="account-sessions-refresh"
          >
            {t('account.sessionsRefresh')}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-error-500 bg-error-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onRevokeOthers()}
            disabled={revokingOthers}
            data-testid="account-sessions-revoke-others"
          >
            {revokingOthers ? t('account.revokeOthersBusy') : t('account.revokeOthers')}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">{t('account.sessionsLoading')}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">{t('account.sessionsEmpty')}</p>
        ) : (
          sessions.map((session) => (
            <article
              key={session.sessionId}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-gray-900 dark:text-gray-100">
                      {session.deviceLabel || session.clientId}
                    </strong>
                    {session.isCurrent ? (
                      <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                        {t('account.sessionCurrent')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {[session.browser, session.os, session.ipAddressLastSeen].filter(Boolean).join(' · ') || t('account.sessionMetaFallback')}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void onRevokeSession(session.sessionId)}
                  disabled={session.isCurrent || busySessionId === session.sessionId}
                  data-testid={`account-session-revoke-${session.sessionId}`}
                >
                  {busySessionId === session.sessionId ? t('account.sessionRevoking') : t('account.sessionRevoke')}
                </button>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('account.sessionCreatedAt')}
                  </dt>
                  <dd className="mt-1">{formatDate(session.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('account.sessionLastUsedAt')}
                  </dt>
                  <dd className="mt-1">{formatDate(session.lastUsedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('account.sessionExpiresAt')}
                  </dt>
                  <dd className="mt-1">
                    {session.expiresAt ? formatDate(session.expiresAt) : t('account.sessionNoExpiry')}
                  </dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      {status ? (
        <p
          className={[
            'mt-4 text-sm',
            status.kind === 'success' ? 'text-success-700' : 'text-error-700',
          ].join(' ')}
          data-testid="account-sessions-status"
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
