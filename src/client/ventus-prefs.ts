/**
 * Shared Ventus-series UI preferences (localStorage-backed).
 *
 * These are client-only display preferences shared by every Ventus plugin:
 *   - cacheHit2Decimals: rewrite the composer stats "缓存命中 x%" to two decimals.
 *   - fluidConversationWidth: expand the conversation column to fill the space
 *     between sidebars instead of the default fixed 748px column.
 *
 * The same module is mirrored in dsh-ventus-whale so either Ventus plugin can
 * provide the behavior and settings surface.
 */

export const VENTUS_PREFS_KEY = 'dsh.ventus.preferences'
export const VENTUS_PREFS_EVENT = 'ventus:prefs'

export interface VentusPrefs {
  /** When false, the usage widget hides its floating UI and stops polling. */
  usageEnabled: boolean
  /** Rewrite cache-hit percentages to two decimals in the composer stats line. */
  cacheHit2Decimals: boolean
  /** When true, --dsh-chat-content-width becomes fluid (fills sidebar gap). */
  fluidConversationWidth: boolean
  /** When true, the hero page (headline + composer) docks to the column bottom.
      The theme styles the effect; this plugin owns the switch (body class
      `theme-endfield-hero-dock`). */
  heroDockBottom: boolean
}

export const DEFAULT_VENTUS_PREFS: VentusPrefs = {
  usageEnabled: true,
  cacheHit2Decimals: true,
  fluidConversationWidth: true,
  heroDockBottom: true,
}

export function readVentusPrefs(): VentusPrefs {
  try {
    const raw = localStorage.getItem(VENTUS_PREFS_KEY)
    if (raw !== null) return { ...DEFAULT_VENTUS_PREFS, ...JSON.parse(raw) as Partial<VentusPrefs> }
  } catch {
    // Corrupt/blocked storage: fall back to defaults.
  }
  return { ...DEFAULT_VENTUS_PREFS }
}

/** 开放平台真实命中率（两位小数文本），由 usage 主模块在刷新状态时写入。 */
let lastRealHitRate: string | null = null

/** 记录最新真实命中率（今日该模型 命中/（命中+未命中））。无数据传 null。 */
export function setRealHitRate(pct: number | null): void {
  lastRealHitRate = pct === null ? null : pct.toFixed(2)
}

