import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const jsonPath = 'test-results/bdd-report.json'
const htmlPath = 'test-results/bdd-report.html'

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const scenarioRows = []
let totalScenarios = 0
let passedScenarios = 0
let failedScenarios = 0

try {
  const raw = readFileSync(jsonPath, 'utf8')
  const features = JSON.parse(raw)

  for (const feature of features) {
    for (const element of feature.elements ?? []) {
      if (element.type !== 'scenario') {
        continue
      }
      totalScenarios += 1

      const stepStatuses = (element.steps ?? []).map((step) => step.result?.status ?? 'unknown')
      const hasFailure = stepStatuses.some((status) => status === 'failed')
      const hasSkipped = stepStatuses.some((status) => status === 'skipped')
      const status = hasFailure ? 'failed' : hasSkipped ? 'skipped' : 'passed'

      if (status === 'passed') {
        passedScenarios += 1
      } else if (status === 'failed') {
        failedScenarios += 1
      }

      scenarioRows.push({
        feature: feature.name ?? '(feature)',
        scenario: element.name ?? '(scenario)',
        status,
      })
    }
  }
} catch {
  scenarioRows.push({
    feature: 'BDD',
    scenario: 'Report JSON introuvable ou invalide',
    status: 'failed',
  })
  totalScenarios = 1
  failedScenarios = 1
}

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BDD Report</title>
    <style>
      body { font-family: sans-serif; margin: 24px; background: #0f172a; color: #e2e8f0; }
      h1 { margin: 0 0 8px; }
      .summary { margin: 0 0 16px; color: #cbd5e1; }
      table { width: 100%; border-collapse: collapse; background: #111827; }
      th, td { padding: 10px; border-bottom: 1px solid #334155; text-align: left; }
      .passed { color: #22c55e; font-weight: 700; }
      .failed { color: #ef4444; font-weight: 700; }
      .skipped { color: #f59e0b; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>BDD Report</h1>
    <p class="summary">Total: ${totalScenarios} | Passed: ${passedScenarios} | Failed: ${failedScenarios}</p>
    <table>
      <thead>
        <tr><th>Feature</th><th>Scenario</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${scenarioRows
          .map(
            (row) =>
              `<tr><td>${escapeHtml(row.feature)}</td><td>${escapeHtml(row.scenario)}</td><td class="${row.status}">${row.status}</td></tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </body>
</html>`

mkdirSync(dirname(htmlPath), { recursive: true })
writeFileSync(htmlPath, html, 'utf8')
