import type { ApiErrorPayload } from './client'
import { INITIAL_ASSETS } from '../data/mockAssets'

type MockAssetState = 'DECISION_PENDING' | 'DECIDED_KEEP' | 'DECIDED_REJECT' | 'REJECTED'

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
  if (state === 'DECIDED_KEEP') {
    return 'DECIDED_KEEP'
  }
  if (state === 'DECIDED_REJECT') {
    return 'DECIDED_REJECT'
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

function listAssetsResponse() {
  return {
    items: Array.from(sharedState.assets.values()),
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
        client_kind: 'UI_RUST',
        mfa_required: false,
      })
    }

    if (pathname === '/auth/lost-password/request' && method === 'POST') {
      return emptyResponse(202)
    }

    if (pathname === '/auth/lost-password/reset' && method === 'POST') {
      return emptyResponse(200)
    }

    if (pathname === '/auth/logout' && method === 'POST') {
      return emptyResponse(204)
    }

    if (!hasAuth(init)) {
      return unauthorized()
    }

    if (pathname === '/auth/me' && method === 'GET') {
      return jsonResponse(200, sharedState.user)
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
      return jsonResponse(200, listAssetsResponse())
    }

    if (pathname.startsWith('/assets/') && pathname.endsWith('/decision') && method === 'POST') {
      const assetId = extractAssetId(pathname)
      if (!assetId) {
        return notFound('Asset not found.', 'mock-asset-id-missing')
      }
      const body = await parseJson(init)
      const action = body.action
      const asset = sharedState.assets.get(assetId)
      if (!asset) {
        return notFound('Asset not found.', 'mock-asset-not-found')
      }
      if (action === 'KEEP') {
        asset.state = 'DECIDED_KEEP'
      } else if (action === 'REJECT') {
        asset.state = 'DECIDED_REJECT'
      } else if (action === 'CLEAR') {
        asset.state = 'DECISION_PENDING'
      }
      return emptyResponse(200)
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
        asset.state = 'REJECTED'
      }
      return emptyResponse(204)
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

    if (pathname === '/batches/moves/preview' && method === 'POST') {
      return emptyResponse(204)
    }

    if (pathname === '/batches/moves' && method === 'POST') {
      return jsonResponse(200, { batch_id: 'BATCH-TEST-1', accepted: true })
    }

    if (pathname.startsWith('/batches/moves/') && method === 'GET') {
      return jsonResponse(200, {
        batch_id: pathname.split('/')[3] ?? 'BATCH-TEST-1',
        completed: true,
        stats: { total: 0, applied: 0, rejected: 0 },
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
