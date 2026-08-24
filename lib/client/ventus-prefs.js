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
export const VENTUS_PREFS_KEY = 'dsh.ventus.preferences';
export const VENTUS_PREFS_EVENT = 'ventus:prefs';
export const DEFAULT_VENTUS_PREFS = {
    usageEnabled: true,
    cacheHit2Decimals: true,
    fluidConversationWidth: true,
    heroDockBottom: true,
};
export function readVentusPrefs() {
    try {
        const raw = localStorage.getItem(VENTUS_PREFS_KEY);
        if (raw !== null)
            return { ...DEFAULT_VENTUS_PREFS, ...JSON.parse(raw) };
    }
    catch {
        // Corrupt/blocked storage: fall back to defaults.
    }
    return { ...DEFAULT_VENTUS_PREFS };
}
/** 开放平台真实命中率（两位小数文本），由 usage 主模块在刷新状态时写入。 */
let lastRealHitRate = null;
/** 记录最新真实命中率（今日该模型 命中/（命中+未命中））。无数据传 null。 */
export function setRealHitRate(pct) {
    lastRealHitRate = pct === null ? null : pct.toFixed(2);
}
export function writeVentusPrefs(prefs) {
    try {
        localStorage.setItem(VENTUS_PREFS_KEY, JSON.stringify(prefs));
    }
    catch {
        // Storage unavailable; the UI still updates in memory for this session.
    }
    window.dispatchEvent(new CustomEvent(VENTUS_PREFS_EVENT, { detail: prefs }));
}
let hitItems = [];
let hitTimer = null;
let hitObserver = null;
/** 复刻官方 formatTokens：<1000 原样，<1e6 用 K，其余 M；≥100 取整、否则 1 位小数。 */
function formatTokensLikeOfficial(n) {
    const scaled = (v) => (v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10));
    if (n < 1_000)
        return String(n);
    if (n < 1_000_000)
        return `${scaled(n / 1_000)}K`;
    return `${scaled(n / 1_000_000)}M`;
}
async function refreshHitItems() {
    try {
        const res = await fetch('/api/deepseek-usage/session-hits', { cache: 'no-store' });
        if (!res.ok)
            return;
        const data = await res.json();
        if (Array.isArray(data.items)) {
            hitItems = data.items;
            patchCacheHitText(document.body);
        }
    }
    catch {
        // 服务暂不可达；下轮轮询重试。
    }
}
/** 观察统计行：官方重渲染刷回原值后立即重打（去重避免死循环）。 */
function ensureHitObserver() {
    if (hitObserver !== null)
        return;
    let queued = false;
    const flush = () => { queued = false; patchCacheHitText(document.body); };
    hitObserver = new MutationObserver(() => {
        if (queued)
            return;
        queued = true;
        queueMicrotask(flush);
    });
    hitObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}
