#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const requiredSnippets = [
  {
    file: 'src/hooks/useReviewDataController.ts',
    snippet: 'resolvePolicyPollingIntervalMs',
    reason: 'policy refresh must remain polling-driven',
  },
  {
    file: 'src/hooks/useReviewDataController.ts',
    snippet: 'useQuery({',
    reason: 'policy refresh loop must be handled by query polling',
  },
  {
    file: 'src/hooks/useReviewDataController.ts',
    snippet: 'refetchInterval',
    reason: 'policy refresh cadence must remain polling-driven',
  },
  {
    file: 'src/hooks/useReviewDataController.ts',
    snippet: 'POLICY_429_BACKOFF_BASE_MS',
    reason: 'policy polling must back off on 429',
  },
  {
    file: 'src/api/client.ts',
    snippet: 'RETRYABLE_429_CODES',
    reason: 'api client must treat contract 429 codes as retryable',
  },
  {
    file: 'src/api/client.ts',
    snippet: 'computeRetryDelayMs',
    reason: 'api client must apply retry delay policy',
  },
  {
    file: 'src/api/client.ts',
    snippet: 'Math.random()',
    reason: 'api client must apply jitter on 429 retry',
  },
]

const pushHintPatterns = [
  /\bnew\s+WebSocket\s*\(/g,
  /\bnew\s+EventSource\s*\(/g,
  /\bwebhook\b/gi,
]

function read(relativePath) {
  return readFileSync(join(process.cwd(), relativePath), 'utf-8')
}

function countMatches(content, regex) {
  regex.lastIndex = 0
  let count = 0
  while (regex.exec(content)) {
    count += 1
  }
  return count
}

const missing = requiredSnippets.filter(({ file, snippet }) => {
  const content = read(file)
  return !content.includes(snippet)
})

if (missing.length > 0) {
  console.error('Runtime status-driven contract violation(s) found:')
  for (const requirement of missing) {
    console.error(`- ${requirement.file}: missing "${requirement.snippet}" (${requirement.reason})`)
  }
  process.exit(1)
}

const pushHintsCount = countMatches(
  [read('src/hooks/useReviewDataController.ts'), read('src/api/client.ts')].join('\n'),
  new RegExp(pushHintPatterns.map((pattern) => pattern.source).join('|'), 'gi'),
)

console.log(
  `Runtime status-driven contract check passed (polling+429 backoff+jitter enforced, push hints allowed; matches=${pushHintsCount}).`,
)
