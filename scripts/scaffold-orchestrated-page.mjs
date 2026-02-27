import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

function toPascalCase(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function parseArgs(argv) {
  const args = { name: '', force: false }
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--name') {
      args.name = argv[index + 1] ?? ''
      index += 1
      continue
    }
    if (token === '--force') {
      args.force = true
      continue
    }
  }
  return args
}

const { name: rawName, force } = parseArgs(process.argv.slice(2))
if (!rawName) {
  console.error('Usage: npm run scaffold:page -- --name <FeatureName> [--force]')
  process.exit(1)
}

const featureName = toPascalCase(rawName)
if (!featureName) {
  console.error('Invalid feature name.')
  process.exit(1)
}

const featureSlug = toKebabCase(featureName)
const workspaceRoot = process.cwd()

const files = [
  {
    path: resolve(workspaceRoot, `src/pages/${featureName}Page.tsx`),
    content: `import { Container } from 'react-bootstrap'\nimport { use${featureName}PageController } from '../hooks/use${featureName}PageController'\nimport { ${featureName}MainSection } from '../components/${featureSlug}/${featureName}MainSection'\n\nexport function ${featureName}Page() {\n  const controller = use${featureName}PageController()\n\n  return (\n    <Container as=\"main\" className=\"py-4\">\n      <${featureName}MainSection\n        title={controller.title}\n        subtitle={controller.subtitle}\n        isLoading={controller.isLoading}\n        errorMessage={controller.errorMessage}\n      />\n    </Container>\n  )\n}\n`,
  },
  {
    path: resolve(workspaceRoot, `src/hooks/use${featureName}PageController.ts`),
    content: `type ${featureName}PageController = {\n  title: string\n  subtitle: string\n  isLoading: boolean\n  errorMessage: string | null\n}\n\nexport function use${featureName}PageController(): ${featureName}PageController {\n  return {\n    title: '${featureName}',\n    subtitle: 'TODO: wire page-specific description',\n    isLoading: false,\n    errorMessage: null,\n  }\n}\n`,
  },
  {
    path: resolve(workspaceRoot, `src/components/${featureSlug}/${featureName}MainSection.tsx`),
    content: `import { Alert, Card, Placeholder } from 'react-bootstrap'\n\ntype ${featureName}MainSectionProps = {\n  title: string\n  subtitle: string\n  isLoading: boolean\n  errorMessage: string | null\n}\n\nexport function ${featureName}MainSection({\n  title,\n  subtitle,\n  isLoading,\n  errorMessage,\n}: ${featureName}MainSectionProps) {\n  return (\n    <Card as=\"section\" className=\"shadow-sm border-0\">\n      <Card.Body>\n        <h1 className=\"h4 mb-1\">{title}</h1>\n        <p className=\"text-secondary mb-3\">{subtitle}</p>\n\n        {isLoading ? <Placeholder as=\"p\" animation=\"glow\"><Placeholder xs={8} /></Placeholder> : null}\n        {errorMessage ? <Alert variant=\"danger\" className=\"mb-0\">{errorMessage}</Alert> : null}\n      </Card.Body>\n    </Card>\n  )\n}\n`,
  },
  {
    path: resolve(workspaceRoot, `src/hooks/use${featureName}PageController.test.ts`),
    content: `import { describe, expect, it } from 'vitest'\nimport { use${featureName}PageController } from './use${featureName}PageController'\n\ndescribe('use${featureName}PageController', () => {\n  it('returns default scaffolded state', () => {\n    const result = use${featureName}PageController()\n\n    expect(result.title).toBe('${featureName}')\n    expect(result.isLoading).toBe(false)\n    expect(result.errorMessage).toBeNull()\n  })\n})\n`,
  },
]

for (const file of files) {
  if (!force && existsSync(file.path)) {
    console.error(`Refusing to overwrite existing file: ${file.path}`)
    console.error('Use --force to overwrite scaffolded files.')
    process.exit(1)
  }
}

for (const file of files) {
  mkdirSync(dirname(file.path), { recursive: true })
  writeFileSync(file.path, file.content, 'utf8')
}

console.log(`Scaffold generated for feature: ${featureName}`)
console.log('Created files:')
for (const file of files) {
  console.log(`- ${file.path.replace(`${workspaceRoot}/`, '')}`)
}
console.log('Next steps:')
console.log('1. Wire route in src/routes/AppRoutes.tsx')
console.log(`2. Replace controller placeholders in src/hooks/use${featureName}PageController.ts`)
console.log('3. Split UI into additional *Section components as needed')
