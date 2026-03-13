import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createApiClient } from './client'
import { mswServer } from '../test-utils/mswServer'

describe('api client with msw', () => {
  it('validates and normalizes app policy payload from mocked api', async () => {
    mswServer.use(
      http.get('http://localhost/api/v1/app/policy', () =>
        HttpResponse.json({
          server_policy: {
            feature_flags: {
              'features.decisions.bulk': true,
              'features.ignored': 'not-a-bool',
            },
          },
        }),
      ),
    )
    const api = createApiClient({ baseUrl: 'http://localhost/api/v1' })

    const policy = await api.getAppPolicy()

    expect(policy.server_policy.feature_flags['features.decisions.bulk']).toBe(true)
    expect(policy.server_policy.feature_flags['features.ignored']).toBeUndefined()
  })
})
