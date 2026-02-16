import { assertMockApiRoutesAlignWithOpenApi } from '../../bdd/support/openApiContract'

try {
  assertMockApiRoutesAlignWithOpenApi()
  console.log('BDD mock routes contract alignment check passed.')
} catch (error) {
  console.error('BDD mock routes contract alignment check failed.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
