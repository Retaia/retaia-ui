import { Given, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { mockApiState, requireBddMockApiMode } from '../support/testRuntime'

function ensureMockMode(stepName: string) {
  requireBddMockApiMode(stepName)
}

Given('le mock API retourne FORBIDDEN_SCOPE sur la preview batch', async () => {
  ensureMockMode('le mock API retourne FORBIDDEN_SCOPE sur la preview batch')
  mockApiState.previewShouldFailScope = true
})

Given('le mock API retourne une erreur sur la liste assets', async () => {
  ensureMockMode('le mock API retourne une erreur sur la liste assets')
  mockApiState.assetsListShouldFail = true
})

Given('le mock API retarde la liste assets de {int} ms', async (delayMs: number) => {
  ensureMockMode('le mock API retarde la liste assets de {int} ms')
  mockApiState.assetsListDelayMs = delayMs
})

Given('le mock API retourne une liste assets partiellement invalide', async () => {
  ensureMockMode('le mock API retourne une liste assets partiellement invalide')
  mockApiState.assetsListMalformed = true
})

Given('le mock API retourne TEMPORARY_UNAVAILABLE une fois sur la preview batch', async () => {
  ensureMockMode('le mock API retourne TEMPORARY_UNAVAILABLE une fois sur la preview batch')
  mockApiState.previewTemporaryOnce = true
})

Given('le mock API retourne STATE_CONFLICT sur l\'exécution batch', async () => {
  ensureMockMode('le mock API retourne STATE_CONFLICT sur l\'exécution batch')
  mockApiState.executeShouldFailStateConflict = true
})

Given('le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch', async () => {
  ensureMockMode('le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch')
  mockApiState.reportShouldFailTemporary = true
})

Given('le mock API retourne FORBIDDEN_SCOPE sur la preview purge', async () => {
  ensureMockMode('le mock API retourne FORBIDDEN_SCOPE sur la preview purge')
  mockApiState.purgePreviewShouldFailScope = true
})

Given('le mock API retourne STATE_CONFLICT sur la confirmation purge', async () => {
  ensureMockMode('le mock API retourne STATE_CONFLICT sur la confirmation purge')
  mockApiState.purgeExecuteShouldFailStateConflict = true
})

Given('le mock API retourne FORBIDDEN_SCOPE sur le patch asset', async () => {
  ensureMockMode('le mock API retourne FORBIDDEN_SCOPE sur le patch asset')
  mockApiState.assetPatchShouldFailScope = true
})

Given('le mock API retourne FORBIDDEN_SCOPE sur la décision asset', async () => {
  ensureMockMode('le mock API retourne FORBIDDEN_SCOPE sur la décision asset')
  mockApiState.decisionShouldFailScope = true
})

Given('le mock API retourne STATE_CONFLICT sur la décision asset', async () => {
  ensureMockMode('le mock API retourne STATE_CONFLICT sur la décision asset')
  mockApiState.decisionShouldFailStateConflict = true
})

Given('le mock API retourne STATE_CONFLICT une seule fois sur la décision asset', async () => {
  ensureMockMode('le mock API retourne STATE_CONFLICT une seule fois sur la décision asset')
  mockApiState.decisionShouldFailStateConflictOnce = true
})

Given('le mock API auth requiert OTP une fois', async () => {
  ensureMockMode('le mock API auth requiert OTP une fois')
  mockApiState.authLoginRequiresOtpOnce = true
})

Then('le mock API a reçu {int} décisions asset', async (count: number) => {
  ensureMockMode('le mock API a reçu {int} décisions asset')
  expect(mockApiState.decisionCalls).toBe(count)
})
