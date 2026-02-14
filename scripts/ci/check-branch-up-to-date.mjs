#!/usr/bin/env node
import { execSync } from 'node:child_process'

const eventName = process.env.GITHUB_EVENT_NAME
if (eventName !== 'pull_request') {
  console.log('Not a pull_request event. Skipping branch-up-to-date check.')
  process.exit(0)
}

const baseRef = process.env.GITHUB_BASE_REF
if (!baseRef) {
  console.error('Missing GITHUB_BASE_REF for pull_request event.')
  process.exit(1)
}

const run = (command) =>
  execSync(command, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' }).trim()

try {
  execSync(`git fetch --no-tags origin ${baseRef} --depth=1`, { stdio: 'inherit' })

  const baseHead = run(`git rev-parse origin/${baseRef}`)
  const head = run('git rev-parse HEAD')
  const mergeBase = run(`git merge-base ${head} ${baseHead}`)

  if (mergeBase !== baseHead) {
    console.error(
      [
        `Branch is behind origin/${baseRef}.`,
        `Expected merge-base to match ${baseHead} but got ${mergeBase}.`,
        'Please rebase on the latest base branch before merging this PR.',
      ].join('\n'),
    )
    process.exit(1)
  }

  const mergeCommitsRaw = run(`git rev-list --merges origin/${baseRef}..${head} || true`)
  const mergeCommits = mergeCommitsRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (mergeCommits.length > 0) {
    console.error('Linear history required: merge commits found in PR branch.')
    for (const sha of mergeCommits) {
      const subject = run(`git show -s --format=%s ${sha}`)
      console.error(`- ${sha} ${subject}`)
    }
    console.error('Please rebase and remove merge commits before merging this PR.')
    process.exit(1)
  }

  console.log(`Branch is up to date with origin/${baseRef} and has linear history.`)
} catch (error) {
  console.error('Failed to verify branch freshness and linear history.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
