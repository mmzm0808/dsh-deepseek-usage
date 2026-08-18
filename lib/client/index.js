/**
 * dsh-deepseek-usage — browser half. Renders a floating right-edge ball and a
 * slide-in usage panel as a body portal. The panel shows only exact values
 * fetched from the DeepSeek Platform private API.
 * @module dsh-deepseek-usage/client
 */
import { DeepSeekUsageSettingsCard } from './VentusSettingsCard.js';
import { VentusSettingsPage } from './VentusSettingsPage.js';
/** Required services: slots lets the plugin claim a shell overlay seat. */
export const inject = ['slots'];
/** Plugin namespace for styles and DOM queries. */
const NS = 'dsu';
/** Poll interval for state refreshes in milliseconds. */
const POLL_MS = 10_000;
const CSS = `
[data-${NS}] { --dsu-bg:var(--dsw-alias-bg-base, #0b0e14); --dsu-panel:var(--dsw-alias-bg-module-platform, #12161f); --dsu-panel-2:var(--dsw-alias-bg-module-hover, #171c27); --dsu-border:var(--dsw-alias-line-normal, rgba(255,255,255,.08)); --dsu-text:var(--dsw-alias-label-primary, #e7ecf3); --dsu-muted:var(--dsw-alias-label-secondary, #8b95a7); --dsu-brand:var(--dsw-alias-state-business-primary, #4d6bfe); --dsu-green:#34d399; --dsu-gold:#ffd166; --dsu-red:#f87171; --dsu-link:#8ea2ff; --dsu-radius:14px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; color:var(--dsu-text); }
body:not([data-ds-dark-theme]) [data-${NS}] { --dsu-bg:#eef0f4; --dsu-panel:#ffffff; --dsu-panel-2:#f4f5f7; --dsu-border:rgba(15,17,21,.08); --dsu-text:#1a1d21; --dsu-muted:#5b6472; --dsu-green:#059669; --dsu-gold:#8a6100; --dsu-red:#dc2626; --dsu-link:#2563eb; }
[data-${NS}]{ position:fixed; inset:0; z-index:2147483000; pointer-events:none; }
[data-${NS}] *{ box-sizing:border-box; }
.${NS}-ball{ position:absolute; top:calc(50% - 26px); right:0; display:flex; align-items:center; gap:10px; background:var(--dsu-panel-2); border:1px solid color-mix(in srgb, var(--dsu-brand) 45%, transparent); border-radius:999px 0 0 999px; padding:10px 14px 10px 12px; box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb, var(--dsu-brand) 12%, transparent); cursor:grab; transition:box-shadow .15s ease; user-select:none; pointer-events:auto; touch-action:none; }
.${NS}-ball:hover{ box-shadow:0 14px 34px rgba(77,107,254,.24),0 0 0 1px rgba(77,107,254,.3); }
.${NS}-icon{ width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#4d6bfe,#7c5cfc); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:800; }
.${NS}-icon.peak{ background:linear-gradient(135deg,#ef4444,#b91c1c); }
.${NS}-icon.valley{ background:linear-gradient(135deg,#10b981,#047857); }
.${NS}-copy{ display:flex; flex-direction:column; gap:1px; min-width:74px; }
.${NS}-copy .k{ font-size:11px; color:var(--dsu-muted); line-height:1; }
.${NS}-copy .v{ font-size:15px; font-weight:650; line-height:1.2; font-variant-numeric:tabular-nums; }
.${NS}-ball-line{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
.${NS}-ball-r0{ display:inline-block; margin-top:3px; padding:2px 8px; border-radius:999px; background:color-mix(in srgb, var(--dsu-gold) 14%, transparent); border:1px solid color-mix(in srgb, var(--dsu-gold) 40%, transparent); color:var(--dsu-gold); font-size:12px; font-weight:700; white-space:nowrap; }
.${NS}-chevron{ color:var(--dsu-muted); font-size:13px; margin-left:2px; }
.${NS}-dot{ position:absolute; top:8px; right:8px; width:8px; height:8px; border-radius:50%; background:var(--dsu-green); box-shadow:0 0 0 4px rgba(52,211,153,.12); }
.${NS}-panel{ position:absolute; right:0; top:0; bottom:0; width:460px; max-width:94vw; background:var(--dsu-panel); border-left:1px solid var(--dsu-border); box-shadow:-20px 0 60px rgba(0,0,0,.4); display:flex; flex-direction:column; z-index:2147483001; transform:translateX(105%); transition:transform .18s ease; pointer-events:auto; }
.${NS}-panel.open{ transform:translateX(0); }
.${NS}-header{ display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid var(--dsu-border); background:var(--dsu-panel-2); }
.${NS}-header .title{ flex:1; font-size:14px; font-weight:650; }
.${NS}-btn{ width:28px; height:28px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--dsu-muted); display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; }
.${NS}-btn:hover{ background:rgba(255,255,255,.06); color:var(--dsu-text); }
.${NS}-body{ flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:14px; }
.${NS}-section-title{ font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--dsu-muted); margin-bottom:8px; }
.${NS}-balance{ background:linear-gradient(135deg,rgba(77,107,254,.18),rgba(124,92,252,.08)); border:1px solid rgba(77,107,254,.28); border-radius:var(--dsu-radius); padding:14px 16px; }
.${NS}-balance-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; font-size:12px; color:var(--dsu-muted); }
.${NS}-balance-main{ display:flex; align-items:center; flex-wrap:nowrap; gap:8px; margin-bottom:10px; }
.${NS}-model-label{ margin-left:auto; font-size:12px; color:var(--dsu-muted); white-space:nowrap; flex:none; }
.${NS}-balance-main select{ flex:none; height:30px; padding:0 8px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; }
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
.${NS}-tooltip{ position:fixed; z-index:2147483999; display:none; max-width:380px; padding:10px 14px; border-radius:10px; background:var(--dsw-alias-bg-popover, var(--dsu-panel-2)); border:1px solid var(--dsu-border); color:var(--dsu-text); font-size:14px; line-height:1.6; white-space:normal; pointer-events:none; box-shadow:0 10px 28px rgba(0,0,0,.35); backdrop-filter:blur(8px); }
.${NS}-tooltip.visible{ display:block; }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-panel{ box-shadow:-12px 0 32px rgba(15,17,21,.10); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-ball{ box-shadow:0 8px 24px rgba(15,17,21,.12),0 0 0 1px rgba(77,107,254,.18); }
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
.${NS}-trend-controls{ display:flex; flex-direction:column; gap:8px; padding:12px; background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; }
.${NS}-trend-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.${NS}-trend-row label{ font-size:12px; color:var(--dsu-muted); }
.${NS}-trend-row input[type=date]{ height:30px; padding:0 8px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel); color:var(--dsu-text); font:inherit; font-size:12px; }
.${NS}-trend-row button{ height:30px; padding:0 12px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; cursor:pointer; }
.${NS}-trend-row button.active{ color:#fff; background:var(--dsu-brand); border-color:var(--dsu-brand); }
.${NS}-trend-today{ color:var(--dsu-link); }
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
    if (value >= 1_000_000_000)
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
    if (value >= 1_000)
        return `${Math.round(value / 1_000)}K`;
    return String(value);
}
/** Format money with the snapshot currency. */
function money(value, currency) {
    return currency === 'USD' ? `$${value.toFixed(2)}` : `¥${value.toFixed(2)}`;
}
/** Short display name for tracked models. */
function shortModelName(model) {
    if (model.includes('pro'))
        return 'Pro';
    if (model.includes('flash'))
        return 'Flash';
    return model;
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
/** Return whether the current Beijing time is peak or valley. */
function peakValley() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false }).formatToParts(now);
    const hour = Number(parts.find(part => part.type === 'hour')?.value ?? 0);
    const peak = (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
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
/** Mount the floating widget. */
export function apply(ctx) {
    let styleEl = null;
    if (document.querySelector(`style[data-${NS}-css]`) === null) {
        styleEl = document.createElement('style');
        styleEl.dataset[`${NS}Css`] = '';
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
    }
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
        <button class="${NS}-btn ${NS}-page-switch" data-action="page" title="模型用量趋势">趋势</button>
        <button class="${NS}-btn" data-action="refresh" title="刷新">↻</button>
        <button class="${NS}-btn" data-action="close" title="收起">✕</button>
      </div>
      <div class="${NS}-body">
        <div class="${NS}-page active" data-page="overview">
        <section>
          <div class="${NS}-section-title">账户</div>
          <div class="${NS}-balance">
            <div class="${NS}-balance-top">
              <span>DeepSeek 开放平台</span>
              <span class="${NS}-pv-badge" data-field="pv-badge">--</span>
              <span data-field="source">--</span>
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
            </div>
            <div class="${NS}-balance-detail">
              <div class="item"><div class="k">赠金余额</div><div class="v" data-field="bonus">--</div></div>
              <div class="item"><div class="k">累计消费</div><div class="v" data-field="total-cost">--</div></div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title">今日</div>
          <div class="${NS}-summary">
            <div class="${NS}-summary-card">
              <div class="k">今日消费</div>
              <div class="v" data-field="cost">--</div>
              <div class="sub">平台实际扣费</div>
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
              <div class="sub">今日有调用</div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title">分模型今日</div>
          <div class="${NS}-table" data-field="table">
            <div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>
          </div>
          <div class="${NS}-legend">数据来源：DeepSeek 开放平台，与用量页同源。</div>
        </section>
        </div>
        <div class="${NS}-page" data-page="trends">
          <div class="${NS}-trend-controls">
            <div class="${NS}-trend-row">
              <label>开始</label>
              <input type="date" data-field="trend-start">
              <label>结束</label>
              <input type="date" data-field="trend-end">
              <button class="${NS}-trend-today" data-action="trend-today">当天</button>
            </div>
            <div class="${NS}-trend-row">
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
        bonus: host.querySelector('[data-field="bonus"]'),
        totalCost: host.querySelector('[data-field="total-cost"]'),
        cost: host.querySelector('[data-field="cost"]'),
        requests: host.querySelector('[data-field="requests"]'),
        tokens: host.querySelector('[data-field="tokens"]'),
        modelCount: host.querySelector('[data-field="model-count"]'),
        table: host.querySelector('[data-field="table"]'),
        footer: host.querySelector('[data-field="footer"]'),
        tooltip: host.querySelector('[data-field="tooltip"]'),
        trendStart: host.querySelector('[data-field="trend-start"]'),
        trendEnd: host.querySelector('[data-field="trend-end"]'),
        trendList: host.querySelector('[data-field="trend-list"]'),
    };
    let open = false;
    let currency = 'CNY';
    let selectedModel = 'deepseek-v4-flash';
    let lastState = null;
    let currentPage = 'overview';
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
    const render = (state) => {
        if (state.error) {
            ballValue.textContent = '--';
            stateFields.source.textContent = '异常';
            stateFields.footer.textContent = state.error;
            return;
        }
        const balance = state.balance;
        if (balance) {
            currency = balance.currency || 'CNY';
            const symbol = currency === 'USD' ? '$' : '¥';
            ballValue.textContent = `${symbol}${balance.balance.toFixed(2)}`;
            stateFields.source.textContent = '平台已连接';
            stateFields.amount.textContent = `${symbol}${balance.balance.toFixed(2)}`;
            stateFields.amountSub.textContent = currency;
            stateFields.bonus.textContent = `${symbol}${balance.bonus_balance.toFixed(2)}`;
            stateFields.totalCost.textContent = `${symbol}${balance.total_cost.toFixed(2)}`;
        }
        else {
            ballValue.textContent = '--';
            stateFields.source.textContent = '无数据';
            stateFields.amount.textContent = '--';
            stateFields.amountSub.textContent = '';
            stateFields.bonus.textContent = '--';
            stateFields.totalCost.textContent = '--';
        }
        const ratio = state.price_ratio;
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
    };
    const loadTrends = async () => {
        const start = stateFields.trendStart.value || trendStartDate;
        const end = stateFields.trendEnd.value || trendEndDate;
        if (start > end) {
            stateFields.trendList.innerHTML = `<div class="${NS}-trend-error">开始日期不能晚于结束日期</div>`;
            return;
        }
        const dayCount = Math.round((gmt8Start(end) - gmt8Start(start)) / 86_400) + 1;
        if (dayCount > 31) {
            stateFields.trendList.innerHTML = `<div class="${NS}-trend-error">日期范围不能超过 31 天</div>`;
            return;
        }
        trendStartDate = start;
        trendEndDate = end;
        stateFields.trendList.innerHTML = `<div class="${NS}-trend-loading">加载模型用量趋势…</div>`;
        try {
            const url = `/api/deepseek-usage/model-usage?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&granularity=${trendGranularity}`;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            trendData = await response.json();
            renderTrends();
        }
        catch (error) {
            stateFields.trendList.innerHTML = `<div class="${NS}-trend-error">${escapeHtml(error instanceof Error ? error.message : String(error))}</div>`;
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
            const list = groups.get(series.provider) ?? [];
            list.push(series);
            groups.set(series.provider, list);
        }
        let colorIndex = 0;
        let html = '';
        for (const [provider, seriesList] of groups) {
            html += `<div class="${NS}-trend-group">`;
            html += `<div class="${NS}-trend-provider">${escapeHtml(provider)}</div>`;
            html += seriesList.map(series => renderTrendChart(series, palette[colorIndex++ % palette.length])).join('');
            html += '</div>';
        }
        stateFields.trendList.innerHTML = html || `<div class="${NS}-trend-empty">所选范围内暂无模型用量数据</div>`;
        bindTrendInteractions();
    };
    const renderTrendChart = (series, color) => {
        const points = series.points;
        if (points.length === 0)
            return '';
        const width = 600;
        const height = 180;
        const margin = { top: 12, right: 16, bottom: 26, left: 44 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const maxTokens = Math.max(...points.map(point => point.tokens), 1);
        const x = (index) => points.length === 1
            ? margin.left + plotWidth / 2
            : margin.left + (plotWidth * index) / (points.length - 1);
        const y = (value) => margin.top + plotHeight - (plotHeight * Math.min(value, maxTokens)) / maxTokens;
        const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.tokens).toFixed(1)}`).join(' ');
        const area = `${line} L${x(points.length - 1).toFixed(1)},${margin.top + plotHeight} L${x(0).toFixed(1)},${margin.top + plotHeight} Z`;
        const total = points.reduce((sum, point) => sum + point.tokens, 0);
        const totalInput = points.reduce((sum, point) => sum + point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens, 0);
        const totalCacheRead = points.reduce((sum, point) => sum + point.cacheReadTokens, 0);
        const totalHitRate = totalInput > 0 ? totalCacheRead / totalInput * 100 : 0;
        const pointHitRate = (point) => {
            const input = point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens;
            return input > 0 ? point.cacheReadTokens / input * 100 : 0;
        };
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
        const circles = points.map((point, index) => `
      <circle cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="3" fill="${color}" stroke="var(--dsu-panel-2)" stroke-width="1.5"/>
      <circle class="${NS}-point-hit" cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="10" fill="transparent"
        data-x="${x(index).toFixed(1)}"
        data-label="${escapeHtml(point.label)}"
        data-total="${point.tokens}"
        data-input="${point.inputTokens}"
        data-output="${point.outputTokens}"
        data-cache-read="${point.cacheReadTokens}"
        data-cache-write="${point.cacheWriteTokens}"
        data-hit-rate="${pointHitRate(point).toFixed(1)}"/>
    `).join('');
        return `
      <div class="${NS}-chart-card">
        <div class="${NS}-chart-head">
          <span class="${NS}-chart-title">${escapeHtml(series.model)}</span>
          <span class="${NS}-chart-total">${compact(total)} Tokens · 命中率 ${totalHitRate.toFixed(1)}%</span>
        </div>
        <svg class="${NS}-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(series.model)} 用量趋势">
          ${gridLines}
          ${yLabels}
          ${xLabels}
          <line class="${NS}-hover-line" x1="0" y1="${margin.top}" x2="0" y2="${margin.top + plotHeight}" stroke="var(--dsu-muted)" stroke-width="1" stroke-dasharray="4 3" opacity="0" pointer-events="none"/>
          <path d="${area}" fill="${color}" opacity="0.08"/>
          <path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          ${circles}
        </svg>
      </div>
    `;
    };
    const showChartTooltip = (circle) => {
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
        const input = Number(circle.getAttribute('data-input') ?? 0);
        const output = Number(circle.getAttribute('data-output') ?? 0);
        const cacheRead = Number(circle.getAttribute('data-cache-read') ?? 0);
        const cacheWrite = Number(circle.getAttribute('data-cache-write') ?? 0);
        const hitRate = Number(circle.getAttribute('data-hit-rate') ?? 0);
        stateFields.tooltip.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div>输入 ${compact(input)}</div>
      <div>输出 ${compact(output)}</div>
      <div>缓存命中 ${compact(cacheRead)}</div>
      <div>缓存未命中 ${compact(cacheWrite)}</div>
      <div>命中率 ${hitRate.toFixed(1)}%</div>
    `;
        const left = Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - 380));
        const top = Math.max(8, rect.top - 10);
        stateFields.tooltip.style.left = `${left}px`;
        stateFields.tooltip.style.top = `${top}px`;
        stateFields.tooltip.classList.add('visible');
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
    bindTooltip(stateFields.ballR0);
    host.querySelector('[data-action="close"]')?.addEventListener('click', () => toggle(false));
    stateFields.trendStart.value = trendStartDate;
    stateFields.trendEnd.value = trendEndDate;
    host.querySelector('[data-action="granularity"][data-granularity="hour"]')?.classList.add('active');
    host.querySelector('[data-action="page"]')?.addEventListener('click', () => {
        switchPage(currentPage === 'overview' ? 'trends' : 'overview');
    });
    stateFields.trendStart.addEventListener('change', () => void loadTrends());
    stateFields.trendEnd.addEventListener('change', () => void loadTrends());
    host.querySelector('[data-action="trend-today"]')?.addEventListener('click', () => {
        trendStartDate = todayDateString();
        trendEndDate = todayDateString();
        stateFields.trendStart.value = trendStartDate;
        stateFields.trendEnd.value = trendEndDate;
        void loadTrends();
    });
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
    void load();
    const timer = setInterval(() => { void load(); }, POLL_MS);
    ctx.effect(() => () => {
        clearInterval(timer);
        clearInterval(loginPollTimer);
        clearTimeout(pageTimer);
        disposeOverlay();
        disposeUsageCard();
        disposeVentusPage?.();
        document.removeEventListener('keydown', onKeydown);
        document.removeEventListener('click', onDocumentClick);
        host.remove();
        styleEl?.remove();
    }, 'dsh-deepseek-usage: ui');
}
//# sourceMappingURL=index.js.map