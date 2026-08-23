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

function patchCacheHitText(root: ParentNode): void {
  const pattern = /(缓存命中\s*)(\d+(?:\.\d+)?)%/u
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node.nodeType === Node.TEXT_NODE) textNodes.push(node as Text)
  }
  for (const node of textNodes) {
    const value = node.nodeValue
    if (value === null || !pattern.test(value)) continue
    node.nodeValue = value.replace(pattern, (_match, prefix: string, raw: string) => {
      /* 用真实数值替换：官方 StatsLine 的缓存命中是「整数百分比近似」
         （roundedIntegerPercent 取整）——直接 toFixed(2) 只会造出假
         「.00」。有开放平台真实数据（今日该模型 cacheHitTokens /
         cacheMissTokens）时用真实两位小数；无数据时保留官方整数原样，
         绝不把近似值伪装成两位小数。 */
      if (lastRealHitRate !== null) return `${prefix}${lastRealHitRate}%`
      return `${prefix}${raw}%`
    })
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
    if (current.cacheHit2Decimals) patchCacheHitText(document.body)
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
