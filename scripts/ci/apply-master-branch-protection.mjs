#!/usr/bin/env node

import { execSync } from 'node:child_process'

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim()
}

function getOwnerRepo() {
  const remote = run('git remote get-url origin')
  const match =
    remote.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/) ?? null
  if (!match?.groups?.owner || !match.groups.repo) {
    throw new Error(`Unsupported origin remote: ${remote}`)
  }
  return { owner: match.groups.owner, repo: match.groups.repo }
}

const requiredChecks = [
  'no-black-magic',
  'pr-up-to-date',
  'commitlint',
  'lint',
  'test',
  'security-audit',
  'e2e-bdd (chromium)',
  'e2e-bdd (firefox)',
  'e2e-bdd (webkit)',
]

const { owner, repo } = getOwnerRepo()
const endpoint = `repos/${owner}/${repo}/branches/master/protection`

const payload = {
  required_status_checks: {
    strict: true,
    contexts: requiredChecks,
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 1,
    require_last_push_approval: false,
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
  block_creations: false,
  required_conversation_resolution: true,
  lock_branch: false,
  allow_fork_syncing: true,
}

const payloadArg = `'${JSON.stringify(payload)}'`
run(`gh auth status >/dev/null`)
run(
  `printf %s ${payloadArg} | gh api --method PUT -H "Accept: application/vnd.github+json" ${endpoint} --input -`,
)

console.log(`Applied master branch protection on ${owner}/${repo}`)
