#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import v8toIstanbul from 'v8-to-istanbul'
import istanbulCoverage from 'istanbul-lib-coverage'

const { createCoverageMap } = istanbulCoverage

const cwd = process.cwd()
const rawDir = resolve(cwd, process.env.BDD_COVERAGE_DIR ?? 'coverage/bdd/raw')
const outFile = resolve(cwd, process.env.BDD_COVERAGE_OUT ?? 'coverage/bdd/summary.json')
const threshold = Number(process.env.BDD_COVERAGE_THRESHOLD ?? '80')
const appOrigin = process.env.BDD_COVERAGE_APP_ORIGIN ?? 'http://127.0.0.1:4173'
const metrics = (process.env.BDD_COVERAGE_METRICS ?? 'lines')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

function normalizeUrlToFile(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  if (url.startsWith(`${appOrigin}/src/`)) {
    const parsed = new URL(url)
    return resolve(cwd, decodeURIComponent(parsed.pathname.slice(1)))
  }

  if (url.includes('/@fs/')) {
    const parsed = new URL(url)
    const fsPath = decodeURIComponent(parsed.pathname.split('/@fs/')[1] ?? '')
    return fsPath ? resolve('/', fsPath) : null
  }

  return null
}

function isAppSourceFile(filePath) {
  if (!filePath) {
    return false
  }
  const normalized = filePath.replaceAll('\\', '/')
  return (
    normalized.includes('/src/') &&
    !normalized.includes('/node_modules/') &&
    (normalized.endsWith('.ts') || normalized.endsWith('.tsx'))
  )
}

async function main() {
  if (!existsSync(rawDir)) {
    console.error(`BDD coverage raw directory not found: ${rawDir}`)
    process.exit(1)
  }

  const files = (await readdir(rawDir)).filter((file) => file.endsWith('.json'))
  if (files.length === 0) {
    console.error(`No BDD coverage files found in: ${rawDir}`)
    process.exit(1)
  }

  const coverageMap = createCoverageMap({})
  const coveredFiles = new Set()

  for (const file of files) {
    const raw = readFileSync(join(rawDir, file), 'utf-8')
    const entries = JSON.parse(raw)
    if (!Array.isArray(entries)) {
      continue
    }
    for (const entry of entries) {
      const sourcePath = normalizeUrlToFile(entry.url)
      if (!sourcePath || !isAppSourceFile(sourcePath) || !existsSync(sourcePath)) {
        continue
      }
      const source = entry.source ?? entry.text
      if (typeof source !== 'string' || source.length === 0) {
        continue
      }
      const functions = Array.isArray(entry.functions) ? entry.functions : []
      if (functions.length === 0) {
        continue
      }
      const converter = v8toIstanbul(sourcePath, 0, { source })
      await converter.load()
      converter.applyCoverage(functions)
      coverageMap.merge(converter.toIstanbul())
      coveredFiles.add(sourcePath)
    }
  }

  if (coveredFiles.size === 0) {
    console.error('No app source files were covered by BDD browser coverage.')
    process.exit(1)
  }

  const summary = coverageMap.getCoverageSummary()
  const result = {
    files: coveredFiles.size,
    lines: summary.lines.pct,
    statements: summary.statements.pct,
    functions: summary.functions.pct,
    branches: summary.branches.pct,
    threshold,
  }

  writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8')

  const metricValues = {
    lines: result.lines,
    statements: result.statements,
    functions: result.functions,
    branches: result.branches,
  }
  const invalidMetrics = metrics.filter((metric) => !(metric in metricValues))
  if (invalidMetrics.length > 0) {
    console.error(`Unsupported BDD coverage metric(s): ${invalidMetrics.join(', ')}`)
    process.exit(1)
  }

  const failing = metrics
    .map((metric) => [metric, metricValues[metric]])
    .filter(([, pct]) => pct < threshold)

  console.log(
    `BDD browser coverage: lines=${result.lines} statements=${result.statements} functions=${result.functions} branches=${result.branches} (threshold=${threshold}, metrics=${metrics.join(',')})`,
  )

  if (failing.length > 0) {
    console.error(
      `BDD browser coverage threshold failed for: ${failing
        .map(([name, pct]) => `${name}=${pct}`)
        .join(', ')}`,
    )
    process.exit(1)
  }
}

await main()
