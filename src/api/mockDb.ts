import type { ApiErrorPayload } from './client'
import { INITIAL_ASSETS } from '../data/mockAssets'

type MockAssetState =
  | 'READY'
  | 'DECISION_PENDING'
  | 'DECIDED_KEEP'
  | 'DECIDED_REJECT'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'PURGED'

type MockAsset = {
  uuid: string
  state: MockAssetState
  media_type: 'VIDEO' | 'AUDIO' | 'PHOTO' | 'UNKNOWN'
  captured_at: string
  tags: string[]
  notes: string
}

type MockDbState = {
  authToken: string
  user: {
    email: string
    display_name: string
    mfa_enabled: boolean
    roles?: string[]
  }
  sessions: Array<{
    session_id: string
    client_id: string
    created_at: string
    last_used_at: string
    expires_at?: string | null
    is_current: boolean
    device_label?: string | null
    browser?: string | null
    os?: string | null
    ip_address_last_seen?: string | null
  }>
  userFeatures: {
    user_feature_enabled: Record<string, boolean>
    effective_feature_enabled: Record<string, boolean>
    feature_governance: Array<{ key: string; user_can_disable: boolean }>
    core_v1_global_features: string[]
  }
  appFeatures: {
    app_feature_enabled: Record<string, boolean>
    feature_governance: Array<{ key: string; user_can_disable: boolean }>
    core_v1_global_features: string[]
  }
  appPolicy: {
    server_policy: {
      feature_flags: Record<string, boolean>
    }
  }
  assets: Map<string, MockAsset>
}

const TEST_TOKEN = 'test-token-memory'

function inferMediaType(name: string): MockAsset['media_type'] {
  const lower = name.toLowerCase()
  if (lower.endsWith('.mov') || lower.endsWith('.mp4')) {
    return 'VIDEO'
  }
  if (lower.endsWith('.wav') || lower.endsWith('.mp3')) {
    return 'AUDIO'
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) {
    return 'PHOTO'
  }
  return 'UNKNOWN'
}

function inferState(state: string): MockAssetState {
  if (state === 'READY') {
    return 'READY'
  }
  if (state === 'DECIDED_KEEP') {
    return 'DECIDED_KEEP'
  }
  if (state === 'ARCHIVED') {
    return 'ARCHIVED'
  }
  if (state === 'DECIDED_REJECT') {
    return 'REJECTED'
  }
  if (state === 'REJECTED') {
    return 'REJECTED'
  }
  if (state === 'PURGED') {
    return 'PURGED'
  }
  return 'DECISION_PENDING'
}

function createInitialAssets() {
  return new Map(
    INITIAL_ASSETS.map((asset) => [
      asset.id,
      {
        uuid: asset.id,
        state: inferState(asset.state),
        media_type: inferMediaType(asset.name),
        captured_at: asset.capturedAt ?? new Date(0).toISOString(),
        tags: Array.isArray(asset.tags) ? [...asset.tags] : [],
        notes: asset.notes ?? '',
      } satisfies MockAsset,
    ]),
  )
}

function createInitialState(): MockDbState {
  return {
    authToken: TEST_TOKEN,
    user: {
      email: 'test.user@retaia.dev',
      display_name: 'Test User',
      mfa_enabled: false,
      roles: ['ADMIN'],
    },
    sessions: [
      {
        session_id: 'session-current',
        client_id: 'client-current',
        created_at: '2026-04-20T08:00:00Z',
        last_used_at: '2026-04-23T08:00:00Z',
        expires_at: '2026-05-20T08:00:00Z',
        is_current: true,
        device_label: 'Current browser',
        browser: 'Codex Browser',
        os: 'macOS',
        ip_address_last_seen: '127.0.0.1',
      },
      {
        session_id: 'session-other',
        client_id: 'client-other',
        created_at: '2026-04-10T08:00:00Z',
        last_used_at: '2026-04-21T08:00:00Z',
        expires_at: '2026-05-10T08:00:00Z',
        is_current: false,
        device_label: 'Studio laptop',
        browser: 'Firefox',
        os: 'Linux',
        ip_address_last_seen: '10.0.0.5',
      },
    ],
    userFeatures: {
      user_feature_enabled: { 'features.auth.2fa': true },
      effective_feature_enabled: { 'features.auth.2fa': true },
      feature_governance: [{ key: 'features.auth.2fa', user_can_disable: true }],
      core_v1_global_features: ['features.core.auth'],
    },
    appFeatures: {
      app_feature_enabled: { 'features.auth.2fa': true },
      feature_governance: [{ key: 'features.auth.2fa', user_can_disable: true }],
      core_v1_global_features: ['features.core.auth'],
    },
    appPolicy: {
      server_policy: {
        feature_flags: {
          'features.decisions.bulk': true,
        },
      },
    },
    assets: createInitialAssets(),
  }
}

let sharedState = createInitialState()

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function emptyResponse(status = 204) {
  return new Response(null, { status })
}

