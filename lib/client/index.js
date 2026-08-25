/**
 * dsh-deepseek-usage — browser half. Renders a floating right-edge ball and a
 * slide-in usage panel as a body portal. The panel shows only exact values
 * fetched from the DeepSeek Platform private API.
 * @module dsh-deepseek-usage/client
 */
import html2canvas from 'html2canvas-pro';
import { DeepSeekUsageSettingsCard } from './VentusSettingsCard.js';
import { VentusSettingsPage } from './VentusSettingsPage.js';
import { applyVentusPrefs, readVentusPrefs, setRealHitRate, VENTUS_PREFS_EVENT } from './ventus-prefs.js';
/** Required services: slots lets the plugin claim a shell overlay seat. */
export const inject = ['slots'];
/** Plugin namespace for styles and DOM queries. */
const NS = 'dsu';
/** Poll interval for state refreshes in milliseconds. */
const POLL_MS = 10_000;
const CSS = `
[data-${NS}] { --dsu-bg:var(--dsw-alias-bg-base, #0b0e14); --dsu-panel:var(--dsw-alias-bg-module-platform, #12161f); --dsu-panel-2:var(--dsw-alias-bg-module-hover, #171c27); --dsu-border:var(--dsw-alias-line-normal, rgba(255,255,255,.08)); --dsu-text:var(--dsw-alias-label-primary, #e7ecf3); --dsu-muted:var(--dsw-alias-label-secondary, #8b95a7); /* 强调色与圆角跟随外层主题（终末地主题提供 --edge-accent/--edge-radius，官方主题回落官方 token） */ --dsu-brand:var(--edge-accent, var(--dsw-alias-state-business-primary, #4d6bfe)); --dsu-green:#34d399; --dsu-gold:#ffd166; --dsu-red:#f87171; --dsu-link:#8ea2ff; --dsu-radius:var(--edge-radius, 14px); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; color:var(--dsu-text); }
body:not([data-ds-dark-theme]) [data-${NS}] { --dsu-bg:#eef0f4; --dsu-panel:#ffffff; --dsu-panel-2:#f4f5f7; --dsu-border:rgba(15,17,21,.08); --dsu-text:#1a1d21; --dsu-muted:#5b6472; --dsu-green:#059669; --dsu-gold:#8a6100; --dsu-red:#dc2626; --dsu-link:#2563eb; }
[data-${NS}]{ position:fixed; inset:0; z-index:12; pointer-events:none; }
[data-${NS}] *{ box-sizing:border-box; }
.${NS}-ball{ position:absolute; top:calc(50% - 26px); right:0; display:flex; align-items:center; gap:10px; background:var(--dsu-panel-2); border:1px solid color-mix(in srgb, var(--dsu-brand) 45%, transparent); border-radius:999px 0 0 999px; padding:10px 14px 10px 12px; box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb, var(--dsu-brand) 12%, transparent); cursor:grab; transition:box-shadow .15s ease; user-select:none; pointer-events:auto; touch-action:none; }
.${NS}-ball:hover{ box-shadow:0 14px 34px color-mix(in srgb, var(--dsu-brand) 24%, transparent),0 0 0 1px color-mix(in srgb, var(--dsu-brand) 30%, transparent); }
.${NS}-icon{ width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--dsu-brand),color-mix(in srgb, var(--dsu-brand) 65%, #7c5cfc)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:800; }
.${NS}-icon.peak{ background:linear-gradient(135deg,#ef4444,#b91c1c); }
.${NS}-icon.valley{ background:linear-gradient(135deg,#10b981,#047857); }
.${NS}-copy{ display:flex; flex-direction:column; gap:1px; min-width:74px; }
.${NS}-copy .k{ font-size:11px; color:var(--dsu-muted); line-height:1; }
.${NS}-copy .v{ font-size:15px; font-weight:650; line-height:1.2; font-variant-numeric:tabular-nums; }
.${NS}-ball-line{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
.${NS}-ball-r0{ display:inline-block; margin-top:3px; padding:2px 8px; border-radius:999px; background:color-mix(in srgb, var(--dsu-gold) 14%, transparent); border:1px solid color-mix(in srgb, var(--dsu-gold) 40%, transparent); color:var(--dsu-gold); font-size:12px; font-weight:700; white-space:nowrap; }
.${NS}-chevron{ color:var(--dsu-muted); font-size:13px; margin-left:2px; }
.${NS}-dot{ position:absolute; top:8px; right:8px; width:8px; height:8px; border-radius:50%; background:var(--dsu-green); box-shadow:0 0 0 4px rgba(52,211,153,.12); }
.${NS}-panel{ position:absolute; right:0; top:0; bottom:0; width:460px; max-width:94vw; background:var(--dsu-panel); border-left:1px solid var(--dsu-border); box-shadow:-20px 0 60px rgba(0,0,0,.4); display:flex; flex-direction:column; z-index:13; transform:translateX(105%); transition:transform .18s ease; pointer-events:auto; }
.${NS}-panel.open{ transform:translateX(0); }
.${NS}-header{ display:flex; align-items:center; flex-wrap:wrap; row-gap:8px; gap:10px; padding:14px 16px; border-bottom:1px solid var(--dsu-border); background:var(--dsu-panel-2); }
.${NS}-header .title{ flex:1; min-width:0; font-size:14px; font-weight:650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.${NS}-btn{ width:28px; height:28px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--dsu-muted); display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; }
.${NS}-btn:hover{ background:rgba(255,255,255,.06); color:var(--dsu-text); }
.${NS}-body{ flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:14px; }
.${NS}-section-title{ font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--dsu-muted); margin-bottom:8px; }
.${NS}-balance{ background:linear-gradient(135deg,rgba(77,107,254,.18),rgba(124,92,252,.08)); border:1px solid rgba(77,107,254,.28); border-radius:var(--dsu-radius); padding:14px 16px; }
.${NS}-source-state{ margin-left:6px; font-size:11px; color:var(--dsu-muted); }
.${NS}-balance-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; font-size:12px; color:var(--dsu-muted); }
.${NS}-balance-main{ display:flex; align-items:center; flex-wrap:nowrap; gap:8px; margin-bottom:10px; }
.${NS}-model-label{ margin-left:auto; font-size:12px; color:var(--dsu-muted); white-space:nowrap; flex:none; }
.${NS}-balance-main select{ flex:none; height:30px; padding:0 8px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; }
.${NS}-r0-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.${NS}-amount{ font-size:30px; font-weight:700; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.${NS}-amount-sub{ color:var(--dsu-muted); font-size:13px; }
.${NS}-r0{ padding:4px 10px; border-radius:999px; background:color-mix(in srgb, var(--dsu-gold) 12%, transparent); border:1px solid color-mix(in srgb, var(--dsu-gold) 35%, transparent); color:var(--dsu-gold); font-size:12px; font-weight:650; white-space:nowrap; }
.${NS}-pv-badge{ padding:3px 10px; border-radius:999px; font-size:12px; font-weight:500; white-space:nowrap; }
.${NS}-pv-badge b{ font-weight:900; font-size:1.15em; }
.${NS}-pv-badge.peak{ background:color-mix(in srgb, #ef4444 16%, transparent); border:1px solid color-mix(in srgb, #ef4444 45%, transparent); color:#dc2626; }
.${NS}-pv-badge.valley{ background:color-mix(in srgb, #10b981 16%, transparent); border:1px solid color-mix(in srgb, #10b981 45%, transparent); color:#047857; }
.${NS}-balance-detail{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
.${NS}-balance-detail .item{ background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.05); border-radius:10px; padding:8px 10px; }
.${NS}-balance-detail .k{ font-size:12px; color:var(--dsu-muted); margin-bottom:2px; }
.${NS}-balance-detail .v{ font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
.${NS}-summary{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.${NS}-summary-card{ background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; padding:12px; }
.${NS}-summary-card .k{ font-size:12px; color:var(--dsu-muted); margin-bottom:6px; }
.${NS}-summary-card .v{ font-size:20px; font-weight:650; font-variant-numeric:tabular-nums; }
.${NS}-summary-card .sub{ font-size:12px; color:var(--dsu-muted); margin-top:2px; }
.${NS}-table{ border:1px solid var(--dsu-border); border-radius:var(--dsu-radius); overflow:hidden; }
.${NS}-row{ display:grid; grid-template-columns:1.8fr .7fr 1fr .8fr; gap:8px; align-items:center; padding:10px 12px; border-bottom:1px solid var(--dsu-border); background:var(--dsu-panel-2); }
.${NS}-row:last-child{ border-bottom:0; }
.${NS}-row.head{ background:rgba(255,255,255,.03); font-size:12px; color:var(--dsu-muted); text-transform:uppercase; letter-spacing:.04em; }
.${NS}-row.head span:nth-child(n+2){ text-align:right; }
.${NS}-row .model{ font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.${NS}-row .num{ font-size:12px; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.${NS}-row .cost{ font-size:12px; text-align:right; color:var(--dsu-gold); font-variant-numeric:tabular-nums; white-space:nowrap; }
.${NS}-legend{ font-size:12px; color:var(--dsu-muted); line-height:1.5; }
.${NS}-error{ color:var(--dsu-red); font-size:12px; margin-top:8px; }
.${NS}-footer{ padding:12px 16px; border-top:1px solid var(--dsu-border); background:var(--dsu-panel-2); display:flex; align-items:center; justify-content:space-between; color:var(--dsu-muted); font-size:12px; }
.${NS}-footer .refresh{ color:var(--dsu-link); cursor:pointer; }
.${NS}-tooltip{ position:fixed; z-index:13; display:none; max-width:460px; padding:10px 14px; border-radius:10px; background:var(--dsw-alias-bg-popover, var(--dsu-panel-2)); border:1px solid var(--dsu-border); color:var(--dsu-text); font-size:14px; line-height:1.6; white-space:normal; pointer-events:none; box-shadow:0 10px 28px rgba(0,0,0,.35); backdrop-filter:blur(8px); }
.${NS}-tooltip.visible{ display:block; }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-panel{ box-shadow:-12px 0 32px rgba(15,17,21,.10); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-ball{ box-shadow:0 8px 24px rgba(15,17,21,.12),0 0 0 1px color-mix(in srgb, var(--dsu-brand) 18%, transparent); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-balance-detail .item{ background:rgba(15,17,21,.04); border-color:rgba(15,17,21,.08); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-row.head{ background:rgba(15,17,21,.04); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-btn:hover{ background:rgba(15,17,21,.06); }
.${NS}-page{ display:none; flex-direction:column; gap:14px; }
.${NS}-page.active{ display:flex; }
.${NS}-resize{ position:absolute; left:-5px; top:0; bottom:0; width:10px; cursor:col-resize; z-index:5; }
.${NS}-resize::after{ content:''; position:absolute; left:3px; top:50%; transform:translateY(-50%); width:3px; height:42px; border-radius:2px; background:var(--dsu-border); transition:background .15s ease; }
.${NS}-resize:hover::after{ background:var(--dsu-brand); }
.${NS}-page-switch{ width:auto; min-width:44px; padding:0 8px; white-space:nowrap; font-size:12px; }
.${NS}-page-switch.active{ color:var(--dsu-brand); border-color:color-mix(in srgb,var(--dsu-brand) 40%, transparent); background:color-mix(in srgb,var(--dsu-brand) 12%, transparent); }
.${NS}-range-btn{ width:auto; min-width:40px; padding:0 8px; white-space:nowrap; font-size:12px; }
.${NS}-range-btn.active{ color:var(--dsu-brand); border-color:color-mix(in srgb,var(--dsu-brand) 40%, transparent); background:color-mix(in srgb,var(--dsu-brand) 12%, transparent); }
.${NS}-shot{ width:auto; padding:0 10px; white-space:nowrap; font-size:12px; }
.${NS}-range-select{ height:30px; padding:0 6px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; }
.${NS}-header .title{ flex:none; white-space:nowrap; }
.${NS}-trend-controls{ display:flex; flex-direction:column; gap:8px; padding:12px; background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; }
.${NS}-trend-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.${NS}-trend-row label{ font-size:12px; color:var(--dsu-muted); }
.${NS}-trend-row button{ height:30px; padding:0 12px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; cursor:pointer; }
.${NS}-trend-row button.active{ color:#101110; background:var(--dsu-brand); border-color:var(--dsu-brand); }
.${NS}-trend-list{ display:flex; flex-direction:column; gap:12px; }
.${NS}-trend-group{ display:flex; flex-direction:column; gap:8px; }
.${NS}-trend-provider{ font-size:12px; font-weight:700; color:var(--dsu-muted); text-transform:uppercase; letter-spacing:.06em; padding:2px 4px; }
.${NS}-chart-card{ background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; padding:12px; }
.${NS}-chart-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
.${NS}-chart-title{ font-size:13px; font-weight:650; }
.${NS}-chart-total{ font-size:12px; color:var(--dsu-muted); font-variant-numeric:tabular-nums; }
.${NS}-chart-svg{ display:block; width:100%; height:auto; }
.${NS}-trend-empty,.${NS}-trend-error,.${NS}-trend-loading{ color:var(--dsu-muted); font-size:12px; padding:12px; }
.${NS}-trend-error{ color:var(--dsu-red); }
@media (prefers-reduced-motion:reduce){ .${NS}-panel{ transition:none; } }
`;
/** Convert a number to a compact K/M label. */
function compact(value) {
    if (value >= 100_000_000)
        return `${(value / 100_000_000).toFixed(value >= 1_000_000_000 ? 1 : 2)}亿`;
    if (value >= 10_000)
        return `${(value / 10_000).toFixed(value >= 1_000_000 ? 1 : 2)}万`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}千`;
    return String(value);
}
/** Format money with the snapshot currency. */
function money(value, currency) {
    return currency === 'USD' ? `$${value.toFixed(2)}` : `¥${value.toFixed(2)}`;
}
/** Short display name for the floating ball. New platform models (e.g. a vision
 *  model) fall back to the raw model id so nothing needs re-typing in code. */
function shortModelName(model) {
    const lower = model.toLowerCase();
    if (/vision|image|vl/.test(lower))
        return '视觉';
    if (lower.includes('pro'))
        return 'Pro';
    if (lower.includes('flash'))
        return 'Flash';
    return model;
}
/** Friendly display label for a model in the picker. Known families get short
 *  names; vision and any unknown model shows its REAL model id so the user can
 *  tell exactly which model they are looking at (vision ids contain "flash",
 *  so the vision check must come first). */
function labelForModel(model) {
    const lower = model.toLowerCase();
    if (/vision|image|vl/.test(lower))
        return model;
    if (model.includes('pro'))
        return 'DeepSeek Pro';
    if (model.includes('flash'))
        return 'DeepSeek Flash';
    return model;
}
/** Human-readable label for a usage source (e.g. vision-toolkit-b-ai -> 视觉 b-ai, modlens-b-ai -> 视觉 modlens). */
function sourceLabel(source) {
    if (!source)
        return '直接';
    const visionMatch = /^vision-toolkit-(.+)$/.exec(source);
    if (visionMatch?.[1])
        return `视觉 ${visionMatch[1]}`;
    if (/^modlens-/.test(source) || source === 'deepseek-modlens')
        return '视觉 modlens';
    return source;
}
/** Whether a source is a vision bridge source (vision-toolkit / modlens). */
function isVisionSource(source) {
    return /^(?:vision-toolkit|modlens)-/.test(source ?? '') || source === 'deepseek-modlens';
}
/** Parse a hex color into RGB components. */
function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
    const num = Number.parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
/** Squared RGB distance between two hex colors; larger means more distinct. */
function colorDistance(a, b) {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}
/** Format a number as mantissa × 10^exponent with three significant digits. */
function toScientific(value) {
    if (value === 0 || !Number.isFinite(value))
        return String(value);
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / (10 ** exponent);
    const superscripts = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
    };
    const expText = String(exponent).split('').map(char => superscripts[char] ?? char).join('');
    return `${mantissa.toFixed(2)}×10${expText}`;
}
/** Return whether the current Beijing time is peak or valley.
    2026-08-23 起计费规则：高峰时段 = 北京时间 9:00-12:00、14:00-18:00；
    空闲时段价格为高峰的一半；周末（周六/周日）全天统一按低谷价，
    不再区分峰谷。 */
function peakValley() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(now);
    const hour = Number(parts.find(part => part.type === 'hour')?.value ?? 0);
    const weekday = parts.find(part => part.type === 'weekday')?.value ?? '';
    const weekend = weekday === 'Sat' || weekday === 'Sun';
    const peak = !weekend && ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18));
    return peak ? { text: '峰', cls: 'peak' } : { text: '谷', cls: 'valley' };
}
/** Check whether a slot name exists in a live slot snapshot. */
function containsSlot(node, name) {
    if (Array.isArray(node))
        return node.some(item => containsSlot(item, name));
    if (typeof node !== 'object' || node === null)
        return false;
    const record = node;
    if (record.name === name)
        return true;
    return containsSlot(record.children, name);
}
/** Today's Asia/Shanghai calendar date as YYYY-MM-DD. */
function todayDateString() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}
/** GMT+8 midnight epoch seconds for a YYYY-MM-DD date. */
function gmt8Start(date) {
    return Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000);
}
/** Format an epoch second as the GMT+8 calendar date (toISOString is UTC, so
 *  add the +8h offset before slicing). */
function gmt8Date(epochSeconds) {
    return new Date((epochSeconds + 28_800) * 1000).toISOString().slice(0, 10);
}
/** List every calendar date in an inclusive YYYY-MM-DD range. */
function eachDate(start, end) {
    const days = [];
    const startTime = gmt8Start(start);
    const endTime = gmt8Start(end);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime)
        return days;
    for (let cursor = startTime; cursor <= endTime; cursor += 86_400) {
        days.push(new Date((cursor + 28_800) * 1000).toISOString().slice(0, 10));
    }
    return days;
}
const STORAGE_PREFIX = 'dsh-deepseek-usage:';
/** Read a persisted UI value from localStorage. */
function readStoredValue(key) {
    try {
        return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    }
    catch {
        return null;
    }
}
/** Persist a UI value to localStorage. */
function writeStoredValue(key, value) {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
    }
    catch {
        // Storage can be unavailable in restricted browser contexts; UI still works.
    }
}
/** Read a clamped numeric UI value from localStorage. */
function readStoredNumber(key, min, max) {
    const raw = readStoredValue(key);
    if (raw === null)
        return undefined;
    const value = Number(raw);
    if (!Number.isFinite(value))
        return undefined;
    return Math.min(max, Math.max(min, value));
}
/** Fill missing buckets with zero values so charts always show the full range. */
function fillModelSeries(series, start, end, granularity) {
    const byTimestamp = new Map();
    for (const point of series.points)
        byTimestamp.set(point.timestamp, point);
    const expected = [];
    if (granularity === 'hour') {
        for (const date of eachDate(start, end)) {
            const dayStart = gmt8Start(date);
            for (let hour = 0; hour < 24; hour++) {
                expected.push({
                    timestamp: dayStart + hour * 3600,
                    label: `${date.slice(5)} ${String(hour).padStart(2, '0')}:00`,
                });
            }
        }
    }
    else {
        for (const date of eachDate(start, end)) {
            expected.push({ timestamp: gmt8Start(date), label: date.slice(5) });
        }
    }
    return {
        provider: series.provider,
        model: series.model,
        source: series.source,
        points: expected.map(item => {
            const existing = byTimestamp.get(item.timestamp);
            return {
                timestamp: item.timestamp,
                label: item.label,
                tokens: existing?.tokens ?? 0,
                inputTokens: existing?.inputTokens ?? 0,
                outputTokens: existing?.outputTokens ?? 0,
                cacheReadTokens: existing?.cacheReadTokens ?? 0,
                cacheWriteTokens: existing?.cacheWriteTokens ?? 0,
                requests: existing?.requests ?? 0,
            };
        }),
    };
}
/** Resolve inclusive GMT+8 date bounds for a range preset. */
function rangeDates(range) {
    const today = todayDateString();
    if (range === 'today')
        return { start: today, end: today };
    if (range === 'yesterday') {
        return { start: gmt8Date(gmt8Start(today) - 86_400), end: today };
    }
    if (range === 'week') {
        return { start: gmt8Date(gmt8Start(today) - 6 * 86_400), end: today };
    }
    // 近一个月：今天往前 30 天（含今天共 31 个日历日），与开放平台 31 天上限一致。
    if (range === 'month') {
        return { start: gmt8Date(gmt8Start(today) - 30 * 86_400), end: today };
    }
    // 本周：周一为一周第一天，从本周一 00:00 算到现在。
    if (range === 'thisWeek') {
        const weekday = new Date(`${today}T12:00:00+08:00`).getUTCDay();
        const daysSinceMonday = (weekday + 6) % 7;
        return { start: gmt8Date(gmt8Start(today) - daysSinceMonday * 86_400), end: today };
    }
    // 本月：从本月 1 号算到现在。
    if (range === 'thisMonth') {
        return { start: `${today.slice(0, 8)}01`, end: today };
    }
    return { start: today, end: today };
}
/** Short display label for a range preset. */
function rangeLabel(range) {
    switch (range) {
        case 'today': return '当天';
        case 'yesterday': return '昨天';
        case 'week': return '近7天';
        case 'month': return '近一个月';
        case 'thisWeek': return '本周';
        case 'thisMonth': return '本月';
    }
}
/** Fold model-usage series into per-model totals, estimating cost via the price ratio. */
function aggregateSeries(series, priceRatio) {
    const byModel = new Map();
    for (const item of series) {
        for (const point of item.points) {
            let row = byModel.get(item.model);
            if (!row) {
                row = { model: item.model, requests: 0, tokens: 0, cost: 0 };
                byModel.set(item.model, row);
            }
            row.requests += point.requests;
            row.tokens += point.tokens;
        }
    }
    const rows = [...byModel.values()].sort((a, b) => b.tokens - a.tokens);
    const costKnown = priceRatio !== null;
    let requests = 0;
    let tokens = 0;
    let cost = 0;
    for (const row of rows) {
        requests += row.requests;
        tokens += row.tokens;
        const a1 = priceRatio?.models.find(item => item.model === row.model)?.a1 ?? priceRatio?.default_a1;
        row.cost = typeof a1 === 'number' && Number.isFinite(a1) ? row.tokens * a1 : 0;
        cost += row.cost;
    }
    return { rows, requests, tokens, cost, costKnown };
}
/** Mount the floating widget. */
export function apply(ctx) {
    /* 官方 index.html 声明 lang="en"，Edge 因此每次加载都提示翻译中文页面；
       运行时改回 zh-CN（DOM 属性即可，无需改官方源码）。 */
    if (document.documentElement.lang === 'en')
        document.documentElement.lang = 'zh-CN';
    let styleEl = null;
    if (document.querySelector(`style[data-${NS}-css]`) === null) {
        styleEl = document.createElement('style');
        styleEl.dataset[`${NS}Css`] = '';
        /* 带插件 id 的 data-plugin 标记（DSH 样式系统惯例）：
           主题等插件按 data-plugin 精确清理各自样式，无主 style 可能被
           误标/误删；显式声明归属后任何按插件 id 的清理都不会触碰它。 */
        styleEl.dataset.plugin = 'dsh-deepseek-usage';
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
    }
    const disposeVentusPrefs = applyVentusPrefs();
    const host = document.createElement('div');
    host.dataset[NS] = '';
    host.innerHTML = `
    <div class="${NS}-ball" role="button" tabindex="0" aria-label="DeepSeek API 用量">
      <span class="${NS}-dot"></span>
      <div class="${NS}-icon" data-field="ball-icon">峰</div>
      <div class="${NS}-copy">
        <span class="${NS}-ball-line"><span class="k">余额</span><span class="v">--</span></span>
        <span class="${NS}-ball-r0" data-field="ball-r0">--</span>
      </div>
      <span class="${NS}-chevron">‹</span>
    </div>
    <aside class="${NS}-panel" aria-hidden="true">
      <div class="${NS}-resize" data-action="resize" title="拖动调整宽度"></div>
      <div class="${NS}-header">
        <span class="title">DeepSeek API 用量</span>
        <select class="${NS}-range-select" data-action="range" title="选择统计范围（当天/昨天/近7天/近一个月/本周/本月）">
          <option value="today" selected>当天</option>
          <option value="yesterday">昨天</option>
          <option value="week">近7天</option>
          <option value="month">近一个月</option>
          <option value="thisWeek">本周</option>
          <option value="thisMonth">本月</option>
        </select>
        <button class="${NS}-btn ${NS}-page-switch" data-action="page" title="模型用量趋势">趋势</button>
        <button class="${NS}-btn ${NS}-shot" data-action="screenshot" title="复制当前页完整截图">截图</button>
        <button class="${NS}-btn" data-action="refresh" title="刷新">↻</button>
        <button class="${NS}-btn" data-action="close" title="收起">✕</button>
      </div>
      <div class="${NS}-body">
        <div class="${NS}-page active" data-page="overview">
        <section style="display:none" aria-hidden="true">
          <div class="${NS}-section-title">账户</div>
          <div class="${NS}-balance">
            <div class="${NS}-balance-top">
              <span>DeepSeek 开放平台<span class="${NS}-source-state" data-field="source">（未连接）</span></span>
              <span class="${NS}-pv-badge" data-field="pv-badge">--</span>
            </div>
            <div class="${NS}-balance-main">
              <span class="${NS}-amount">--</span><span class="${NS}-amount-sub"></span>
              <span class="${NS}-model-label">模型涨价率：</span>
              <select id="dsu-model-select" data-field="model-select">
                <option value="deepseek-v4-flash">DeepSeek Flash</option>
                <option value="deepseek-v4-pro">DeepSeek Pro</option>
              </select>
            </div>
            <div class="${NS}-r0-row">
              <span class="${NS}-r0" data-field="r0-total" title="8月17日起累计涨价倍率">累计R0 --</span>
              <span class="${NS}-r0" data-field="r0-today" title="今日涨价倍率">今日R0 --</span>
              <span class="${NS}-r0" data-field="hit-rate" title="今日该模型总体命中率（开放平台缓存数据）">命中率 --</span>
            </div>
            <div class="${NS}-balance-detail">
              <div class="item"><div class="k">赠金余额</div><div class="v" data-field="bonus">--</div></div>
              <div class="item"><div class="k">累计消费</div><div class="v" data-field="total-cost">--</div></div>
              <div class="item"><div class="k">累计Tokens</div><div class="v" data-field="cumulative-tokens" title="2026-08-01 起累计">--</div></div>
              <div class="item"><div class="k">累计请求数</div><div class="v" data-field="cumulative-requests" title="2026-08-01 起累计">--</div></div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title" data-field="section-today">今日</div>
          <div class="${NS}-summary">
            <div class="${NS}-summary-card">
              <div class="k" data-field="cost-key">今日消费</div>
              <div class="v" data-field="cost">--</div>
              <div class="sub" data-field="cost-sub">平台实际扣费</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">API 请求次数</div>
              <div class="v" data-field="requests">--</div>
              <div class="sub">平台统计</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">Tokens</div>
              <div class="v" data-field="tokens">--</div>
              <div class="sub">平台统计</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">模型数</div>
              <div class="v" data-field="model-count">--</div>
              <div class="sub" data-field="model-count-sub">今日有调用</div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title" data-field="section-models">分模型今日</div>
          <div class="${NS}-table" data-field="table">
            <div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>
          </div>
          <div class="${NS}-legend">数据来源：DeepSeek 开放平台，与用量页同源。</div>
        </section>
        </div>
        <div class="${NS}-page" data-page="trends">
          <div class="${NS}-trend-controls">
            <div class="${NS}-trend-row">
              <label>粒度</label>
              <button data-granularity="hour" data-action="granularity">按小时</button>
              <button data-granularity="day" data-action="granularity">按天</button>
            </div>
          </div>
          <div class="${NS}-trend-list" data-field="trend-list"></div>
        </div>
      </div>
      <div class="${NS}-footer">
        <span data-field="footer">等待数据</span>
        <span class="refresh" data-action="login">登录</span>
        <span class="refresh" data-action="logout">退出登录</span>
        <span class="refresh" data-action="refresh">刷新</span>
      </div>
    </aside>
    <div class="${NS}-tooltip" data-field="tooltip" role="tooltip"></div>
  `;
    document.body.appendChild(host);
    const ball = host.querySelector(`.${NS}-ball`);
    const panel = host.querySelector(`.${NS}-panel`);
    const ballValue = host.querySelector(`.${NS}-copy .v`);
    const savedPanelWidth = readStoredNumber('panelWidth', 320, 900);
    if (savedPanelWidth !== undefined)
        panel.style.width = `${savedPanelWidth}px`;
    const savedBallTop = readStoredNumber('ballTop', 0, Math.max(0, window.innerHeight - ball.offsetHeight));
    if (savedBallTop !== undefined)
        ball.style.top = `${savedBallTop}px`;
    const savedBallSide = readStoredValue('ballSide');
    if (savedBallSide === 'left') {
        ball.style.right = 'auto';
        ball.style.left = '0';
        ball.style.borderRadius = '0 999px 999px 0';
    }
    else if (savedBallSide === 'right') {
        ball.style.left = 'auto';
        ball.style.right = '0';
        ball.style.borderRadius = '999px 0 0 999px';
    }
    const stateFields = {
        source: host.querySelector('[data-field="source"]'),
        amount: host.querySelector(`.${NS}-amount`),
        amountSub: host.querySelector(`.${NS}-amount-sub`),
        ballR0: host.querySelector('[data-field="ball-r0"]'),
        ballIcon: host.querySelector('[data-field="ball-icon"]'),
        pvBadge: host.querySelector('[data-field="pv-badge"]'),
        modelSelect: host.querySelector('[data-field="model-select"]'),
        r0Total: host.querySelector('[data-field="r0-total"]'),
        r0Today: host.querySelector('[data-field="r0-today"]'),
        hitRate: host.querySelector('[data-field="hit-rate"]'),
        bonus: host.querySelector('[data-field="bonus"]'),
        totalCost: host.querySelector('[data-field="total-cost"]'),
        cumulativeTokens: host.querySelector('[data-field="cumulative-tokens"]'),
        cumulativeRequests: host.querySelector('[data-field="cumulative-requests"]'),
        cost: host.querySelector('[data-field="cost"]'),
        requests: host.querySelector('[data-field="requests"]'),
        tokens: host.querySelector('[data-field="tokens"]'),
        modelCount: host.querySelector('[data-field="model-count"]'),
        table: host.querySelector('[data-field="table"]'),
        footer: host.querySelector('[data-field="footer"]'),
        tooltip: host.querySelector('[data-field="tooltip"]'),
        sectionToday: host.querySelector('[data-field="section-today"]'),
        sectionModels: host.querySelector('[data-field="section-models"]'),
        costKey: host.querySelector('[data-field="cost-key"]'),
        costSub: host.querySelector('[data-field="cost-sub"]'),
        modelCountSub: host.querySelector('[data-field="model-count-sub"]'),
        trendList: host.querySelector('[data-field="trend-list"]'),
    };
    let usageEnabled = readVentusPrefs().usageEnabled;
    let pollTimer;
    let open = false;
    let currency = 'CNY';
    let selectedModel = 'deepseek-v4-flash';
    let lastState = null;
    let currentPage = 'overview';
    let currentRange = 'today';
    let aggregateFetchSeq = 0;
    let screenshotting = false;
    let trendStartDate = todayDateString();
    let trendEndDate = todayDateString();
    let trendGranularity = 'hour';
    let trendData = null;
    const toggle = (next) => {
        open = next ?? !open;
        panel.classList.toggle('open', open);
        panel.setAttribute('aria-hidden', String(!open));
        if (open)
            void load();
    };
    const updatePeakValleyIcon = () => {
        const pv = peakValley();
        stateFields.ballIcon.textContent = pv.text;
        stateFields.ballIcon.classList.toggle('peak', pv.cls === 'peak');
        stateFields.ballIcon.classList.toggle('valley', pv.cls === 'valley');
        stateFields.pvBadge.innerHTML = pv.text === '峰' ? 'LW<b>峰</b>时刻' : 'LW<b>谷</b>时刻';
        stateFields.pvBadge.classList.toggle('peak', pv.cls === 'peak');
        stateFields.pvBadge.classList.toggle('valley', pv.cls === 'valley');
    };
    const load = async () => {
        updatePeakValleyIcon();
        try {
            const response = await fetch('/api/deepseek-usage/state', { headers: { accept: 'application/json' } });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            render(await response.json());
            stateFields.footer.textContent = '数据已更新';
        }
        catch {
            stateFields.footer.textContent = '加载失败，3 秒后重试';
            setTimeout(() => { void load(); }, 3000);
        }
    };
    const refresh = async () => {
        try {
            const response = await fetch('/api/deepseek-usage/refresh', { method: 'POST' });
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            render(await response.json());
            if (currentPage === 'overview' && currentRange !== 'today')
                void refreshOverviewRange();
        }
        catch {
            stateFields.footer.textContent = '刷新失败';
        }
    };
    let loginPollTimer;
    const startLogin = async () => {
        try {
            const response = await fetch('/api/deepseek-usage/login/start', { method: 'POST' });
            const result = await response.json();
            stateFields.footer.textContent = result.message ?? '正在打开登录窗口…';
            if (!result.ok)
                return;
            clearInterval(loginPollTimer);
            loginPollTimer = setInterval(async () => {
                try {
                    const statusResponse = await fetch('/api/deepseek-usage/login/status');
                    const status = await statusResponse.json();
                    if (status.loggedIn) {
                        clearInterval(loginPollTimer);
                        stateFields.footer.textContent = '登录成功，正在获取数据…';
                        await refresh();
                    }
                    else {
                        stateFields.footer.textContent = status.message ?? '等待登录完成…';
                    }
                }
                catch {
                    stateFields.footer.textContent = '登录状态检查失败';
                }
            }, 2000);
        }
        catch {
            stateFields.footer.textContent = '无法启动登录窗口';
        }
    };
    const logout = async () => {
        try {
            const response = await fetch('/api/deepseek-usage/logout', { method: 'POST' });
            const result = await response.json();
            stateFields.footer.textContent = result.ok ? '已退出登录' : (result.message ?? '退出失败');
            if (result.ok)
                await load();
        }
        catch {
            stateFields.footer.textContent = '退出失败';
        }
    };
    const showTooltip = (target, text) => {
        stateFields.tooltip.textContent = text;
        const rect = target.getBoundingClientRect();
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - 380));
        const below = rect.bottom + 10;
        const above = rect.top - 48;
        const top = below + 60 < window.innerHeight ? below : Math.max(8, above);
        stateFields.tooltip.style.left = `${left}px`;
        stateFields.tooltip.style.top = `${top}px`;
        stateFields.tooltip.classList.add('visible');
    };
    const hideTooltip = () => {
        stateFields.tooltip.classList.remove('visible');
    };
    const bindTooltip = (el) => {
        el.addEventListener('mouseenter', () => {
            const tip = el.dataset.tip;
            if (tip)
                showTooltip(el, tip);
        });
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('focus', () => {
            const tip = el.dataset.tip;
            if (tip)
                showTooltip(el, tip);
        });
        el.addEventListener('blur', hideTooltip);
    };
    /** Rebuild the model picker from the models the platform actually reported,
     *  preserving the user's current selection. Unknown models (e.g. a new vision
     *  model) appear as options automatically. */
    const syncModelOptions = (models) => {
        const seen = new Set();
        const options = [];
        const addOption = (model) => {
            if (!model || seen.has(model))
                return;
            seen.add(model);
            options.push(new Option(labelForModel(model), model));
        };
        models.forEach(addOption);
        for (const model of ['deepseek-v4-flash', 'deepseek-v4-pro'])
            addOption(model);
        const previous = stateFields.modelSelect.value;
        stateFields.modelSelect.replaceChildren(...options);
        stateFields.modelSelect.value = seen.has(previous) ? previous : (options[0]?.value ?? '');
        selectedModel = stateFields.modelSelect.value;
    };
    const render = (state) => {
        if (state.error) {
            ballValue.textContent = '--';
            stateFields.source.textContent = '（异常）';
            stateFields.footer.textContent = state.error;
            return;
        }
        const balance = state.balance;
        if (balance) {
            currency = balance.currency || 'CNY';
            const symbol = currency === 'USD' ? '$' : '¥';
            ballValue.textContent = `${symbol}${balance.balance.toFixed(2)}`;
            stateFields.source.textContent = '（已连接）';
            stateFields.amount.textContent = `${symbol}${balance.balance.toFixed(2)}`;
            stateFields.amountSub.textContent = currency;
            stateFields.bonus.textContent = `${symbol}${balance.bonus_balance.toFixed(2)}`;
            stateFields.totalCost.textContent = `${symbol}${balance.total_cost.toFixed(2)}`;
            const cumulative = state.cumulative;
            stateFields.cumulativeTokens.textContent = cumulative ? compact(cumulative.tokens) : '--';
            stateFields.cumulativeRequests.textContent = cumulative ? compact(cumulative.requests) : '--';
        }
        else {
            ballValue.textContent = '--';
            stateFields.source.textContent = '（无数据）';
            stateFields.amount.textContent = '--';
            stateFields.amountSub.textContent = '';
            stateFields.bonus.textContent = '--';
            stateFields.totalCost.textContent = '--';
            stateFields.cumulativeTokens.textContent = '--';
            stateFields.cumulativeRequests.textContent = '--';
        }
        const ratio = state.price_ratio;
        const availableModels = [
            ...new Set([
                ...(ratio?.models.map(model => model.model) ?? []),
                ...(state.today?.models.map(model => model.model) ?? []),
            ]),
        ];
        syncModelOptions(availableModels);
        const modelData = ratio?.models.find(model => model.model === selectedModel);
        const topModel = state.today?.models.slice().sort((a, b) => b.tokens - a.tokens)[0]?.model;
        const topModelData = ratio?.models.find(model => model.model === topModel);
        if (modelData) {
            stateFields.r0Total.textContent = !modelData.used_total
                ? '累计未使用'
                : modelData.r0_total !== null
                    ? `累计R0 ×${modelData.r0_total.toFixed(2)}`
                    : '累计R0 --';
            stateFields.r0Total.dataset.tip = modelData.has_history
                ? `8月17日起累计 A2/A1 = ${modelData.a2_total !== null ? toScientific(modelData.a2_total) : '--'} / ${toScientific(modelData.a1)}`
                : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
            stateFields.r0Today.textContent = !modelData.used_today
                ? '今日未使用'
                : modelData.r0_today !== null
                    ? `今日R0 ×${modelData.r0_today.toFixed(2)}`
                    : '今日R0 --';
            stateFields.r0Today.dataset.tip = modelData.has_history
                ? `今日 A2/A1 = ${modelData.a2_today !== null ? toScientific(modelData.a2_today) : '--'} / ${toScientific(modelData.a1)}`
                : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
        }
        else {
            stateFields.r0Total.textContent = '累计R0 --';
            stateFields.r0Today.textContent = '今日R0 --';
        }
        stateFields.ballR0.textContent = topModelData && topModelData.used_today && topModelData.r0_today !== null
            ? `${shortModelName(topModel ?? selectedModel)} ×${topModelData.r0_today.toFixed(2)}`
            : '--';
        stateFields.ballR0.dataset.tip = topModelData && topModelData.r0_today !== null
            ? `${shortModelName(topModel ?? selectedModel)} 今日 A2/A1 = ${toScientific(topModelData.a2_today ?? 0)} / ${toScientific(topModelData.a1)}`
            : '';
        /* 今日所选模型的总体缓存命中率（开放平台数据）：命中 /（命中 + 未命中）。
           真实两位小数同时提供给 ventus-prefs 的 StatsLine 补丁（官方显示的是
           整数近似，直接 toFixed 只会造出假 .00）。 */
        const todayModel = state.today?.models.find(model => model.model === selectedModel);
        const hitInput = todayModel ? todayModel.cacheHitTokens + todayModel.cacheMissTokens : 0;
        if (todayModel !== undefined && hitInput > 0) {
            const hitPct = todayModel.cacheHitTokens / hitInput * 100;
            stateFields.hitRate.textContent = `命中率 ${hitPct.toFixed(2)}%`;
            stateFields.hitRate.dataset.tip = `今日输入缓存命中 ${compact(todayModel.cacheHitTokens)} / ${compact(hitInput)}（${hitPct.toFixed(2)}%）`;
            setRealHitRate(hitPct);
        }
        else {
            stateFields.hitRate.textContent = '命中率 --';
            stateFields.hitRate.dataset.tip = todayModel === undefined
                ? '今日该模型暂无开放平台用量'
                : '今日该模型暂无输入缓存数据';
            setRealHitRate(null);
        }
        if (currentRange === 'today') {
            const today = state.today;
            if (today) {
                stateFields.cost.textContent = money(today.cost, currency);
                stateFields.requests.textContent = today.requests.toLocaleString('zh-CN');
                stateFields.tokens.textContent = today.tokens.toLocaleString('zh-CN');
                stateFields.modelCount.textContent = String(today.models.length);
                const rows = today.models.map(model => `
        <div class="${NS}-row">
          <span class="model" title="${escapeHtml(model.model)}">${escapeHtml(model.model)}</span>
          <span class="num">${model.requests.toLocaleString('zh-CN')}</span>
          <span class="num">${compact(model.tokens)}</span>
          <span class="cost">${money(model.cost, currency)}</span>
        </div>
      `).join('');
                stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>${rows || `<div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`}`;
            }
            else {
                stateFields.cost.textContent = '--';
                stateFields.requests.textContent = '--';
                stateFields.tokens.textContent = '--';
                stateFields.modelCount.textContent = '--';
                stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div><div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`;
            }
        }
        stateFields.footer.textContent = `更新于 ${new Date(state.fetched_at).toLocaleTimeString('zh-CN', { hour12: false })}`;
        lastState = state;
    };
    const escapeHtml = (value) => value.replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char] ?? char);
    const switchPage = (page) => {
        currentPage = page;
        host.querySelectorAll(`.${NS}-page`).forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-page') === page);
        });
        const pageSwitch = host.querySelector(`.${NS}-page-switch`);
        pageSwitch.textContent = page === 'overview' ? '趋势' : '总览';
        pageSwitch.classList.toggle('active', page === 'trends');
        if (page === 'trends' && !trendData)
            void loadTrends();
        else if (page === 'overview')
            void refreshOverviewRange();
    };
    const renderRangeSummary = (aggregate) => {
        stateFields.cost.textContent = aggregate.costKnown ? money(aggregate.cost, currency) : '--';
        stateFields.requests.textContent = aggregate.requests.toLocaleString('zh-CN');
        stateFields.tokens.textContent = aggregate.tokens.toLocaleString('zh-CN');
        stateFields.modelCount.textContent = String(aggregate.rows.length);
        const rows = aggregate.rows.map(row => `
      <div class="${NS}-row">
        <span class="model" title="${escapeHtml(row.model)}">${escapeHtml(row.model)}</span>
        <span class="num">${row.requests.toLocaleString('zh-CN')}</span>
        <span class="num">${compact(row.tokens)}</span>
        <span class="cost">${aggregate.costKnown ? money(row.cost, currency) : '--'}</span>
      </div>
    `).join('');
        stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>${rows || `<div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`}`;
    };
    const refreshOverviewRange = async () => {
        if (currentRange === 'today') {
            stateFields.sectionToday.textContent = '今日';
            stateFields.sectionModels.textContent = '分模型今日';
            stateFields.costKey.textContent = '今日消费';
            stateFields.costSub.textContent = '平台实际扣费';
            stateFields.modelCountSub.textContent = '今日有调用';
            void load();
            return;
        }
        const seq = ++aggregateFetchSeq;
        if (!lastState)
            await load();
        if (seq !== aggregateFetchSeq)
            return;
        const label = rangeLabel(currentRange);
        stateFields.sectionToday.textContent = label;
        stateFields.sectionModels.textContent = '分模型' + label;
        stateFields.costKey.textContent = label + '消费';
        stateFields.costSub.textContent = '估算（按历史均价）';
        stateFields.modelCountSub.textContent = '范围内有调用';
        const dates = rangeDates(currentRange);
        try {
            // 总览范围数据必须与官方用量看板同源（开放平台），不走本地 session 统计。
            const series = await requestPlatformSeries(dates.start, dates.end, 'day');
            if (seq !== aggregateFetchSeq)
                return;
            renderRangeSummary(aggregateSeries(series, lastState?.price_ratio ?? null));
            stateFields.footer.textContent = '已更新（开放平台） · ' + label;
        }
        catch (error) {
            if (seq !== aggregateFetchSeq)
                return;
            stateFields.footer.textContent = '范围数据加载失败：' + (error instanceof Error ? error.message : String(error));
        }
    };
    const applyRange = (range) => {
        if (currentRange === range)
            return;
        currentRange = range;
        const rangeSelect = host.querySelector('[data-action="range"]');
        if (rangeSelect)
            rangeSelect.value = range;
        const dates = rangeDates(range);
        trendStartDate = dates.start;
        trendEndDate = dates.end;
        trendData = null;
        if (currentPage === 'trends')
            void loadTrends();
        else
            void refreshOverviewRange();
    };
    const captureBackground = () => {
        const panelBg = getComputedStyle(panel).backgroundColor;
        if (panelBg && panelBg !== 'transparent' && panelBg !== 'rgba(0, 0, 0, 0)')
            return panelBg;
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)')
            return bodyBg;
        const dark = document.body.hasAttribute('data-ds-dark-theme') || window.matchMedia('(prefers-color-scheme: dark)').matches;
        return dark ? '#0b0e14' : '#eef0f4';
    };
    const captureCurrentPage = async () => {
        if (screenshotting)
            return;
        const page = host.querySelector('.' + NS + '-page.active');
        if (!page || page.children.length === 0) {
            stateFields.footer.textContent = page ? '当前页面暂无内容' : '未找到当前页面';
            return;
        }
        const button = host.querySelector('[data-action="screenshot"]');
        screenshotting = true;
        if (button) {
            button.disabled = true;
            button.textContent = '截图生成中…';
        }
        try {
            // 截图整个侧边栏面板（头部/中间内容/底部状态栏），而非仅中间内容块。
            const bodyEl = host.querySelector('.' + NS + '-body');
            const contentHeight = Math.max(panel.scrollHeight, bodyEl?.scrollHeight ?? 0);
            if (contentHeight > 60_000) {
                stateFields.footer.textContent = '页面过高（' + contentHeight + 'px），已中止截图';
                return;
            }
            // 截图内容里按钮必须显示原始文案（不截入“截图生成中…”状态）。
            if (button) {
                button.disabled = false;
                button.textContent = '截图';
            }
            const canvas = await html2canvas(panel, {
                scale: Math.min(2, window.devicePixelRatio || 1),
                useCORS: true,
                backgroundColor: captureBackground(),
                logging: false,
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDocument) => {
                    const clonedBody = clonedDocument.querySelector('.' + NS + '-body');
                    if (clonedBody) {
                        clonedBody.style.height = 'auto';
                        clonedBody.style.maxHeight = 'none';
                        clonedBody.style.overflow = 'visible';
                    }
                    const clonedPanel = clonedDocument.querySelector('.' + NS + '-panel');
                    if (clonedPanel) {
                        clonedPanel.style.height = 'auto';
                        clonedPanel.style.bottom = 'auto';
                        clonedPanel.style.transform = 'none';
                    }
                    const clonedPage = clonedDocument.querySelector('.' + NS + '-page.active');
                    if (clonedPage)
                        clonedPage.style.height = 'auto';
                },
            });
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(result => result ? resolve(result) : reject(new Error('canvas 导出失败')), 'image/png');
            });
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                stateFields.footer.textContent = '已复制截图';
            }
            catch (clipboardError) {
                // 剪贴板写入偶发失败（页面焦点/权限时序），稍候重试一次再报错。
                try {
                    await new Promise(resolve => setTimeout(resolve, 350));
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    stateFields.footer.textContent = '已复制截图';
                }
                catch {
                    stateFields.footer.textContent = '复制截图失败：' + (clipboardError instanceof Error ? clipboardError.message : String(clipboardError));
                }
            }
        }
        catch (error) {
            stateFields.footer.textContent = '截图失败：' + (error instanceof Error ? error.message : String(error));
        }
        finally {
            screenshotting = false;
            if (button) {
                button.disabled = false;
                button.textContent = '截图';
            }
        }
    };
    const requestSeries = async (start, end, granularity, onSnapshot) => {
        const url = '/api/deepseek-usage/model-usage/stream?start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end) + '&granularity=' + granularity;
        const response = await fetch(url);
        if (!response.ok)
            throw new Error('HTTP ' + response.status);
        if (!response.body)
            throw new Error('浏览器不支持流式读取');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let latest = [];
        for (;;) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            let newlineIndex = buffer.indexOf('\n');
            while (newlineIndex >= 0) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                newlineIndex = buffer.indexOf('\n');
                if (!line)
                    continue;
                const message = JSON.parse(line);
                if (message.type === 'snapshot' && message.series) {
                    latest = message.series;
                    onSnapshot?.(latest);
                }
                else if (message.type === 'done' && message.result) {
                    latest = message.result.series;
                    onSnapshot?.(latest);
                }
                else if (message.type === 'error') {
                    throw new Error(message.error ?? '加载失败');
                }
            }
        }
        return latest;
    };
    /** 总览页范围数据：DeepSeek 开放平台（官方看板同源），非流式一次返回。 */
    const requestPlatformSeries = async (start, end, granularity) => {
        const url = '/api/deepseek-usage/model-usage/platform?start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end) + '&granularity=' + granularity;
        const response = await fetch(url);
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error ?? ('HTTP ' + response.status));
        }
        const payload = await response.json();
        return payload.series;
    };
    const loadTrends = async () => {
        const start = trendStartDate;
        const end = trendEndDate;
        const dayCount = Math.round((gmt8Start(end) - gmt8Start(start)) / 86_400) + 1;
        if (dayCount > 31) {
            stateFields.trendList.innerHTML = '<div class="' + NS + '-trend-error">日期范围不能超过 31 天</div>';
            return;
        }
        trendStartDate = start;
        trendEndDate = end;
        stateFields.trendList.innerHTML = '<div class="' + NS + '-trend-loading">加载模型用量趋势…</div>';
        try {
            const series = await requestSeries(start, end, trendGranularity, snapshotSeries => {
                trendData = { start, end, granularity: trendGranularity, series: snapshotSeries };
                renderTrends();
            });
            trendData = { start, end, granularity: trendGranularity, series };
            renderTrends();
        }
        catch (error) {
            stateFields.trendList.innerHTML = '<div class="' + NS + '-trend-error">' + escapeHtml(error instanceof Error ? error.message : String(error)) + '</div>';
        }
    };
    const renderTrends = () => {
        const data = trendData;
        if (!data)
            return;
        if (data.error) {
            stateFields.trendList.innerHTML = `<div class="${NS}-trend-error">${escapeHtml(data.error)}</div>`;
            return;
        }
        if (data.series.length === 0) {
            stateFields.trendList.innerHTML = `<div class="${NS}-trend-empty">所选范围内暂无模型用量数据</div>`;
            return;
        }
        const filled = data.series.map(series => fillModelSeries(series, data.start, data.end, data.granularity));
        const palette = ['#4d6bfe', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#f472b6', '#a3e635', '#60a5fa'];
        const groups = new Map();
        for (const series of filled) {
            let models = groups.get(series.provider);
            if (!models) {
                models = new Map();
                groups.set(series.provider, models);
            }
            const list = models.get(series.model) ?? [];
            list.push(series);
            models.set(series.model, list);
        }
        let colorIndex = 0;
        let html = '';
        for (const [provider, models] of groups) {
            html += `<div class="${NS}-trend-group">`;
            html += `<div class="${NS}-trend-provider">${escapeHtml(provider)}</div>`;
            for (const seriesList of models.values()) {
                html += renderTrendChart(seriesList, palette[colorIndex++ % palette.length]);
            }
            html += '</div>';
        }
        stateFields.trendList.innerHTML = html || `<div class="${NS}-trend-empty">所选范围内暂无模型用量数据</div>`;
        bindTrendInteractions();
    };
    const renderTrendChart = (seriesList, color) => {
        const points = seriesList[0]?.points ?? [];
        if (points.length === 0 || seriesList.length === 0)
            return '';
        const width = 600;
        const height = 180;
        const margin = { top: 12, right: 16, bottom: 26, left: 44 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const maxTokens = Math.max(...seriesList.flatMap(series => series.points.map(point => point.tokens)), 1);
        const x = (index) => points.length === 1
            ? margin.left + plotWidth / 2
            : margin.left + (plotWidth * index) / (points.length - 1);
        const y = (value) => margin.top + plotHeight - (plotHeight * Math.min(value, maxTokens)) / maxTokens;
        const secondaryPalette = ['#f87171', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee', '#fb923c', '#f472b6', '#a3e635', '#60a5fa'];
        const visionPalette = ['#f59e0b', '#f87171', '#a78bfa', '#34d399', '#fbbf24'];
        const usedColors = new Set([color.toLowerCase()]);
        const pickDistinct = (candidates) => {
            let best = candidates[0];
            let bestDistance = -1;
            for (const candidate of candidates) {
                if (usedColors.has(candidate.toLowerCase()))
                    continue;
                const minDistance = Math.min(...[...usedColors].map(used => colorDistance(candidate, used)));
                if (minDistance > bestDistance) {
                    bestDistance = minDistance;
                    best = candidate;
                }
            }
            usedColors.add(best.toLowerCase());
            return best;
        };
        const sourceColors = seriesList.map((series, index) => {
            if (isVisionSource(series.source))
                return pickDistinct(visionPalette);
            if (index === 0)
                return color;
            return pickDistinct(secondaryPalette);
        });
        const rendered = seriesList.map((series, seriesIndex) => {
            const lineColor = sourceColors[seriesIndex];
            const line = series.points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.tokens).toFixed(1)}`).join(' ');
            const area = `${line} L${x(points.length - 1).toFixed(1)},${margin.top + plotHeight} L${x(0).toFixed(1)},${margin.top + plotHeight} Z`;
            const pointHitRate = (point) => {
                const input = point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens;
                return input > 0 ? point.cacheReadTokens / input * 100 : 0;
            };
            const circles = series.points.map((point, index) => `
        <circle cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="3" fill="${lineColor}" stroke="var(--dsu-panel-2)" stroke-width="1.5"/>
        <circle class="${NS}-point-hit" cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="10" fill="transparent"
          data-x="${x(index).toFixed(1)}"
          data-source="${escapeHtml(series.source ?? series.provider)}"
          data-color="${lineColor}"
          data-label="${escapeHtml(point.label)}"
          data-total="${point.tokens}"
          data-input="${point.inputTokens}"
          data-output="${point.outputTokens}"
          data-cache-read="${point.cacheReadTokens}"
          data-cache-write="${point.cacheWriteTokens}"
          data-hit-rate="${pointHitRate(point).toFixed(1)}"/>
      `).join('');
            return { lineColor, area, line, circles };
        });
        let total = 0;
        let totalInput = 0;
        let totalCacheRead = 0;
        for (const series of seriesList) {
            for (const point of series.points) {
                total += point.tokens;
                totalInput += point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens;
                totalCacheRead += point.cacheReadTokens;
            }
        }
        const totalHitRate = totalInput > 0 ? totalCacheRead / totalInput * 100 : 0;
        const hasToolkitSource = seriesList.some(series => isVisionSource(series.source));
        const legend = seriesList.length > 1 || hasToolkitSource
            ? `<span style="display:inline-flex;gap:10px;flex-wrap:wrap;">${seriesList.map((series, index) => `
          <span style="display:inline-flex;align-items:center;gap:4px;color:var(--dsu-muted);font-size:11px;">
            <i style="width:12px;height:2px;background:${sourceColors[index]};display:inline-block;flex:none;"></i>${escapeHtml(sourceLabel(series.source))}
          </span>`).join('')}</span>`
            : '';
        const ticks = 4;
        const gridLines = Array.from({ length: ticks + 1 }, (_, index) => {
            const value = maxTokens * index / ticks;
            const yy = y(value);
            return `<line x1="${margin.left}" y1="${yy.toFixed(1)}" x2="${width - margin.right}" y2="${yy.toFixed(1)}" stroke="var(--dsu-border)" stroke-width="1"/>`;
        }).join('');
        const yLabels = Array.from({ length: ticks + 1 }, (_, index) => {
            const value = maxTokens * index / ticks;
            const yy = y(value);
            return `<text x="${margin.left - 8}" y="${(yy + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--dsu-muted)">${compact(value)}</text>`;
        }).join('');
        const labelStep = Math.max(1, Math.ceil(points.length / 8));
        const xLabels = points.map((point, index) => index % labelStep === 0
            ? `<text x="${x(index).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="var(--dsu-muted)">${escapeHtml(point.label)}</text>`
            : '').join('');
        const model = seriesList[0]?.model ?? '';
        return `
      <div class="${NS}-chart-card">
        <div class="${NS}-chart-head">
          <span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;">
            <span class="${NS}-chart-title">${escapeHtml(model)}</span>
            ${legend}
          </span>
          <span class="${NS}-chart-total">${compact(total)} Tokens · 命中率 ${totalHitRate.toFixed(1)}%</span>
        </div>
        <svg class="${NS}-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(model)} 用量趋势">
          ${gridLines}
          ${yLabels}
          ${xLabels}
          <line class="${NS}-hover-line" x1="0" y1="${margin.top}" x2="0" y2="${margin.top + plotHeight}" stroke="var(--dsu-muted)" stroke-width="1" stroke-dasharray="4 3" opacity="0" pointer-events="none"/>
          ${rendered.map(item => `<path d="${item.area}" fill="${item.lineColor}" opacity="0.08"/>`).join('')}
          ${rendered.map(item => `<path d="${item.line}" fill="none" stroke="${item.lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
          ${rendered.map(item => item.circles).join('')}
        </svg>
      </div>
    `;
    };
    const showChartTooltip = (circle, clientX, clientY) => {
        const rect = circle.getBoundingClientRect();
        const x = circle.getAttribute('data-x') ?? '0';
        const svg = circle.closest('svg');
        const line = svg?.querySelector(`.${NS}-hover-line`);
        if (line) {
            line.setAttribute('x1', x);
            line.setAttribute('x2', x);
            line.setAttribute('opacity', '1');
        }
        const label = circle.getAttribute('data-label') ?? '';
        const circles = svg
            ? Array.from(svg.querySelectorAll(`.${NS}-point-hit`)).filter(item => item.getAttribute('data-x') === x)
            : [circle];
        const cards = circles.map(item => {
            const source = item.getAttribute('data-source') ?? '';
            const color = item.getAttribute('data-color') ?? '#4d6bfe';
            const input = Number(item.getAttribute('data-input') ?? 0);
            const output = Number(item.getAttribute('data-output') ?? 0);
            const cacheRead = Number(item.getAttribute('data-cache-read') ?? 0);
            const cacheWrite = Number(item.getAttribute('data-cache-write') ?? 0);
            const hitRate = Number(item.getAttribute('data-hit-rate') ?? 0);
            return `
        <div style="background:var(--dsu-panel-2);border:1px solid var(--dsu-border);border-radius:8px;padding:8px 10px;min-width:130px;">
          <div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:6px;">
            <i style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex:none;"></i>
            ${escapeHtml(sourceLabel(source))}
          </div>
          <div>输入 ${compact(input)}</div>
          <div>输出 ${compact(output)}</div>
          <div>缓存命中 ${compact(cacheRead)}</div>
          <div>缓存未命中 ${compact(cacheWrite)}</div>
          <div>命中率 ${hitRate.toFixed(1)}%</div>
        </div>
      `;
        }).join('');
        stateFields.tooltip.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">${cards}</div>
    `;
        stateFields.tooltip.classList.add('visible');
        const tooltip = stateFields.tooltip;
        const tooltipWidth = tooltip.offsetWidth || 380;
        const tooltipHeight = tooltip.offsetHeight || 180;
        const pointerX = clientX ?? (rect.left + rect.width / 2);
        const pointerY = clientY ?? (rect.top + rect.height / 2);
        const gap = 14;
        let left = pointerX + gap;
        if (left + tooltipWidth > window.innerWidth - 8)
            left = pointerX - tooltipWidth - gap;
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
        let top = pointerY + gap;
        if (top + tooltipHeight > window.innerHeight - 8)
            top = pointerY - tooltipHeight - gap;
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    const hideChartTooltip = (circle) => {
        hideTooltip();
        const line = circle.closest('svg')?.querySelector(`.${NS}-hover-line`);
        if (line)
            line.setAttribute('opacity', '0');
    };
    const bindTrendInteractions = () => {
        host.querySelectorAll(`.${NS}-point-hit`).forEach(circle => {
            circle.addEventListener('mouseenter', () => showChartTooltip(circle));
            circle.addEventListener('mouseleave', () => hideChartTooltip(circle));
        });
        host.querySelectorAll(`.${NS}-chart-svg`).forEach(svg => {
            svg.addEventListener('mousemove', (event) => {
                const rect = svg.getBoundingClientRect();
                if (rect.width === 0)
                    return;
                const viewBoxWidth = 600;
                const x = (event.clientX - rect.left) * (viewBoxWidth / rect.width);
                let nearest = null;
                let nearestDistance = Number.POSITIVE_INFINITY;
                svg.querySelectorAll(`.${NS}-point-hit`).forEach(circle => {
                    const cx = Number(circle.getAttribute('data-x') ?? 0);
                    const distance = Math.abs(cx - x);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearest = circle;
                    }
                });
                if (nearest)
                    showChartTooltip(nearest);
            });
            svg.addEventListener('mouseleave', () => {
                hideTooltip();
                const line = svg.querySelector(`.${NS}-hover-line`);
                if (line)
                    line.setAttribute('opacity', '0');
            });
        });
    };
    let dragMoved = false;
    let dragPointerY = 0;
    let dragStartTop = 0;
    const onBallPointerDown = (event) => {
        dragMoved = false;
        dragPointerY = event.clientY;
        dragStartTop = ball.getBoundingClientRect().top;
        ball.setPointerCapture(event.pointerId);
    };
    const onBallPointerMove = (event) => {
        if (!ball.hasPointerCapture(event.pointerId))
            return;
        const delta = event.clientY - dragPointerY;
        if (Math.abs(delta) > 4)
            dragMoved = true;
        const maxTop = Math.max(0, window.innerHeight - ball.offsetHeight);
        ball.style.top = `${Math.max(0, Math.min(maxTop, dragStartTop + delta))}px`;
    };
    const onBallPointerUp = (event) => {
        if (!ball.hasPointerCapture(event.pointerId))
            return;
        ball.releasePointerCapture(event.pointerId);
        if (!dragMoved)
            return;
        const side = event.clientX < window.innerWidth / 2 ? 'left' : 'right';
        if (side === 'left') {
            ball.style.right = 'auto';
            ball.style.left = '0';
            ball.style.borderRadius = '0 999px 999px 0';
        }
        else {
            ball.style.left = 'auto';
            ball.style.right = '0';
            ball.style.borderRadius = '999px 0 0 999px';
        }
        writeStoredValue('ballTop', String(Math.round(ball.getBoundingClientRect().top)));
        writeStoredValue('ballSide', side);
    };
    ball.addEventListener('click', () => {
        if (!dragMoved)
            toggle();
    });
    ball.addEventListener('pointerdown', onBallPointerDown);
    ball.addEventListener('pointermove', onBallPointerMove);
    ball.addEventListener('pointerup', onBallPointerUp);
    ball.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    });
    host.querySelector('[data-action="login"]')?.addEventListener('click', () => void startLogin());
    host.querySelector('[data-action="logout"]')?.addEventListener('click', () => void logout());
    host.querySelectorAll('[data-action="refresh"]').forEach(el => el.addEventListener('click', () => void refresh()));
    stateFields.modelSelect.addEventListener('change', () => {
        selectedModel = stateFields.modelSelect.value;
        if (lastState)
            render(lastState);
    });
    bindTooltip(stateFields.r0Total);
    bindTooltip(stateFields.r0Today);
    bindTooltip(stateFields.hitRate);
    bindTooltip(stateFields.ballR0);
    host.querySelector('[data-action="close"]')?.addEventListener('click', () => toggle(false));
    host.querySelector('[data-action="granularity"][data-granularity="hour"]')?.classList.add('active');
    host.querySelector('[data-action="page"]')?.addEventListener('click', () => {
        switchPage(currentPage === 'overview' ? 'trends' : 'overview');
    });
    host.querySelector('[data-action="range"]')?.addEventListener('change', (event) => {
        const value = event.target.value;
        applyRange(value);
    });
    host.querySelector('[data-action="screenshot"]')?.addEventListener('click', () => void captureCurrentPage());
    host.querySelectorAll('[data-action="granularity"]').forEach(button => {
        button.addEventListener('click', () => {
            trendGranularity = button.getAttribute('data-granularity') === 'day' ? 'day' : 'hour';
            host.querySelectorAll('[data-action="granularity"]').forEach(item => {
                item.classList.toggle('active', item === button);
            });
            void loadTrends();
        });
    });
    const resizeHandle = host.querySelector('[data-action="resize"]');
    let resizing = false;
    let resizeStartX = 0;
    let resizeStartWidth = 0;
    const onResizeDown = (event) => {
        resizing = true;
        resizeStartX = event.clientX;
        resizeStartWidth = panel.offsetWidth;
        resizeHandle.setPointerCapture(event.pointerId);
    };
    const onResizeMove = (event) => {
        if (!resizing)
            return;
        const delta = event.clientX - resizeStartX;
        const nextWidth = Math.max(320, Math.min(900, window.innerWidth - 40, resizeStartWidth - delta));
        panel.style.width = `${nextWidth}px`;
    };
    const onResizeUp = (event) => {
        if (!resizing)
            return;
        resizing = false;
        resizeHandle.releasePointerCapture(event.pointerId);
        writeStoredValue('panelWidth', String(panel.offsetWidth));
    };
    resizeHandle.addEventListener('pointerdown', onResizeDown);
    resizeHandle.addEventListener('pointermove', onResizeMove);
    resizeHandle.addEventListener('pointerup', onResizeUp);
    const onKeydown = (event) => {
        if (event.key === 'Escape' && open)
            toggle(false);
    };
    document.addEventListener('keydown', onKeydown);
    const onDocumentClick = (event) => {
        if (!open)
            return;
        const target = event.target;
        if (!panel.contains(target) && !ball.contains(target))
            toggle(false);
    };
    document.addEventListener('click', onDocumentClick);
    const disposeOverlay = ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'dsh-deepseek-usage',
        order: 100,
    }, () => null));
    /* ---------- DSH 版本号（侧边栏 brand 下方一行小字） ----------
       只要装了本插件就自动显示：fetch /api/deepseek-usage/meta 拿宿主解析的
       应用版本，作为 logoRow 内的换行项紧贴在 "DSH Local Build" brand 下方
       （logoRow 开 flex-wrap，版本行 flex-basis:100% 独占一行）。rail 态
       brand 不渲染，版本行跟着隐藏；React 重渲染会清掉注入节点，由
       MutationObserver 幂等补注。 */
    let dshVersion = '';
    const ensureVersionLine = () => {
        if (dshVersion.length === 0)
            return;
        const logoRow = document.querySelector('[class*="logoRow"]');
        if (logoRow === null || !(logoRow instanceof HTMLElement))
            return;
        const brand = logoRow.querySelector('button[class*="_brand"]');
        const existing = logoRow.querySelector('[data-dsu-version]');
        if (brand === null) {
            if (existing !== null)
                existing.remove();
            return;
        }
        if (existing !== null)
            return;
        logoRow.style.flexWrap = 'wrap';
        const line = document.createElement('div');
        line.setAttribute('data-dsu-version', '');
        line.textContent = 'DSH ' + dshVersion;
        line.style.cssText = [
            'flex-basis:100%',
            'max-width:100%',
            'margin:0',
            'padding:0 8px 0 12px',
            'font-size:11px',
            'line-height:16px',
            'font-family:var(--ds-font-family-code, ui-monospace, monospace)',
            'color:var(--dsw-alias-label-tertiary, rgba(255,255,255,.42))',
            'letter-spacing:.02em',
            'white-space:nowrap',
        ].join(';');
        logoRow.appendChild(line);
    };
    const versionObserver = new MutationObserver(() => ensureVersionLine());
    versionObserver.observe(document.body, { childList: true, subtree: true });
    void fetch('/api/deepseek-usage/meta', { headers: { accept: 'application/json' } })
        .then(response => response.json())
        .then((data) => {
        if (typeof data?.dshVersion === 'string' && data.dshVersion.length > 0) {
            dshVersion = data.dshVersion;
            ensureVersionLine();
        }
    })
        .catch(() => { });
    const disposeUsageCard = ctx.slots.inject('ventus.settings.item', () => ctx.slots.register({
        name: 'ventus.settings.item',
        id: 'dsh-deepseek-usage',
        order: 20,
    }, DeepSeekUsageSettingsCard));
    let disposeVentusPage;
    const pageTimer = setTimeout(() => {
        if (containsSlot(ctx.slots.snapshot(), 'ventus.settings.item'))
            return;
        disposeVentusPage = ctx.slots.inject('settings.section', () => ctx.slots.register({
            name: 'settings.section',
            id: 'ventus',
            order: 60,
            label: () => 'Ventus',
            children: { 'ventus.settings.item': { kind: 'list', scope: 'root' } },
        }, VentusSettingsPage));
    }, 800);
    const applyUsageEnabled = (enabled) => {
        usageEnabled = enabled;
        host.style.display = enabled ? '' : 'none';
        if (enabled) {
            void load();
            if (pollTimer === undefined)
                pollTimer = setInterval(() => { void load(); }, POLL_MS);
        }
        else {
            if (pollTimer !== undefined) {
                clearInterval(pollTimer);
                pollTimer = undefined;
            }
            toggle(false);
        }
    };
    const onVentusPrefs = (event) => {
        const detail = event.detail;
        if (detail !== undefined)
            applyUsageEnabled(detail.usageEnabled);
    };
    window.addEventListener(VENTUS_PREFS_EVENT, onVentusPrefs);
    applyUsageEnabled(usageEnabled);
    let hourlyTrendTimer;
    const scheduleHourlyTrendRefresh = () => {
        const now = new Date();
        const next = new Date(now);
        next.setMinutes(0, 0, 0);
        next.setSeconds(0, 0);
        next.setHours(now.getHours() + 1);
        const delay = Math.max(1000, next.getTime() - now.getTime() + 250);
        hourlyTrendTimer = setTimeout(() => {
            if (usageEnabled && trendData)
                void loadTrends();
            scheduleHourlyTrendRefresh();
        }, delay);
    };
    scheduleHourlyTrendRefresh();
    ctx.effect(() => () => {
        if (pollTimer !== undefined)
            clearInterval(pollTimer);
        window.removeEventListener(VENTUS_PREFS_EVENT, onVentusPrefs);
        clearInterval(loginPollTimer);
        clearTimeout(pageTimer);
        clearTimeout(hourlyTrendTimer);
        versionObserver.disconnect();
        disposeOverlay();
        disposeUsageCard();
        disposeVentusPage?.();
        document.removeEventListener('keydown', onKeydown);
        document.removeEventListener('click', onDocumentClick);
        disposeVentusPrefs();
        host.remove();
        styleEl?.remove();
    }, 'dsh-deepseek-usage: ui');
}
//# sourceMappingURL=index.js.map