#!/usr/bin/env node
import { spawn } from 'node:child_process'

const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const PORT = Number(process.env.E2E_PORT ?? '4173')
const START_TIMEOUT_MS = Number(process.env.E2E_START_TIMEOUT_MS ?? '60000')
const READY_URL = `http://${HOST}:${PORT}`

function parseArgs(argv) {
  const args = [...argv]
  let script = 'bdd:test'
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
    passthrough.push(current)
  }

  return { script, passthrough }
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
  throw new Error(`Timed out waiting for dev server at ${url}`)
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    })
    child.on('exit', (code, signal) => {
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
  const { script, passthrough } = parseArgs(process.argv.slice(2))

  const server = spawn('npx', ['vite', '--host', HOST, '--port', String(PORT)], {
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
      throw new Error('Dev server exited before test execution started')
    }

    const testArgs = ['run', script]
    if (passthrough.length > 0) {
      testArgs.push('--', ...passthrough)
    }
    const testResult = await runCommand('npm', testArgs)
    await stopServer(server)
    process.exit(testResult.code)
  } catch (error) {
    console.error(String(error instanceof Error ? error.message : error))
    await stopServer(server)
    process.exit(1)
  }
}

await main()
