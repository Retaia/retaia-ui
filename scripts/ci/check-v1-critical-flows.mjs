import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const featuresDir = join(process.cwd(), 'bdd', 'features')
const requiredSnippets = [
  "Scenario: Ouvrir le détail au clic",
  "Scenario: Créer un batch avec Maj+clic",
  "Scenario: Annuler une décision avec Ctrl/Cmd+Z",
  "Scenario: Confirmer une exécution batch avec Shift+Entrée",
  "Scenario: Changer la langue vers l'anglais",
]

const files = readdirSync(featuresDir).filter((name) => name.endsWith('.feature'))
const combined = files
  .map((name) => readFileSync(join(featuresDir, name), 'utf-8'))
  .join('\n')

const missing = requiredSnippets.filter((snippet) => !combined.includes(snippet))

if (missing.length > 0) {
  console.error('Missing required v1 critical flows:')
  for (const snippet of missing) {
    console.error(`- ${snippet}`)
  }
  process.exit(1)
}

console.log(`v1 critical flow presence check passed (${requiredSnippets.length} scenarios).`)
