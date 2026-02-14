#!/usr/bin/env node
import { spawn } from 'node:child_process'

const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const PORT = Number(process.env.E2E_PORT ?? '4173')
const START_TIMEOUT_MS = Number(process.env.E2E_START_TIMEOUT_MS ?? '60000')
const TEST_TIMEOUT_MS = Number(process.env.E2E_TEST_TIMEOUT_MS ?? '900000')
const HEARTBEAT_MS = Number(process.env.E2E_HEARTBEAT_MS ?? '15000')
const READY_URL = `http://${HOST}:${PORT}`

function parseArgs(argv) {
  const args = [...argv]
  let script = 'bdd:test'
  let serveMode = 'dev'
  let buildFirst = false
  const passthrough = []

  while (args.length > 0) {
    const current = args.shift()
    if (!current) {
      continue
    }
    if (current === '--') {
      passthrough.push(...args)
      break
    }
    if (current === '--script') {
      const value = args.shift()
      if (!value) {
        throw new Error('Missing value after --script')
      }
      script = value
      continue
    }
    if (current === '--serve') {
      const value = args.shift()
      if (!value || (value !== 'dev' && value !== 'preview')) {
        throw new Error('Missing or invalid value after --serve (expected dev|preview)')
      }
      serveMode = value
      continue
    }
    if (current === '--build') {
      buildFirst = true
      continue
    }
    passthrough.push(current)
  }

  return { script, serveMode, buildFirst, passthrough }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Keep retrying until timeout.
    }
    await wait(500)
  }
  throw new Error(`Timed out waiting for server at ${url}`)
}

function runCommand(command, args, options = {}) {
  const { timeoutMs = 0, heartbeatMs = 0, heartbeatLabel = '', ...spawnOptions } = options
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...spawnOptions,
    })

    const startedAt = Date.now()
    let heartbeatTimer = null
    let timeoutTimer = null

    if (heartbeatMs > 0 && heartbeatLabel) {
      heartbeatTimer = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startedAt) / 1000)
        console.log(`[${heartbeatLabel}] still running (${elapsedSec}s elapsed)`)
      }, heartbeatMs)
    }

    if (timeoutMs > 0) {
      timeoutTimer = setTimeout(() => {
        const elapsedSec = Math.floor((Date.now() - startedAt) / 1000)
        console.error(`[e2e-timeout] exceeded ${Math.floor(timeoutMs / 1000)}s after ${elapsedSec}s`)
        child.kill('SIGTERM')
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL')
          }
        }, 3000)
      }, timeoutMs)
    }

    child.on('exit', (code, signal) => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
      }
      resolve({ code: code ?? 1, signal, child })
    })
  })
}

async function stopServer(server) {
  if (!server || server.killed) {
    return
  }

  server.kill('SIGTERM')
  const result = await Promise.race([
    new Promise((resolve) => server.once('exit', () => resolve('stopped'))),
    wait(3000).then(() => 'timeout'),
  ])

  if (result === 'timeout' && !server.killed) {
    server.kill('SIGKILL')
  }
}

async function main() {
  const { script, serveMode, buildFirst, passthrough } = parseArgs(process.argv.slice(2))

  if (buildFirst) {
    const buildResult = await runCommand('npm', ['run', 'build'])
    if (buildResult.code !== 0) {
      process.exit(buildResult.code)
    }
  }

  const serverArgs =
    serveMode === 'preview'
      ? ['vite', 'preview', '--host', HOST, '--port', String(PORT)]
      : ['vite', '--host', HOST, '--port', String(PORT)]

  const server = spawn('npx', serverArgs, {
    stdio: 'inherit',
    shell: false,
  })

  let serverExitedEarly = false
  server.on('exit', () => {
    serverExitedEarly = true
  })

  try {
    await waitForServer(READY_URL, START_TIMEOUT_MS)
    if (serverExitedEarly) {
      throw new Error('Server exited before test execution started')
    }

    const testArgs = ['run', script]
    if (passthrough.length > 0) {
      testArgs.push('--', ...passthrough)
    }
    const testResult = await runCommand('npm', testArgs, {
      timeoutMs: TEST_TIMEOUT_MS,
      heartbeatMs: HEARTBEAT_MS,
      heartbeatLabel: `bdd:${script}`,
    })
    await stopServer(server)
    process.exit(testResult.code)
  } catch (error) {
    console.error(String(error instanceof Error ? error.message : error))
    await stopServer(server)
    process.exit(1)
  }
}

await main()