function ensureHitPolling() {
    if (hitTimer !== null)
        return;
    void refreshHitItems();
    ensureHitObserver();
    hitTimer = window.setInterval(() => { void refreshHitItems(); }, 5000);
}
/** 用 (官方取整值, 官方 tok 文本) 唯一配对本会话的真值。 */
function matchTrueHit(officialPct, tokText) {
    const wanted = tokText.replace(/\s+/g, '').toUpperCase();
    let found = null;
    for (const item of hitItems) {
        if (item.hit === null || item.officialPct === null)
            continue;
        if (item.officialPct !== officialPct)
            continue;
        if (formatTokensLikeOfficial(item.promptTok).toUpperCase() !== wanted)
            continue;
        if (found !== null && found !== item.hit)
            return null; // 多个会话无法区分，放弃
        found = item.hit;
    }
    return found;
}
function patchCacheHitText(root) {
    if (hitItems.length === 0)
        return;
    let docks = [];
    try {
        docks = Array.from(root.querySelectorAll('[data-slot="conversation.composer.dock"]'));
    }
    catch {
        return;
    }
    for (const dock of docks) {
        const line = dock.textContent ?? '';
        const hitM = /缓存命中\s*([\d.]+)%/.exec(line);
        const tokM = /输入\s*([\d.]+\s*[KMB]?)\s*tok/i.exec(line);
        if (hitM === null || tokM === null)
            continue;
        const shown = hitM[1];
        const officialPct = Math.round(Number(shown));
        if (!Number.isFinite(officialPct))
            continue;
        const truth = matchTrueHit(officialPct, tokM[1]);
        if (truth === null || truth === shown)
            continue;
        const walker = document.createTreeWalker(dock, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const value = node.nodeValue;
            if (value === null)
                continue;
            if (!/缓存命中\s*[\d.]+%/.test(value))
                continue;
            node.nodeValue = value.replace(/(缓存命中\s*)([\d.]+)(%)/, `$1${truth}$3`);
            break;
        }
    }
}
function applyFluidWidth(enabled) {
    const scroll = document.querySelector('[data-conversation-scroll]');
    const root = scroll?.parentElement;
    if (root === undefined || root === null)
        return;
    root.style.setProperty('--dsh-chat-content-width', enabled ? '100%' : '748px');
}
/** The hero-dock switch is a body class the theme's stylesheet styles. */
function applyHeroDock(enabled) {
    document.body.classList.toggle('theme-endfield-hero-dock', enabled);
}
/**
 * Apply Ventus display preferences to the live DOM and keep them applied as
 * React re-renders the stats line / conversation column.
 * @returns a disposer that stops the observers.
 */
export function applyVentusPrefs() {
    let current = readVentusPrefs();
    let observer;
    let retryTimer;
    const apply = () => {
        if (current.cacheHit2Decimals) {
            ensureHitPolling();
            patchCacheHitText(document.body);
        }
        applyFluidWidth(current.fluidConversationWidth);
        applyHeroDock(current.heroDockBottom);
    };
    const ensureRoot = () => {
        const scroll = document.querySelector('[data-conversation-scroll]');
        if (scroll?.parentElement === undefined || scroll?.parentElement === null) {
            if (retryTimer === undefined) {
                retryTimer = setTimeout(() => {
                    retryTimer = undefined;
                    apply();
                    ensureRoot();
                }, 500);
            }
            return;
        }
        if (retryTimer !== undefined) {
            clearTimeout(retryTimer);
            retryTimer = undefined;
        }
        apply();
    };
    const onPrefs = (event) => {
        const detail = event.detail;
        if (detail !== undefined)
            current = { ...DEFAULT_VENTUS_PREFS, ...detail };
        ensureRoot();
    };
    window.addEventListener(VENTUS_PREFS_EVENT, onPrefs);
    window.addEventListener('storage', onPrefs);
    let patchQueued = false;
    const queuePatch = () => {
        // Coalesce bursts of DOM mutations to one pass per frame. Do NOT listen
        // for `characterData` mutations: rewriting the stats text would re-trigger
        // the observer and loop forever (点会话卡死).
        if (patchQueued)
            return;
        patchQueued = true;
        requestAnimationFrame(() => {
            patchQueued = false;
            if (current.cacheHit2Decimals)
                patchCacheHitText(document.body);
        });
    };
    // Re-apply the width on every DOM change: the conversation column
    // remounts (session open/restore, phase switch) and drops the inline
    // override, so a one-shot startup apply is not enough.
    observer = new MutationObserver(() => {
        if (current.cacheHit2Decimals)
            queuePatch();
        applyFluidWidth(current.fluidConversationWidth);
        applyHeroDock(current.heroDockBottom);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    ensureRoot();
    return () => {
        window.removeEventListener(VENTUS_PREFS_EVENT, onPrefs);
        window.removeEventListener('storage', onPrefs);
        observer?.disconnect();
        if (retryTimer !== undefined)
            clearTimeout(retryTimer);
    };
}
//# sourceMappingURL=ventus-prefs.js.map