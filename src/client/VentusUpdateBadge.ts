/**
 * Ventus 整合包更新入口（客户端）。
 *
 * 点击流程（安装确认 → 顶层模态）：
 *  1. 先弹「是否安装更新？」确认框；
 *  2. 确认后打开顶层模态（VentusUpdateModal）：完整多选安装/更新列表，
 *     仅对勾选项执行更新（未勾选的已装子插件保持旧版不动）。
 *
 * 徽标显示整合包远程与本地提交的比对结果：
 *  - 有新提交 → 「发现更新 · sha」（高亮可点）；
 *  - 无新提交 → 「已是最新版本」；
 *  - 检查失败 → 「检查失败」。
 * 无论哪种状态都可点击打开安装窗口（最小包用户可借此补装未安装的子插件）。
 *
 * 纯客户端实现（GitHub 公开 API，无需 token），失败时静默降级。
 * @module dsh-deepseek-usage/client/VentusUpdateBadge
 */

import { createElement, useEffect, useState } from 'react'
import { VentusUpdateModal } from './VentusUpdateModal.js'

/** 整合包仓库（owner/repo）。 */
const REPO = 'mmzm0808/dsh-ventus-plugins'
/** 本地已安装版本对应的提交 sha（构建时写入，见 scripts/build-client.mjs 的 STAMP_SHA）。 */
const LOCAL_SHA_KEY = 'dsh.ventus.localSha'
/** 检查结果缓存键（避免每次进设置页都打 GitHub）。 */
const CACHE_KEY = 'dsh.ventus.updateCheck'
/** 缓存有效期：30 分钟。 */
const CACHE_TTL_MS = 30 * 60 * 1000

type State =
  | { kind: 'checking' }
  | { kind: 'latest' }
  | { kind: 'update'; sha: string; message: string }
  | { kind: 'error' }

interface CacheShape {
  at: number
  remoteSha: string
  message: string
}

function readLocalSha(): string | null {
  try {
    const v = localStorage.getItem(LOCAL_SHA_KEY)
    return typeof v === 'string' && v.length >= 7 ? v : null
  } catch { return null }
}

function readCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as Partial<CacheShape>
    if (typeof parsed?.at !== 'number' || typeof parsed?.remoteSha !== 'string') return null
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null
    return { at: parsed.at, remoteSha: parsed.remoteSha, message: typeof parsed.message === 'string' ? parsed.message : '' }
  } catch { return null }
}

function writeCache(value: CacheShape): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)) } catch { /* 忽略 */ }
}

const badgeStyle: Record<string, string> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 10px',
  borderRadius: '10px',
  fontSize: '11px',
  lineHeight: '18px',
  border: '1px solid var(--dsw-alias-border-l2)',
  background: 'transparent',
  color: 'var(--dsw-alias-label-secondary)',
  cursor: 'pointer',
}

const updateStyle: Record<string, string> = {
  ...badgeStyle,
  border: '1px solid var(--edge-accent, var(--dsw-alias-state-business-primary))',
  color: 'var(--edge-accent, var(--dsw-alias-state-business-primary))',
}

/** 整合包更新入口（放在 Ventus 设置页右上角）。 */
export function VentusUpdateBadge(): unknown {
  const [state, setState] = useState<State>({ kind: 'checking' })
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let alive = true
    const localSha = readLocalSha()
    const decide = (remoteSha: string, message: string): void => {
      if (!alive) return
      if (localSha === null || remoteSha.startsWith(localSha) || localSha.startsWith(remoteSha)) {
        setState({ kind: 'latest' })
      } else {
        setState({ kind: 'update', sha: remoteSha.slice(0, 7), message })
      }
    }
    const cached = readCache()
    if (cached !== null) { decide(cached.remoteSha, cached.message); return () => { alive = false } }
    fetch(`https://api.github.com/repos/${REPO}/commits?per_page=1`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`http ${res.status}`)
        return await res.json() as Array<{ sha?: unknown; commit?: { message?: unknown } }>
      })
      .then((list) => {
        const top = Array.isArray(list) ? list[0] : undefined
        const sha = typeof top?.sha === 'string' ? top.sha : ''
        const message = typeof top?.commit?.message === 'string' ? top.commit.message.split('\n')[0] : ''
        if (sha === '') throw new Error('no sha')
        writeCache({ at: Date.now(), remoteSha: sha, message })
        decide(sha, message)
      })
      .catch(() => { if (alive) setState({ kind: 'error' }) })
    return () => { alive = false }
  }, [])

  const open = (): void => {
    if (window.confirm('是否安装更新？\n\n点击确定后将打开安装窗口，可勾选要安装 / 更新的插件，仅对选中项执行更新。')) {
      setModalOpen(true)
    }
  }

  const label = state.kind === 'checking' ? '检查更新…'
    : state.kind === 'error' ? '检查失败'
      : state.kind === 'latest' ? '已是最新版本'
        : `发现更新 · ${state.sha}`

  return createElement('span', { style: { display: 'inline-flex' } },
    createElement('button', {
      type: 'button',
      style: state.kind === 'update' ? updateStyle : badgeStyle,
      title: state.kind === 'update' && state.message !== ''
        ? `最新提交：${state.message}`
        : '打开安装 / 更新窗口',
      onClick: open,
    }, label),
    modalOpen && createElement(VentusUpdateModal, {
      onClose: () => { setModalOpen(false) },
    }),
  )
}
