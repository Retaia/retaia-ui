import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const eventName = process.env.GITHUB_EVENT_NAME

if (eventName !== 'pull_request') {
  console.log('Skipping OpenAPI PR governance check on non-PR event.')
  process.exit(0)
}

const baseRef = process.env.GITHUB_BASE_REF
if (!baseRef) {
  console.error('Missing GITHUB_BASE_REF for pull_request event.')
  process.exit(1)
}

const eventPath = process.env.GITHUB_EVENT_PATH
if (!eventPath) {
  console.error('Missing GITHUB_EVENT_PATH for pull_request event.')
  process.exit(1)
}

const eventPayload = JSON.parse(readFileSync(eventPath, 'utf-8'))
const prBody = eventPayload?.pull_request?.body ?? ''

const parseChangedFiles = (raw) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const resolveChangedFiles = () => {
  execSync(`git fetch origin ${baseRef} --depth=1`, { stdio: 'ignore' })
  try {
    return parseChangedFiles(execSync(`git diff --name-only origin/${baseRef}...HEAD`, { encoding: 'utf-8' }))
  } catch (error) {
    const stderr = String(error?.stderr ?? '')
    if (!stderr.includes('no merge base')) {
      throw error
    }
    // CI can fetch only the tip of base branch, which is not enough for a merge-base diff.
    execSync(`git fetch origin ${baseRef} --deepen=200`, { stdio: 'ignore' })
    try {
      return parseChangedFiles(execSync(`git diff --name-only origin/${baseRef}...HEAD`, { encoding: 'utf-8' }))
    } catch {
      return parseChangedFiles(execSync(`git diff --name-only origin/${baseRef}..HEAD`, { encoding: 'utf-8' }))
    }
  }
}

const changedFiles = resolveChangedFiles()

const isLegacyMirrorTouched = changedFiles.includes('api/openapi/v1.yaml')
const isSpecsSubmoduleTouched = changedFiles.includes('specs')

const didOpenApiChangeInSpecsSubmodule = () => {
  if (!isSpecsSubmoduleTouched) {
    return false
  }

  const baseSpecsCommit = execSync(`git rev-parse origin/${baseRef}:specs`, {
    encoding: 'utf-8',
  }).trim()
  const headSpecsCommit = execSync('git rev-parse HEAD:specs', {
    encoding: 'utf-8',
  }).trim()

  if (baseSpecsCommit === headSpecsCommit) {
    return false
  }

  execSync(`git -C specs fetch --quiet origin ${baseSpecsCommit} ${headSpecsCommit}`)
  const changedInSpecs = execSync(
    `git -C specs diff --name-only ${baseSpecsCommit} ${headSpecsCommit} -- api/openapi/v1.yaml`,
    {
      encoding: 'utf-8',
    },
  )
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return changedInSpecs.includes('api/openapi/v1.yaml')
}

const openApiTouched = isLegacyMirrorTouched || didOpenApiChangeInSpecsSubmodule()
if (!openApiTouched) {
  console.log('OpenAPI file not changed in this PR. Governance check not required.')
  process.exit(0)
}

const requiredSections = [
  'Impact flags/capabilities:',
  'Comportement client OFF/ON (safe-by-default):',
  'Migration/adoption consommateurs:',
  'Strategie de non-regression v1:',
]

const missingSections = requiredSections.filter((section) => !prBody.includes(section))

if (missingSections.length > 0) {
  console.error('OpenAPI governance check failed: missing required PR body sections.')
  for (const section of missingSections) {
    console.error(`- ${section}`)
  }
  console.error('Add the required governance analysis to the PR body and retry.')
  process.exit(1)
}

console.log('OpenAPI PR governance check passed.')
