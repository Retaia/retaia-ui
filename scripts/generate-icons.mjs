import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const source = process.env.ICON_SOURCE
  ? resolve(process.cwd(), process.env.ICON_SOURCE)
  : resolve(process.cwd(), 'public/retaia-logo-512.png')
const publicDir = resolve(process.cwd(), 'public')

if (!existsSync(source)) {
  console.error(`Icon source not found: ${source}`)
  process.exit(1)
}

const magickCheck = spawnSync('magick', ['-version'], { stdio: 'ignore' })
if (magickCheck.status !== 0) {
  console.error('ImageMagick is required. Install it and ensure `magick` is available in PATH.')
  process.exit(1)
}

const outputs = [
  { file: 'android-chrome-512x512.png', args: ['-resize', '512x512'] },
  { file: 'android-chrome-192x192.png', args: ['-resize', '192x192'] },
  { file: 'apple-touch-icon.png', args: ['-resize', '180x180'] },
  { file: 'favicon-32x32.png', args: ['-resize', '32x32'] },
  { file: 'favicon-16x16.png', args: ['-resize', '16x16'] },
]

mkdirSync(publicDir, { recursive: true })

for (const output of outputs) {
  const target = resolve(publicDir, output.file)
  const result = spawnSync('magick', [source, ...output.args, target], { stdio: 'inherit' })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const faviconIco = resolve(publicDir, 'favicon.ico')
const icoResult = spawnSync(
  'magick',
  [source, '-define', 'icon:auto-resize=16,32,48', faviconIco],
  { stdio: 'inherit' },
)
if (icoResult.status !== 0) {
  process.exit(icoResult.status ?? 1)
}

const manifestPath = resolve(publicDir, 'site.webmanifest')
mkdirSync(dirname(manifestPath), { recursive: true })
writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      name: 'Retaia UI',
      short_name: 'Retaia',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#0a1a2a',
      background_color: '#0a1a2a',
      display: 'standalone',
    },
    null,
    2,
  ) + '\n',
  'utf8',
)

console.log('Icons generated in /public')
