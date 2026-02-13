import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const specPath = resolve(process.cwd(), 'contracts', 'openapi-v1.yaml')
const hashPath = resolve(process.cwd(), 'contracts', 'openapi-v1.sha256')

const specRaw = readFileSync(specPath)
const expected = readFileSync(hashPath, 'utf-8').trim()
const actual = createHash('sha256').update(specRaw).digest('hex')

if (actual !== expected) {
  console.error('OpenAPI contract drift detected.')
  console.error(`Expected: ${expected}`)
  console.error(`Actual:   ${actual}`)
  console.error('If this change is intended: regenerate API types and update v1.sha256 baseline.')
  process.exit(1)
}

console.log('OpenAPI contract freeze check passed.')
