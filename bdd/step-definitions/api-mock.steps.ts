import { Given } from '@cucumber/cucumber'
import { mockApiState } from '../support/testRuntime'

Given('le mock API retourne FORBIDDEN_SCOPE sur la preview batch', async () => {
  mockApiState.previewShouldFailScope = true
})

Given('le mock API retourne une erreur sur la liste assets', async () => {
  mockApiState.assetsListShouldFail = true
})

Given('le mock API retarde la liste assets de {int} ms', async (delayMs: number) => {
  mockApiState.assetsListDelayMs = delayMs
})

Given('le mock API retourne une liste assets partiellement invalide', async () => {
  mockApiState.assetsListMalformed = true
})

Given('le mock API retourne TEMPORARY_UNAVAILABLE une fois sur la preview batch', async () => {
  mockApiState.previewTemporaryOnce = true
})

Given('le mock API retourne STATE_CONFLICT sur l\'exécution batch', async () => {
  mockApiState.executeShouldFailStateConflict = true
})

Given('le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch', async () => {
  mockApiState.reportShouldFailTemporary = true
})

Given('le mock API retourne FORBIDDEN_SCOPE sur la preview purge', async () => {
  mockApiState.purgePreviewShouldFailScope = true
})

Given('le mock API retourne STATE_CONFLICT sur la confirmation purge', async () => {
  mockApiState.purgeExecuteShouldFailStateConflict = true
})

Given('le mock API retourne FORBIDDEN_SCOPE sur le patch asset', async () => {
  mockApiState.assetPatchShouldFailScope = true
})
