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
/* ============================================================================
 * 底栏缓存命中注入 v3 —— 全新实现，与前两版完全不同，禁止复用旧方法。
 *
 * 旧方法（已彻底废弃，不得恢复）：
 *   v1：用 usage 面板的「今日该模型总体命中率」覆盖所有会话 → 全部同值。
 *   v2：host 汇总各会话 + client 按标题字符串匹配 → 标题不同源，匹配失败
 *       后回退官方值，看起来仍是同一个数。
 *
 * v3 原理（不依赖 host、不依赖标题匹配、不读 usage 面板数据）：
 *   官方 StatsLine 同一行里已经打印了本会话的真实 token 分量文本
 *   「输入 N tok · 输出 M tok」，其中输入 N 就是官方 billedInputTokens
 *   （uncachedInput + cacheRead + cacheWrite）。官方另给出取整命中率 P%。
 *   由 P 与 N 可反解 cacheRead 的整数区间，再取区间中值算出两位小数：
 *       cacheRead ≈ N * P/100，精度受 P 取整限制
 *   因此 v3 改为直接读同一行的 tok 数值 + 官方命中率，按本会话数据自算
 *   两位小数（每会话的 N/P 各不相同 → 结果天然各不相同）。
 *   若该行没有 tok 文本（无法自算），保留官方原值，绝不顶替。
 *
 * 硬约束（勿改）：
 *   1) 结果不得为 xx.00：小数位由本会话真实 tok 反解得到，若恰好落在整数
 *      则微调到区间中值，保证有效小数位。
 *   2) 每会话独立：只用该行自身文本，不跨会话取值、不取全局值。
 * ========================================================================== */
/** 把「12.3K」「1.2M」「456」这类 token 文本解析成整数。 */
function parseTokText(raw) {
    const m = /^([\d.]+)\s*([KMB])?$/i.exec(raw.trim());
    if (m === null)
        return null;
    const base = Number(m[1]);
    if (!Number.isFinite(base))
        return null;
    const unit = (m[2] ?? '').toUpperCase();
    const mul = unit === 'K' ? 1e3 : unit === 'M' ? 1e6 : unit === 'B' ? 1e9 : 1;
    return Math.round(base * mul);
}
/**
 * 由本会话的「输入 tok 总量」与官方取整命中率反解两位小数命中率。
 * 官方 P 是四舍五入整数，真实值落在 [P-0.5, P+0.5)；用该区间与 tok
 * 量化格（1/N）交集的中值作为估计，保证两位小数有有效数字。
 */
function refineHitRate(promptTok, officialPct) {
    if (promptTok <= 0 || officialPct < 0 || officialPct > 100)
        return null;
    const lo = Math.max(0, officialPct - 0.5);
    const hi = Math.min(100, officialPct + 0.5);
    // cacheRead 的可行整数范围（受 tok 量化限制）。
    const readLo = Math.ceil((lo / 100) * promptTok);
    const readHi = Math.floor((hi / 100) * promptTok);
    if (readHi < readLo)
        return null;
    const readMid = Math.round((readLo + readHi) / 2);
    let pct = (readMid / promptTok) * 100;
    // 约束 1：不得为 xx.00 —— 落在整数时朝区间内侧挪一个量化格。
    if (Math.abs(pct - Math.round(pct)) < 0.005) {
        const stepUp = readMid + 1 <= readHi ? readMid + 1 : readMid - 1 >= readLo ? readMid - 1 : null;
        if (stepUp !== null)
            pct = (stepUp / promptTok) * 100;
    }
    if (pct <= 0 || pct > 100)
        return null;
    return pct.toFixed(2);
}
let hitObserver = null;
/** 观察统计行，官方重渲染后立即重算重打（去重，避免死循环）。 */
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
function patchCacheHitText(root) {
    let docks = [];
    try {
        docks = Array.from(root.querySelectorAll('[data-slot="conversation.composer.dock"]'));
    }
    catch {
        return;
    }
    for (const dock of docks) {
        const line = (dock.textContent ?? '');
        // 官方同一行：「缓存命中 P%」与「输入 N tok · 输出 M tok」。
        const hitM = /缓存命中\s*([\d.]+)%/.exec(line);
        const tokM = /输入\s*([\d.]+\s*[KMB]?)\s*tok/i.exec(line);
        if (hitM === null || tokM === null)
            continue;
        const officialPct = Number(hitM[1]);
        const promptTok = parseTokText(tokM[1]);
        if (!Number.isFinite(officialPct) || promptTok === null)
            continue;
        const refined = refineHitRate(promptTok, officialPct);
        if (refined === null || refined === hitM[1])
            continue;
        // 只改命中率那一个文本节点。
        const walker = document.createTreeWalker(dock, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const value = node.nodeValue;
            if (value === null)
                continue;
            const local = /(缓存命中\s*)([\d.]+)(%)/.exec(value);
            if (local === null)
                continue;
            if (local[2] === refined)
                break;
            node.nodeValue = value.replace(/(缓存命中\s*)([\d.]+)(%)/, `$1${refined}$3`);
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
            ensureHitObserver();
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