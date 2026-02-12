import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const budgetPath = resolve(process.cwd(), 'contracts', 'perf-budget.json')
const distAssetsPath = resolve(process.cwd(), 'dist', 'assets')
const budget = JSON.parse(readFileSync(budgetPath, 'utf-8'))

const files = readdirSync(distAssetsPath)
const jsFiles = files.filter((name) => name.endsWith('.js'))
const cssFiles = files.filter((name) => name.endsWith('.css'))

if (jsFiles.length === 0 || cssFiles.length === 0) {
  console.error('Missing built JS/CSS assets. Run `npm run build` first.')
  process.exit(1)
}

const readStats = (filePath) => {
  const raw = readFileSync(filePath)
  return { raw: raw.byteLength, gzip: gzipSync(raw).byteLength }
}

const jsStats = readStats(join(distAssetsPath, jsFiles[0]))
const cssStats = readStats(join(distAssetsPath, cssFiles[0]))

const failures = []

if (jsStats.raw > budget.jsMaxBytes) {
  failures.push(`JS raw too large: ${jsStats.raw} > ${budget.jsMaxBytes}`)
}
if (jsStats.gzip > budget.jsGzipMaxBytes) {
  failures.push(`JS gzip too large: ${jsStats.gzip} > ${budget.jsGzipMaxBytes}`)
}
if (cssStats.raw > budget.cssMaxBytes) {
  failures.push(`CSS raw too large: ${cssStats.raw} > ${budget.cssMaxBytes}`)
}
if (cssStats.gzip > budget.cssGzipMaxBytes) {
  failures.push(`CSS gzip too large: ${cssStats.gzip} > ${budget.cssGzipMaxBytes}`)
}

if (failures.length > 0) {
  console.error('Performance budget check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Performance budget check passed:')
console.log(`- JS raw: ${jsStats.raw}`)
console.log(`- JS gzip: ${jsStats.gzip}`)
console.log(`- CSS raw: ${cssStats.raw}`)
console.log(`- CSS gzip: ${cssStats.gzip}`)
