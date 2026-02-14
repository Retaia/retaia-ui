import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const specPath = resolve(process.cwd(), 'specs', 'api', 'openapi', 'v1.yaml')
const hashPath = resolve(process.cwd(), 'contracts', 'openapi-v1.sha256')

const specRaw = readFileSync(specPath)
const nextHash = createHash('sha256').update(specRaw).digest('hex')
writeFileSync(hashPath, `${nextHash}\n`)

console.log(`Updated OpenAPI freeze hash from specs SSOT: ${nextHash}`)
