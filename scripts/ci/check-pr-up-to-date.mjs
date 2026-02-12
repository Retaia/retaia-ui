#!/usr/bin/env node
import { execSync } from 'node:child_process'

const eventName = process.env.GITHUB_EVENT_NAME
if (eventName !== 'pull_request') {
  console.log('Not a pull_request event. Skipping up-to-date check.')
  process.exit(0)
}

const baseRef = process.env.GITHUB_BASE_REF
if (!baseRef) {
  console.error('Missing GITHUB_BASE_REF for pull_request event.')
  process.exit(1)
}

const run = (command) =>
  execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim()

try {
  execSync(`git fetch --no-tags origin ${baseRef} --depth=1`, {
    stdio: 'inherit',
  })

  const baseHead = run(`git rev-parse origin/${baseRef}`)
  const head = run('git rev-parse HEAD')
  const mergeBase = run(`git merge-base ${head} ${baseHead}`)

  if (mergeBase !== baseHead) {
    console.error(
      [
        `Branch is behind origin/${baseRef}.`,
        `Expected merge-base to match ${baseHead} but got ${mergeBase}.`,
        'Please merge or rebase latest base branch before merging this PR.',
      ].join('\n'),
    )
    process.exit(1)
  }

  console.log(`Branch is up to date with origin/${baseRef}.`)
} catch (error) {
  console.error('Failed to verify branch freshness.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