function errorResponse(status: number, payload: ApiErrorPayload) {
  return jsonResponse(status, payload)
}

function unauthorized() {
  return errorResponse(401, {
    code: 'UNAUTHORIZED',
    message: 'Authentication required.',
    retryable: false,
    correlation_id: 'mock-auth-required',
  })
}

function notFound(message: string, correlationId: string) {
  return errorResponse(404, {
    code: 'VALIDATION_FAILED',
    message,
    retryable: false,
    correlation_id: correlationId,
  })
}

function parsePathname(urlInput: string) {
  const parsed = new URL(urlInput, 'http://mock.local')
  return parsed.pathname.replace(/^\/api\/v1/, '') || '/'
}

function extractAssetId(pathname: string) {
  const parts = pathname.split('/')
  const maybeId = parts[2]
  return typeof maybeId === 'string' && maybeId.length > 0 ? maybeId : null
}

function hasAuth(init?: RequestInit) {
  const headers = new Headers(init?.headers)
  return headers.get('Authorization') === `Bearer ${sharedState.authToken}`
}

async function parseJson(init?: RequestInit): Promise<Record<string, unknown>> {
  if (!init?.body || typeof init.body !== 'string') {
    return {}
  }
  try {
    return JSON.parse(init.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function listAssetsResponse(urlInput: string) {
  const parsed = new URL(urlInput, 'http://mock.local')
  const requestedState = parsed.searchParams.get('state')
  const query = parsed.searchParams.get('q')?.trim().toLowerCase() ?? ''
  const sort = parsed.searchParams.get('sort') ?? '-created_at'
  const filteredItems = Array.from(sharedState.assets.values()).filter((asset) => {
    const matchesState = !requestedState || asset.state === requestedState
    const matchesQuery =
      query.length === 0 ||
      asset.uuid.toLowerCase().includes(query) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(query))
    return matchesState && matchesQuery
  })
  const items = [...filteredItems].sort((left, right) => {
    if (sort === 'name') {
      return left.uuid.localeCompare(right.uuid)
    }
    if (sort === '-name') {
      return right.uuid.localeCompare(left.uuid)
    }
    const leftTime = Date.parse(left.captured_at)
    const rightTime = Date.parse(right.captured_at)
    if (sort === 'created_at' || sort === 'updated_at') {
      return leftTime - rightTime
    }
    return rightTime - leftTime
  })
  return {
    items,
    next_cursor: null,
  }
}

export function resetInMemoryMockDb() {
  sharedState = createInitialState()
}

export function isAppEnvTest(env: Record<string, unknown>) {
  const raw = env.APP_ENV ?? env.VITE_APP_ENV
  return typeof raw === 'string' && raw.toLowerCase() === 'test'
}

export function createInMemoryMockApiFetch(): typeof fetch {
  return async (input, init) => {
    const method = (init?.method ?? 'GET').toUpperCase()
    const pathname = parsePathname(String(input))

    if (pathname === '/auth/login' && method === 'POST') {
      return jsonResponse(200, {
        access_token: sharedState.authToken,
        token_type: 'Bearer',
        client_kind: 'UI_WEB',
        mfa_required: false,
      })
    }

    if (pathname === '/auth/lost-password/request' && method === 'POST') {
      return emptyResponse(202)
    }

    if (pathname === '/auth/lost-password/reset' && method === 'POST') {
      return emptyResponse(200)
    }

    if (pathname === '/auth/verify-email/request' && method === 'POST') {
      return emptyResponse(202)
    }

    if (pathname === '/auth/verify-email/confirm' && method === 'POST') {
      return emptyResponse(200)
    }

    if (pathname === '/auth/logout' && method === 'POST') {
      return emptyResponse(204)
    }

    if (pathname === '/ops/readiness' && method === 'GET') {
      return jsonResponse(200, {
        status: 'ok',
        self_healing: {
          active: false,
          deadline_at: null,
          max_self_healing_seconds: 300,
        },
        checks: [
          {
            name: 'database',
            status: 'ok',
          },
        ],
      })
    }

    if (!hasAuth(init)) {
      return unauthorized()
    }

    if (pathname === '/auth/me' && method === 'GET') {
      return jsonResponse(200, sharedState.user)
    }

    if (pathname === '/auth/me/sessions' && method === 'GET') {
      return jsonResponse(200, {
        items: sharedState.sessions,
      })
    }

    if (pathname === '/auth/me/sessions/revoke-others' && method === 'POST') {
      const before = sharedState.sessions.length
      sharedState.sessions = sharedState.sessions.filter((session) => session.is_current)
      return jsonResponse(200, {
        revoked: Math.max(before - sharedState.sessions.length, 0),
      })
    }

    if (pathname.startsWith('/auth/me/sessions/') && pathname.endsWith('/revoke') && method === 'POST') {
      const parts = pathname.split('/')
      const sessionId = parts[4]
      const targetSession = sharedState.sessions.find((session) => session.session_id === sessionId)
      if (!targetSession) {
        return notFound('Session not found.', 'mock-session-not-found')
      }
      if (targetSession.is_current) {
        return errorResponse(409, {
          code: 'STATE_CONFLICT',
          message: 'Current session cannot be self-revoked.',
          retryable: false,
          correlation_id: 'mock-session-self-revoke',
        })
      }
      sharedState.sessions = sharedState.sessions.filter((session) => session.session_id !== sessionId)
      return emptyResponse(200)
    }

    if (pathname === '/auth/me/features' && method === 'GET') {
      return jsonResponse(200, sharedState.userFeatures)
    }

    if (pathname === '/auth/me/features' && method === 'PATCH') {
      const body = await parseJson(init)
      const next = body.user_feature_enabled
      if (next && typeof next === 'object') {
        for (const [key, value] of Object.entries(next)) {
          if (typeof value === 'boolean') {
            sharedState.userFeatures.user_feature_enabled[key] = value
            sharedState.userFeatures.effective_feature_enabled[key] = value
          }
        }
      }
      return jsonResponse(200, sharedState.userFeatures)
    }

    if (pathname === '/auth/verify-email/admin-confirm' && method === 'POST') {
      return emptyResponse(200)
    }

    if (pathname === '/auth/2fa/setup' && method === 'POST') {
      return jsonResponse(200, {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauth_uri: 'otpauth://totp/retaia:test.user@retaia.dev?secret=JBSWY3DPEHPK3PXP&issuer=retaia',
      })
    }

    if ((pathname === '/auth/2fa/enable' || pathname === '/auth/2fa/disable') && method === 'POST') {
      sharedState.user.mfa_enabled = pathname.endsWith('/enable')
      return emptyResponse(204)
    }

    if (pathname === '/app/policy' && method === 'GET') {
      return jsonResponse(200, sharedState.appPolicy)
    }

    if (pathname === '/app/features' && method === 'GET') {
      return jsonResponse(200, sharedState.appFeatures)
    }

    if (pathname === '/app/features' && method === 'PATCH') {
      const body = await parseJson(init)
      const next = body.app_feature_enabled
      if (next && typeof next === 'object') {
        for (const [key, value] of Object.entries(next)) {
          if (typeof value === 'boolean') {
            sharedState.appFeatures.app_feature_enabled[key] = value
            sharedState.userFeatures.effective_feature_enabled[key] = value
          }
        }
      }
      return jsonResponse(200, sharedState.appFeatures)
    }

    if (pathname === '/assets' && method === 'GET') {
      return jsonResponse(200, listAssetsResponse(String(input)))
    }

    if (pathname.startsWith('/assets/') && pathname.endsWith('/purge/preview') && method === 'POST') {
      return emptyResponse(204)
    }

    if (pathname.startsWith('/assets/') && pathname.endsWith('/purge') && method === 'POST') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const asset = sharedState.assets.get(assetId)
      if (asset) {
        asset.state = 'PURGED'
      }
      return emptyResponse(204)
    }

    if (pathname.startsWith('/assets/') && pathname.endsWith('/reopen') && method === 'POST') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const asset = sharedState.assets.get(assetId)
      if (!asset) {
        return notFound('Asset not found.', 'mock-asset-not-found')
      }
      asset.state = 'DECISION_PENDING'
      return emptyResponse(200)
    }

    if (pathname.startsWith('/assets/') && pathname.endsWith('/reprocess') && method === 'POST') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const asset = sharedState.assets.get(assetId)
      if (!asset) {
        return notFound('Asset not found.', 'mock-asset-not-found')
      }
      asset.state = 'READY'
      return emptyResponse(200)
    }

    if (pathname.startsWith('/assets/') && method === 'PATCH') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const asset = sharedState.assets.get(assetId)
      if (!asset) {
        return notFound('Asset not found.', 'mock-asset-not-found')
      }
      const body = await parseJson(init)
      if (Array.isArray(body.tags)) {
        asset.tags = body.tags.filter((item): item is string => typeof item === 'string')
      }
      if (typeof body.notes === 'string') {
        asset.notes = body.notes
      }
      if (
        body.state === 'DECISION_PENDING' ||
        body.state === 'DECIDED_KEEP' ||
        body.state === 'DECIDED_REJECT' ||
        body.state === 'ARCHIVED' ||
        body.state === 'REJECTED'
      ) {
        asset.state = body.state
      }
      return emptyResponse(200)
    }

    if (pathname.startsWith('/assets/') && method === 'GET') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const asset = sharedState.assets.get(assetId)
      if (!asset) {
        return notFound('Asset not found.', 'mock-asset-not-found')
      }
      return jsonResponse(200, {
        summary: asset,
      })
    }

    return errorResponse(404, {
      code: 'VALIDATION_FAILED',
      message: `No mock route for ${method} ${pathname}`,
      retryable: false,
      correlation_id: 'mock-route-missing',
    })
  }
}
