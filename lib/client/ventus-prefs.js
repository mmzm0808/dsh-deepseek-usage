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
/* 底栏缓存命中注入 —— usage 插件功能，永久保留，勿改回。
 * 官方 StatsLine 显示「整数近似」命中率。本功能改由插件自算每会话真实
 * 命中率：host /api/deepseek-usage/session-hits 按每个活跃会话的事件 usage
 * 计算 cacheRead/(input+cacheRead+cacheWrite) 的两位小数，latest 字段是
 * 最近有活动的会话（即当前打开的会话）。客户端把该值注入当前会话统计行。
 * 禁止改回：用今日总体值覆盖（会导致所有会话清一色同值）、补 .00
 * （假精度）、做成 no-op（功能失效）。 */
let sessionHitValue = null;
let sessionHitTimer = null;
async function refreshSessionHit() {
    try {
        const res = await fetch('/api/deepseek-usage/session-hits', { cache: 'no-store' });
        if (!res.ok)
            return;
        const data = await res.json();
        if (typeof data.latest === 'string' && data.latest !== '') {
            sessionHitValue = data.latest;
            patchCacheHitText(document.body);
        }
    }
    catch {
        // 服务暂不可达；下轮轮询重试。
    }
}
function ensureSessionHitPolling() {
    if (sessionHitTimer !== null)
        return;
    void refreshSessionHit();
    sessionHitTimer = window.setInterval(() => { void refreshSessionHit(); }, 5000);
}
function patchCacheHitText(root) {
    if (sessionHitValue === null)
        return;
    const pattern = /(缓存命中\s*)(\d+(?:\.\d+)?)%/u;
    // 只替换当前会话统计行（官方 composer dock slot 容器）。
    let hosts = [];
    try {
        hosts = Array.from(root.querySelectorAll('[data-slot="conversation.composer.dock"]'));
    }
    catch {
        return;
    }
    for (const host of hosts) {
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode())
            nodes.push(walker.currentNode);
        for (const node of nodes) {
            const value = node.nodeValue;
            if (value === null || !pattern.test(value))
                continue;
            node.nodeValue = value.replace(pattern, (_match, prefix) => `${prefix}${sessionHitValue}%`);
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
            ensureSessionHitPolling();
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