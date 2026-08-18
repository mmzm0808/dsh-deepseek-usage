/**
 * Check tracked files for common hard-coded secret patterns.
 * Run before committing so credentials never enter the repository.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

/** Name and regex pairs for known credential formats. */
const PATTERNS = [
  { name: 'OpenAI/DeepSeek-style API key', regex: /sk-[A-Za-z0-9]{16,}/ },
  { name: 'GitHub personal access token', regex: /ghp_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub fine-grained token', regex: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'Slack token', regex: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Google API key', regex: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: 'AWS access key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private key block', regex: /-----BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY-----/ },
  { name: 'DeepSeek platform userToken value', regex: /platformUserToken:\s*['"][^'"]{16,}['"]/ },
  { name: 'DeepSeek platform userToken env value', regex: /DEEPSEEK_PLATFORM_USER_TOKEN\s*=\s*[^\s]{16,}/ },
]

const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)

let failed = false
for (const file of files) {
  let content
  try {
    content = readFileSync(join(root, file), 'utf8')
  } catch {
    // Skip binary or unreadable files.
    continue
  }
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(content)) {
      console.error(`check-secrets: possible ${pattern.name} in ${file}`)
      failed = true
    }
  }
}

if (failed) {
  console.error('check-secrets: failed — remove the credential before committing.')
  process.exit(1)
}

console.log('check-secrets: ok')
