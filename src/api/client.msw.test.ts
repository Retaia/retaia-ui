import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createApiClient } from './client'
import { mswServer } from '../test-utils/mswServer'

describe('api client with msw', () => {
  it('validates and normalizes app policy payload from mocked api', async () => {
    mswServer.use(
      http.get('http://localhost/api/v1/app/policy', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('client_feature_flags_contract_version')).toBe('1.2.0')

        return HttpResponse.json({
          server_policy: {
            feature_flags: {
              'features.decisions.bulk': true,
              'features.ignored': 'not-a-bool',
            },
            feature_flags_contract_version: '1.2.0',
            accepted_feature_flags_contract_versions: ['1.1.0', '1.2.0'],
            effective_feature_flags_contract_version: '1.2.0',
            feature_flags_compatibility_mode: 'STRICT',
          },
        })
      }),
    )
    const api = createApiClient({ baseUrl: 'http://localhost/api/v1' })

    const policy = await api.getAppPolicy()

    expect(policy.server_policy.feature_flags['features.decisions.bulk']).toBe(true)
    expect(policy.server_policy.feature_flags['features.ignored']).toBeUndefined()
    expect(policy.server_policy.feature_flags_contract_version).toBe('1.2.0')
    expect(policy.server_policy.effective_feature_flags_contract_version).toBe('1.2.0')
  })
})
