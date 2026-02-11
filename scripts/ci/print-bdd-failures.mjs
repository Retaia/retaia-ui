import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const reportPath = resolve(process.cwd(), 'test-results/bdd-report.json')

function loadReport() {
  try {
    const raw = readFileSync(reportPath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.log('[bdd-summary] No JSON report available at test-results/bdd-report.json')
    console.log(`[bdd-summary] ${String(error)}`)
    process.exit(0)
  }
}

const report = loadReport()

if (!Array.isArray(report) || report.length === 0) {
  console.log('[bdd-summary] Report is empty')
  process.exit(0)
}

const failures = []

for (const feature of report) {
  const featureName = feature.name ?? 'Unnamed feature'
  const elements = Array.isArray(feature.elements) ? feature.elements : []

  for (const scenario of elements) {
    const scenarioName = scenario.name ?? 'Unnamed scenario'
    const steps = Array.isArray(scenario.steps) ? scenario.steps : []

    for (const step of steps) {
      const status = step?.result?.status
      if (status === 'failed' || status === 'undefined' || status === 'ambiguous') {
        const keyword = step.keyword?.trim() ?? 'Step'
        const text = step.name ?? 'unnamed'
        const message = (step.result?.error_message ?? '').split('\n')[0]
        failures.push({ featureName, scenarioName, keyword, text, status, message })
      }
    }
  }
}

if (failures.length === 0) {
  console.log('[bdd-summary] No failed steps found in report JSON')
  process.exit(0)
}

console.log(`[bdd-summary] ${failures.length} failed step(s)`)
for (const failure of failures) {
  console.log(`- Feature: ${failure.featureName}`)
  console.log(`  Scenario: ${failure.scenarioName}`)
  console.log(`  ${failure.keyword} ${failure.text} [${failure.status}]`)
  if (failure.message) {
    console.log(`  Error: ${failure.message}`)
  }
}
