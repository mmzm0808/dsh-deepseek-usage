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

/* 底栏缓存命中注入 —— usage 插件功能，永久保留，勿改回。
 * 官方 StatsLine 显示「整数近似」命中率。本功能改由插件自算每会话真实
 * 命中率：host /api/deepseek-usage/session-hits 按每个活跃会话的事件 usage
 * 计算 cacheRead/(input+cacheRead+cacheWrite) 的两位小数，latest 字段是
 * 最近有活动的会话（即当前打开的会话）。客户端把该值注入当前会话统计行。
 * 禁止改回：用今日总体值覆盖（会导致所有会话清一色同值）、补 .00
 * （假精度）、做成 no-op（功能失效）。 */
let sessionHitItems: Array<{ id: string; title: string; hit: string | null }> = []
let sessionHitTimer: number | null = null

async function refreshSessionHit(): Promise<void> {
  try {
    const res = await fetch('/api/deepseek-usage/session-hits', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json() as { items?: unknown }
    if (Array.isArray(data.items)) {
      sessionHitItems = data.items as Array<{ id: string; title: string; hit: string | null }>
      patchCacheHitText(document.body)
    }
  } catch {
    // 服务暂不可达；下轮轮询重试。
  }
}

function ensureSessionHitPolling(): void {
  if (sessionHitTimer !== null) return
  void refreshSessionHit()
  sessionHitTimer = window.setInterval(() => { void refreshSessionHit() }, 5000)
}

/** 在 items 中找与面板标题唯一匹配的会话命中率；匹配不到返回 null（保留官方原样）。 */
function matchSessionHit(title: string): string | null {
  const t1 = title.trim()
  if (t1 === '' || sessionHitItems.length === 0) return null
  let found: string | null = null
  for (const item of sessionHitItems) {
    if (item.title === '' || item.hit === null) continue
    if (t1.includes(item.title) || item.title.includes(t1)) {
      if (found !== null) return null // 非唯一，放弃
      found = item.hit
    }
  }
  return found
}

function patchCacheHitText(root: ParentNode): void {
  const pattern = /(缓存命中\s*)(\d+(?:\.\d+)?)%/u
  // 每个 composer dock 统计行属于一个会话面板（[data-slot="conversation"]）。
  // 用面板标题与 host 下发的每会话 titles 精确配对，只替换本会话自己的
  // 两位小数命中率；配不上就保留官方原样，绝不拿别的会话/总体值顶替。
  let docks: Element[] = []
  try { docks = Array.from(root.querySelectorAll('[data-slot="conversation.composer.dock"]')) } catch { return }
  for (const dock of docks) {
    let pane: Element | null = dock.parentElement
    while (pane !== null && pane.getAttribute('data-slot') !== 'conversation') pane = pane.parentElement
    let panelTitle = ''
    if (pane !== null) {
      const header = pane.querySelector('[data-slot="conversation.session.header"]')
      panelTitle = (header?.textContent ?? '').trim()
    }
    const hit = matchSessionHit(panelTitle)
    if (hit === null) continue
    const walker = document.createTreeWalker(dock, NodeFilter.SHOW_TEXT)
    const nodes: Text[] = []
    while (walker.nextNode()) nodes.push(walker.currentNode as Text)
    for (const node of nodes) {
      const value = node.nodeValue
      if (value === null || !pattern.test(value)) continue
      node.nodeValue = value.replace(pattern, (_m, prefix: string) => `${prefix}${hit}%`)
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
      ensureSessionHitPolling()
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
