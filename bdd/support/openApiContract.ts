import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete'

type OpenApiContract = {
  operations: Map<string, Set<string>>
  errorCodes: Set<string>
}

type MockOperationContract = {
  path: string
  method: HttpMethod
}

const MOCK_OPERATION_CONTRACTS: MockOperationContract[] = [
  { path: '/app/policy', method: 'get' },
  { path: '/assets', method: 'get' },
  { path: '/assets/{uuid}', method: 'get' },
  { path: '/assets/{uuid}', method: 'patch' },
  { path: '/batches/moves/preview', method: 'post' },
  { path: '/batches/moves', method: 'post' },
  { path: '/batches/moves/{batch_id}', method: 'get' },
  { path: '/assets/{uuid}/purge/preview', method: 'post' },
  { path: '/assets/{uuid}/decision', method: 'post' },
  { path: '/assets/{uuid}/purge', method: 'post' },
]

const MOCK_ERROR_CODES = [
  'FORBIDDEN_SCOPE',
  'IDEMPOTENCY_CONFLICT',
  'STATE_CONFLICT',
  'TEMPORARY_UNAVAILABLE',
]

let cachedContract: OpenApiContract | null = null

function indentation(line: string): number {
  let count = 0
  while (count < line.length && line[count] === ' ') {
    count += 1
  }
  return count
}

function contractKey(path: string, method: HttpMethod): string {
  return `${method.toUpperCase()} ${path}`
}

function parseOpenApiContractFromSpecs(): OpenApiContract {
  const specPath = resolve(process.cwd(), 'specs', 'api', 'openapi', 'v1.yaml')
  const lines = readFileSync(specPath, 'utf-8').split(/\r?\n/)

  const operations = new Map<string, Set<string>>()
  const errorCodes = new Set<string>()

  let inPaths = false
  let currentPath: string | null = null
  let currentMethod: HttpMethod | null = null
  let inResponses = false

  let inErrorResponse = false
  let errorResponseIndent = -1
  let inErrorCode = false
  let errorCodeIndent = -1
  let inErrorCodeEnum = false
  let errorCodeEnumIndent = -1

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '    ')
    const trimmed = line.trim()
    const indent = indentation(line)

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue
    }

    if (trimmed === 'paths:') {
      inPaths = true
      currentPath = null
      currentMethod = null
      inResponses = false
      continue
    }

    if (trimmed === 'components:') {
      inPaths = false
      currentPath = null
      currentMethod = null
      inResponses = false
      continue
    }

    if (inPaths) {
      const pathMatch = line.match(/^ {2}(\/[^:]+):\s*$/)
      if (pathMatch) {
        currentPath = pathMatch[1] ?? null
        currentMethod = null
        inResponses = false
        continue
      }

      const methodMatch = line.match(/^ {4}(get|post|patch|put|delete):\s*$/)
      if (methodMatch && currentPath) {
        currentMethod = (methodMatch[1] as HttpMethod) ?? null
        inResponses = false
        continue
      }

      if (indent <= 4) {
        inResponses = false
      }

      if (trimmed === 'responses:') {
        inResponses = true
        continue
      }

      if (inResponses && currentPath && currentMethod) {
        const statusMatch = trimmed.match(/^['"]?([0-9]{3}|default)['"]?:$/)
        if (statusMatch) {
          const key = contractKey(currentPath, currentMethod)
          const statusSet = operations.get(key) ?? new Set<string>()
          statusSet.add(statusMatch[1] as string)
          operations.set(key, statusSet)
        }
      }
    }

    if (trimmed === 'ErrorResponse:') {
      inErrorResponse = true
      errorResponseIndent = indent
      inErrorCode = false
      inErrorCodeEnum = false
      continue
    }
    if (inErrorResponse && indent <= errorResponseIndent && trimmed !== 'ErrorResponse:') {
      inErrorResponse = false
      errorResponseIndent = -1
      inErrorCode = false
      errorCodeIndent = -1
      inErrorCodeEnum = false
      errorCodeEnumIndent = -1
    }
    if (!inErrorResponse) {
      continue
    }

    if (trimmed === 'code:') {
      inErrorCode = true
      errorCodeIndent = indent
      inErrorCodeEnum = false
      continue
    }
    if (inErrorCode && indent <= errorCodeIndent && trimmed !== 'code:') {
      inErrorCode = false
      errorCodeIndent = -1
      inErrorCodeEnum = false
      errorCodeEnumIndent = -1
    }
    if (!inErrorCode) {
      continue
    }

    if (trimmed === 'enum:') {
      inErrorCodeEnum = true
      errorCodeEnumIndent = indent
      continue
    }
    if (inErrorCodeEnum && indent <= errorCodeEnumIndent && trimmed !== 'enum:') {
      inErrorCodeEnum = false
      errorCodeEnumIndent = -1
    }
    if (!inErrorCodeEnum) {
      continue
    }

    const enumEntryMatch = trimmed.match(/^- ([A-Z0-9_]+)$/)
    if (enumEntryMatch) {
      errorCodes.add(enumEntryMatch[1] as string)
    }
  }

  return { operations, errorCodes }
}

function openApiContract(): OpenApiContract {
  if (!cachedContract) {
    cachedContract = parseOpenApiContractFromSpecs()
  }
  return cachedContract
}

export function assertMockApiRoutesAlignWithOpenApi() {
  const contract = openApiContract()

  for (const operation of MOCK_OPERATION_CONTRACTS) {
    const key = contractKey(operation.path, operation.method)
    if (!contract.operations.has(key)) {
      throw new Error(`[bdd-mock-contract] Missing operation in OpenAPI: ${key}`)
    }
  }

  for (const code of MOCK_ERROR_CODES) {
    if (!contract.errorCodes.has(code)) {
      throw new Error(`[bdd-mock-contract] Missing ErrorResponse code in OpenAPI enum: ${code}`)
    }
  }
}
