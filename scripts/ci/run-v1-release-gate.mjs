#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

const steps = [
  { label: 'Quality gate', command: ['npm', 'run', 'qa'] },
  { label: 'Critical flow gate', command: ['npm', 'run', 'qa:v1:flows'] },
  { label: 'Critical BDD smoke', command: ['npm', 'run', 'e2e:bdd:critical:ci'] },
  { label: 'Visual regression smoke', command: ['npm', 'run', 'visual:test'] },
]

for (const [index, step] of steps.entries()) {
  console.log(`\n[${index + 1}/${steps.length}] ${step.label}: ${step.command.join(' ')}`)
  const result = spawnSync(step.command[0], step.command.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  if (result.status !== 0) {
    console.error(`\nV1 release gate failed at step ${index + 1}: ${step.label}`)
    process.exit(result.status ?? 1)
  }
}

console.log('\nV1 release gate passed.')
