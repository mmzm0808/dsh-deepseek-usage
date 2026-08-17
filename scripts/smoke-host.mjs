import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const host = join(root, 'lib', 'index.js')
if (!existsSync(host)) {
  console.error('smoke-host: lib/index.js missing; run pnpm build first')
  process.exit(1)
}
const source = readFileSync(host, 'utf8')
if (!source.includes('deepseek-usage') || !source.includes('platformUserToken')) {
  console.error('smoke-host: lib/index.js does not contain the expected platform plugin surface')
  process.exit(1)
}
console.log('smoke-host: ok')
