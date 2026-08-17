import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const client = join(root, 'lib', 'client.js')
if (!existsSync(client)) {
  console.error('smoke-client: lib/client.js missing; run pnpm build first')
  process.exit(1)
}
const source = readFileSync(client, 'utf8')
if (!source.includes('window.__ModuleLoader__.load') || !source.includes('DeepSeek API 用量')) {
  console.error('smoke-client: lib/client.js does not contain the expected client bundle surface')
  process.exit(1)
}
console.log('smoke-client: ok')