export function writeVentusPrefs(prefs: VentusPrefs): void {
  try {
    localStorage.setItem(VENTUS_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Storage unavailable; the UI still updates in memory for this session.
  }
  window.dispatchEvent(new CustomEvent<VentusPrefs>(VENTUS_PREFS_EVENT, { detail: prefs }))
}

/* ============================================================================
 * 底栏缓存命中注入 v4 —— host 真值 + DOM 配对，彻底消除 xx.00 伪精度。
 *
 * 弃用历史（禁止恢复）：
 *   v1 用 usage 总览的开放平台今日命中率覆盖所有会话（全部同值）。
 *   v2 host 汇总 + 标题字符串匹配（标题不同源，匹配失败回退官方值）。
 *   v3 由官方取整命中率反解区间中值（区间中值常落在整数 → 恒 .00）。
 *
 * v4 原理：
 *   host /api/deepseek-usage/session-hits 直接按每个会话的事件 usage 累加
 *   cacheRead / (input + cacheRead + cacheWrite)，返回未取整的真实两位小数
 *   （hit），同时返回该会话的 promptTok 与官方取整值 officialPct。
 *   client 读官方统计行里的「输入 N tok」+「缓存命中 P%」，用 (P, N) 与
 *   host 列表配对：officialPct 相同且 promptTok 与 N（官方 formatTokens
 *   压缩过，按同样规则压缩后比较）一致 → 认定同一会话，写入 host 的真值。
 *   配不上就保留官方原值，绝不顶替。真值来自各会话自身 token 分量，因此
 *   逐会话不同，且小数位是真实计算结果而非区间估计。
 * ========================================================================== */

interface HitItem {
  id: string
  title: string
  hit: string | null
  promptTok: number
  officialPct: number | null
}

let hitItems: HitItem[] = []
let hitTimer: number | null = null
let hitObserver: MutationObserver | null = null

/** 复刻官方 formatTokens：<1000 原样，<1e6 用 K，其余 M；≥100 取整、否则 1 位小数。 */
function formatTokensLikeOfficial(n: number): string {
  const scaled = (v: number): string => (v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10))
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${scaled(n / 1_000)}K`
  return `${scaled(n / 1_000_000)}M`
}

async function refreshHitItems(): Promise<void> {
  try {
    const res = await fetch('/api/deepseek-usage/session-hits', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json() as { items?: unknown }
    if (Array.isArray(data.items)) {
      hitItems = data.items as HitItem[]
      patchCacheHitText(document.body)
    }
  } catch {
    // 服务暂不可达；下轮轮询重试。
  }
}

/** 观察统计行：官方重渲染刷回原值后立即重打（去重避免死循环）。 */
function ensureHitObserver(): void {
  if (hitObserver !== null) return
  let queued = false
  const flush = (): void => { queued = false; patchCacheHitText(document.body) }
  hitObserver = new MutationObserver(() => {
    if (queued) return
    queued = true
    queueMicrotask(flush)
  })
  hitObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
}

function ensureHitPolling(): void {
  if (hitTimer !== null) return
  void refreshHitItems()
  ensureHitObserver()
  hitTimer = window.setInterval(() => { void refreshHitItems() }, 5000)
}

/** 用 (官方取整值, 官方 tok 文本) 唯一配对本会话的真值。 */
function matchTrueHit(officialPct: number, tokText: string): string | null {
  const wanted = tokText.replace(/\s+/g, '').toUpperCase()
  let found: string | null = null
  for (const item of hitItems) {
    if (item.hit === null || item.officialPct === null) continue
    if (item.officialPct !== officialPct) continue
    if (formatTokensLikeOfficial(item.promptTok).toUpperCase() !== wanted) continue
    if (found !== null && found !== item.hit) return null // 多个会话无法区分，放弃
    found = item.hit
  }
  return found
}

function patchCacheHitText(root: ParentNode): void {
  if (hitItems.length === 0) return
  let docks: Element[] = []
  try { docks = Array.from(root.querySelectorAll('[data-slot="conversation.composer.dock"]')) } catch { return }
  for (const dock of docks) {
    const line = dock.textContent ?? ''
    const hitM = /缓存命中\s*([\d.]+)%/.exec(line)
    const tokM = /输入\s*([\d.]+\s*[KMB]?)\s*tok/i.exec(line)
    if (hitM === null || tokM === null) continue
    const shown = hitM[1]
    const officialPct = Math.round(Number(shown))
    if (!Number.isFinite(officialPct)) continue
    const truth = matchTrueHit(officialPct, tokM[1])
    if (truth === null || truth === shown) continue
    const walker = document.createTreeWalker(dock, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const value = node.nodeValue
      if (value === null) continue
      if (!/缓存命中\s*[\d.]+%/.test(value)) continue
      node.nodeValue = value.replace(/(缓存命中\s*)([\d.]+)(%)/, `$1${truth}$3`)
      break
    }
  }
}

function applyFluidWidth(enabled: boolean): void {
  const scroll = document.querySelector<HTMLElement>('[data-conversation-scroll]')
  const root = scroll?.parentElement
  if (root === undefined || root === null) return
  root.style.setProperty('--dsh-chat-content-width', enabled ? '100%' : '748px')
}

/** The hero-dock switch is a body class the theme's stylesheet styles. */
function applyHeroDock(enabled: boolean): void {
  document.body.classList.toggle('theme-endfield-hero-dock', enabled)
}

/**
 * Apply Ventus display preferences to the live DOM and keep them applied as
 * React re-renders the stats line / conversation column.
 * @returns a disposer that stops the observers.
 */
export function applyVentusPrefs(): () => void {
  let current = readVentusPrefs()
  let observer: MutationObserver | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  const apply = (): void => {
    if (current.cacheHit2Decimals) {
      ensureHitPolling()
      patchCacheHitText(document.body)
    }
    applyFluidWidth(current.fluidConversationWidth)
    applyHeroDock(current.heroDockBottom)
  }

  const ensureRoot = (): void => {
    const scroll = document.querySelector('[data-conversation-scroll]')
    if (scroll?.parentElement === undefined || scroll?.parentElement === null) {
      if (retryTimer === undefined) {
        retryTimer = setTimeout(() => {
          retryTimer = undefined
          apply()
          ensureRoot()
        }, 500)
      }
      return
    }
    if (retryTimer !== undefined) {
      clearTimeout(retryTimer)
      retryTimer = undefined
    }
    apply()
  }

  const onPrefs = (event: Event): void => {
    const detail = (event as CustomEvent<VentusPrefs>).detail
    if (detail !== undefined) current = { ...DEFAULT_VENTUS_PREFS, ...detail }
    ensureRoot()
  }

  window.addEventListener(VENTUS_PREFS_EVENT, onPrefs)
  window.addEventListener('storage', onPrefs)

  let patchQueued = false
  const queuePatch = (): void => {
    // Coalesce bursts of DOM mutations to one pass per frame. Do NOT listen
    // for `characterData` mutations: rewriting the stats text would re-trigger
    // the observer and loop forever (点会话卡死).
    if (patchQueued) return
    patchQueued = true
    requestAnimationFrame(() => {
      patchQueued = false
      if (current.cacheHit2Decimals) patchCacheHitText(document.body)
    })
  }

  // Re-apply the width on every DOM change: the conversation column
  // remounts (session open/restore, phase switch) and drops the inline
  // override, so a one-shot startup apply is not enough.
  observer = new MutationObserver(() => {
    if (current.cacheHit2Decimals) queuePatch()
    applyFluidWidth(current.fluidConversationWidth)
    applyHeroDock(current.heroDockBottom)
  })
  observer.observe(document.body, { childList: true, subtree: true })

  ensureRoot()

  return () => {
    window.removeEventListener(VENTUS_PREFS_EVENT, onPrefs)
    window.removeEventListener('storage', onPrefs)
    observer?.disconnect()
    if (retryTimer !== undefined) clearTimeout(retryTimer)
  }
}
