#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['src', 'bdd', 'scripts']
const ignoredFileSuffixes = ['.d.ts', '.map']
const ignoredExactPaths = new Set([
  'src/api/generated/openapi.ts',
  'scripts/ci/check-runtime-pull-only.mjs',
])

const forbiddenPatterns = [
  { label: 'WebSocket usage', regex: /\bnew\s+WebSocket\s*\(/g },
  { label: 'SSE EventSource usage', regex: /\bnew\s+EventSource\s*\(/g },
  { label: 'Webhook runtime dependency', regex: /\bwebhook\b/gi },
]

function collectFiles(root) {
  const rootPath = join(process.cwd(), root)
  const results = []

  function walk(currentPath) {
    const entries = readdirSync(currentPath)
    for (const entry of entries) {
      const absolutePath = join(currentPath, entry)
      const relativePath = absolutePath.replace(`${process.cwd()}/`, '')
      const stats = statSync(absolutePath)

      if (stats.isDirectory()) {
        walk(absolutePath)
        continue
      }

      if (ignoredExactPaths.has(relativePath)) {
        continue
      }

      if (ignoredFileSuffixes.some((suffix) => relativePath.endsWith(suffix))) {
        continue
      }

      results.push(relativePath)
    }
  }

  walk(rootPath)
  return results
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length
}

const files = roots.flatMap(collectFiles)
const violations = []

for (const file of files) {
  const content = readFileSync(join(process.cwd(), file), 'utf-8')

  for (const pattern of forbiddenPatterns) {
    pattern.regex.lastIndex = 0
    let match = pattern.regex.exec(content)
    while (match) {
      violations.push({
        file,
        line: lineNumberAt(content, match.index),
        label: pattern.label,
        snippet: match[0],
      })
      match = pattern.regex.exec(content)
    }
  }
}

if (violations.length > 0) {
  console.error('Runtime pull-only contract violation(s) found:')
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.label} (${violation.snippet})`)
  }
  process.exit(1)
}

console.log('Runtime pull-only contract check passed (no push runtime dependency found).')
