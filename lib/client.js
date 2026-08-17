window.__ModuleLoader__.load({
	id: "dsh-deepseek-usage",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region src/client/VentusSettingsCard.ts
		/**
		* DeepSeek API 用量 settings card registered into the Ventus plugin series.
		* Collapsed by default; the user clicks the chevron to expand.
		* @module dsh-deepseek-usage/client/VentusSettingsCard
		*/
		/** Minimal inline styles matching the Ventus settings card chrome. */
		const cardStyle = {
			listStyle: "none",
			padding: "14px 16px",
			border: "1px solid var(--dsw-alias-line-normal)",
			borderRadius: "12px",
			background: "var(--dsw-alias-bg-module-platform)",
			color: "var(--dsw-alias-label-primary)",
			fontFamily: "inherit"
		};
		const headStyle = {
			display: "flex",
			alignItems: "center",
			gap: "8px",
			cursor: "pointer"
		};
		const titleStyle = {
			flex: "1",
			fontSize: "14px",
			fontWeight: "700"
		};
		const bodyStyle = {
			marginTop: "10px",
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			fontSize: "13px"
		};
		const buttonStyle = {
			alignSelf: "flex-start",
			padding: "6px 12px",
			borderRadius: "8px",
			border: "1px solid var(--dsw-alias-line-normal)",
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			cursor: "pointer"
		};
		/** Settings card for the DeepSeek usage monitor. */
		function DeepSeekUsageSettingsCard() {
			const [collapsed, setCollapsed] = (0, react.useState)(true);
			const [loginMessage, setLoginMessage] = (0, react.useState)("");
			const startLogin = async () => {
				setLoginMessage("正在打开登录窗口…");
				try {
					const result = await (await fetch("/api/deepseek-usage/login/start", { method: "POST" })).json();
					setLoginMessage(result.message ?? "请在打开的浏览器中登录");
				} catch {
					setLoginMessage("无法启动登录窗口");
				}
			};
			return (0, react.createElement)("li", { style: cardStyle }, (0, react.createElement)("div", {
				style: headStyle,
				role: "button",
				tabIndex: 0,
				onClick: () => setCollapsed((current) => !current),
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setCollapsed((current) => !current);
					}
				}
			}, (0, react.createElement)("span", { style: titleStyle }, "DeepSeek API 用量"), (0, react.createElement)("span", { style: { fontSize: "12px" } }, collapsed ? "▸" : "▾")), collapsed ? null : (0, react.createElement)("div", { style: bodyStyle }, (0, react.createElement)("span", null, "登录状态：请点击下方按钮登录 DeepSeek 开放平台"), (0, react.createElement)("button", {
				style: buttonStyle,
				onClick: () => void startLogin()
			}, "打开登录窗口"), loginMessage ? (0, react.createElement)("span", { style: { color: "var(--dsw-alias-label-secondary)" } }, loginMessage) : null));
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: slots lets the plugin claim a shell overlay seat. */
		const inject = ["slots"];
		/** Plugin namespace for styles and DOM queries. */
		const NS = "dsu";
		/** Poll interval for state refreshes in milliseconds. */
		const POLL_MS = 6e4;
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
.${NS}-pv-badge{ padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; white-space:nowrap; }
.${NS}-pv-badge b{ font-weight:900; }
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
@media (prefers-reduced-motion:reduce){ .${NS}-panel{ transition:none; } }
`;
		/** Convert a number to a compact K/M label. */
		function compact(value) {
			if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
			if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 1 : 2)}M`;
			if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
			return String(value);
		}
		/** Format money with the snapshot currency. */
		function money(value, currency) {
			return currency === "USD" ? `$${value.toFixed(2)}` : `¥${value.toFixed(2)}`;
		}
		/** Short display name for tracked models. */
		function shortModelName(model) {
			if (model.includes("pro")) return "Pro";
			if (model.includes("flash")) return "Flash";
			return model;
		}
		/** Format a number as mantissa × 10^exponent with three significant digits. */
		function toScientific(value) {
			if (value === 0 || !Number.isFinite(value)) return String(value);
			const exponent = Math.floor(Math.log10(Math.abs(value)));
			const mantissa = value / 10 ** exponent;
			const superscripts = {
				"0": "⁰",
				"1": "¹",
				"2": "²",
				"3": "³",
				"4": "⁴",
				"5": "⁵",
				"6": "⁶",
				"7": "⁷",
				"8": "⁸",
				"9": "⁹",
				"-": "⁻"
			};
			const expText = String(exponent).split("").map((char) => superscripts[char] ?? char).join("");
			return `${mantissa.toFixed(2)}×10${expText}`;
		}
		/** Return whether the current Beijing time is peak or valley. */
		function peakValley() {
			const hour = Number((/* @__PURE__ */ new Date()).toLocaleString("zh-CN", {
				timeZone: "Asia/Shanghai",
				hour: "2-digit",
				hour12: false
			}));
			return hour >= 9 && hour < 12 || hour >= 14 && hour < 18 ? {
				text: "峰",
				cls: "peak"
			} : {
				text: "谷",
				cls: "valley"
			};
		}
		/** Mount the floating widget. */
		function apply(ctx) {
			let styleEl = null;
			if (document.querySelector(`style[data-${NS}-css]`) === null) {
				styleEl = document.createElement("style");
				styleEl.dataset[`${NS}Css`] = "";
				styleEl.textContent = CSS;
				document.head.appendChild(styleEl);
			}
			const host = document.createElement("div");
			host.dataset[NS] = "";
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
      <div class="${NS}-header">
        <span class="title">DeepSeek API 用量</span>
        <button class="${NS}-btn" data-action="refresh" title="刷新">↻</button>
        <button class="${NS}-btn" data-action="close" title="收起">✕</button>
      </div>
      <div class="${NS}-body">
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
			const stateFields = {
				source: host.querySelector("[data-field=\"source\"]"),
				amount: host.querySelector(`.${NS}-amount`),
				amountSub: host.querySelector(`.${NS}-amount-sub`),
				ballR0: host.querySelector("[data-field=\"ball-r0\"]"),
				ballIcon: host.querySelector("[data-field=\"ball-icon\"]"),
				pvBadge: host.querySelector("[data-field=\"pv-badge\"]"),
				modelSelect: host.querySelector("[data-field=\"model-select\"]"),
				r0Total: host.querySelector("[data-field=\"r0-total\"]"),
				r0Today: host.querySelector("[data-field=\"r0-today\"]"),
				bonus: host.querySelector("[data-field=\"bonus\"]"),
				totalCost: host.querySelector("[data-field=\"total-cost\"]"),
				cost: host.querySelector("[data-field=\"cost\"]"),
				requests: host.querySelector("[data-field=\"requests\"]"),
				tokens: host.querySelector("[data-field=\"tokens\"]"),
				modelCount: host.querySelector("[data-field=\"model-count\"]"),
				table: host.querySelector("[data-field=\"table\"]"),
				footer: host.querySelector("[data-field=\"footer\"]"),
				tooltip: host.querySelector("[data-field=\"tooltip\"]")
			};
			let open = false;
			let currency = "CNY";
			let selectedModel = "deepseek-v4-flash";
			let lastState = null;
			const toggle = (next) => {
				open = next ?? !open;
				panel.classList.toggle("open", open);
				panel.setAttribute("aria-hidden", String(!open));
				if (open) load();
			};
			const updatePeakValleyIcon = () => {
				const pv = peakValley();
				stateFields.ballIcon.textContent = pv.text;
				stateFields.ballIcon.classList.toggle("peak", pv.cls === "peak");
				stateFields.ballIcon.classList.toggle("valley", pv.cls === "valley");
				stateFields.pvBadge.innerHTML = pv.text === "峰" ? "梁文<b>峰</b>时刻" : "梁文<b>谷</b>时刻";
				stateFields.pvBadge.classList.toggle("peak", pv.cls === "peak");
				stateFields.pvBadge.classList.toggle("valley", pv.cls === "valley");
			};
			const load = async () => {
				updatePeakValleyIcon();
				try {
					const response = await fetch("/api/deepseek-usage/state", { headers: { accept: "application/json" } });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					render(await response.json());
					stateFields.footer.textContent = "数据已更新";
				} catch {
					stateFields.footer.textContent = "加载失败，3 秒后重试";
					setTimeout(() => {
						load();
					}, 3e3);
				}
			};
			const refresh = async () => {
				try {
					const response = await fetch("/api/deepseek-usage/refresh", { method: "POST" });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					render(await response.json());
				} catch {
					stateFields.footer.textContent = "刷新失败";
				}
			};
			let loginPollTimer;
			const startLogin = async () => {
				try {
					const result = await (await fetch("/api/deepseek-usage/login/start", { method: "POST" })).json();
					stateFields.footer.textContent = result.message ?? "正在打开登录窗口…";
					if (!result.ok) return;
					clearInterval(loginPollTimer);
					loginPollTimer = setInterval(async () => {
						try {
							const status = await (await fetch("/api/deepseek-usage/login/status")).json();
							if (status.loggedIn) {
								clearInterval(loginPollTimer);
								stateFields.footer.textContent = "登录成功，正在获取数据…";
								await refresh();
							} else stateFields.footer.textContent = status.message ?? "等待登录完成…";
						} catch {
							stateFields.footer.textContent = "登录状态检查失败";
						}
					}, 2e3);
				} catch {
					stateFields.footer.textContent = "无法启动登录窗口";
				}
			};
			const logout = async () => {
				try {
					const result = await (await fetch("/api/deepseek-usage/logout", { method: "POST" })).json();
					stateFields.footer.textContent = result.ok ? "已退出登录" : result.message ?? "退出失败";
					if (result.ok) await load();
				} catch {
					stateFields.footer.textContent = "退出失败";
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
				stateFields.tooltip.classList.add("visible");
			};
			const hideTooltip = () => {
				stateFields.tooltip.classList.remove("visible");
			};
			const bindTooltip = (el) => {
				el.addEventListener("mouseenter", () => {
					const tip = el.dataset.tip;
					if (tip) showTooltip(el, tip);
				});
				el.addEventListener("mouseleave", hideTooltip);
				el.addEventListener("focus", () => {
					const tip = el.dataset.tip;
					if (tip) showTooltip(el, tip);
				});
				el.addEventListener("blur", hideTooltip);
			};
			const render = (state) => {
				if (state.error) {
					ballValue.textContent = "--";
					stateFields.source.textContent = "异常";
					stateFields.footer.textContent = state.error;
					return;
				}
				const balance = state.balance;
				if (balance) {
					currency = balance.currency || "CNY";
					const symbol = currency === "USD" ? "$" : "¥";
					ballValue.textContent = `${symbol}${balance.balance.toFixed(2)}`;
					stateFields.source.textContent = "平台已连接";
					stateFields.amount.textContent = `${symbol}${balance.balance.toFixed(2)}`;
					stateFields.amountSub.textContent = currency;
					stateFields.bonus.textContent = `${symbol}${balance.bonus_balance.toFixed(2)}`;
					stateFields.totalCost.textContent = `${symbol}${balance.total_cost.toFixed(2)}`;
				} else {
					ballValue.textContent = "--";
					stateFields.source.textContent = "无数据";
					stateFields.amount.textContent = "--";
					stateFields.amountSub.textContent = "";
					stateFields.bonus.textContent = "--";
					stateFields.totalCost.textContent = "--";
				}
				const ratio = state.price_ratio;
				const modelData = ratio?.models.find((model) => model.model === selectedModel);
				const topModel = state.today?.models.slice().sort((a, b) => b.tokens - a.tokens)[0]?.model;
				const topModelData = ratio?.models.find((model) => model.model === topModel);
				if (modelData) {
					stateFields.r0Total.textContent = !modelData.used_total ? "累计未使用" : modelData.r0_total !== null ? `累计R0 ×${modelData.r0_total.toFixed(2)}` : "累计R0 --";
					stateFields.r0Total.dataset.tip = modelData.has_history ? `8月17日起累计 A2/A1 = ${modelData.a2_total !== null ? toScientific(modelData.a2_total) : "--"} / ${toScientific(modelData.a1)}` : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
					stateFields.r0Today.textContent = !modelData.used_today ? "今日未使用" : modelData.r0_today !== null ? `今日R0 ×${modelData.r0_today.toFixed(2)}` : "今日R0 --";
					stateFields.r0Today.dataset.tip = modelData.has_history ? `今日 A2/A1 = ${modelData.a2_today !== null ? toScientific(modelData.a2_today) : "--"} / ${toScientific(modelData.a1)}` : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
				} else {
					stateFields.r0Total.textContent = "累计R0 --";
					stateFields.r0Today.textContent = "今日R0 --";
				}
				stateFields.ballR0.textContent = topModelData && topModelData.used_today && topModelData.r0_today !== null ? `${shortModelName(topModel ?? selectedModel)} ×${topModelData.r0_today.toFixed(2)}` : "--";
				stateFields.ballR0.dataset.tip = topModelData && topModelData.r0_today !== null ? `${shortModelName(topModel ?? selectedModel)} 今日 A2/A1 = ${toScientific(topModelData.a2_today ?? 0)} / ${toScientific(topModelData.a1)}` : "";
				const today = state.today;
				if (today) {
					stateFields.cost.textContent = money(today.cost, currency);
					stateFields.requests.textContent = today.requests.toLocaleString("zh-CN");
					stateFields.tokens.textContent = today.tokens.toLocaleString("zh-CN");
					stateFields.modelCount.textContent = String(today.models.length);
					const rows = today.models.map((model) => `
        <div class="${NS}-row">
          <span class="model" title="${escapeHtml(model.model)}">${escapeHtml(model.model)}</span>
          <span class="num">${model.requests.toLocaleString("zh-CN")}</span>
          <span class="num">${compact(model.tokens)}</span>
          <span class="cost">${money(model.cost, currency)}</span>
        </div>
      `).join("");
					stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>${rows || `<div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`}`;
				} else {
					stateFields.cost.textContent = "--";
					stateFields.requests.textContent = "--";
					stateFields.tokens.textContent = "--";
					stateFields.modelCount.textContent = "--";
					stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div><div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`;
				}
				stateFields.footer.textContent = `更新于 ${new Date(state.fetched_at).toLocaleTimeString("zh-CN", { hour12: false })}`;
				lastState = state;
			};
			const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\"": "&quot;",
				"'": "&#39;"
			})[char] ?? char);
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
				if (!ball.hasPointerCapture(event.pointerId)) return;
				const delta = event.clientY - dragPointerY;
				if (Math.abs(delta) > 4) dragMoved = true;
				const maxTop = Math.max(0, window.innerHeight - ball.offsetHeight);
				ball.style.top = `${Math.max(0, Math.min(maxTop, dragStartTop + delta))}px`;
			};
			const onBallPointerUp = (event) => {
				if (!ball.hasPointerCapture(event.pointerId)) return;
				ball.releasePointerCapture(event.pointerId);
				if (!dragMoved) return;
				if (event.clientX < window.innerWidth / 2) {
					ball.style.right = "auto";
					ball.style.left = "0";
					ball.style.borderRadius = "0 999px 999px 0";
				} else {
					ball.style.left = "auto";
					ball.style.right = "0";
					ball.style.borderRadius = "999px 0 0 999px";
				}
			};
			ball.addEventListener("click", () => {
				if (!dragMoved) toggle();
			});
			ball.addEventListener("pointerdown", onBallPointerDown);
			ball.addEventListener("pointermove", onBallPointerMove);
			ball.addEventListener("pointerup", onBallPointerUp);
			ball.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					toggle();
				}
			});
			host.querySelector("[data-action=\"login\"]")?.addEventListener("click", () => void startLogin());
			host.querySelector("[data-action=\"logout\"]")?.addEventListener("click", () => void logout());
			host.querySelectorAll("[data-action=\"refresh\"]").forEach((el) => el.addEventListener("click", () => void refresh()));
			stateFields.modelSelect.addEventListener("change", () => {
				selectedModel = stateFields.modelSelect.value;
				if (lastState) render(lastState);
			});
			bindTooltip(stateFields.r0Total);
			bindTooltip(stateFields.r0Today);
			bindTooltip(stateFields.ballR0);
			host.querySelector("[data-action=\"close\"]")?.addEventListener("click", () => toggle(false));
			const onKeydown = (event) => {
				if (event.key === "Escape" && open) toggle(false);
			};
			document.addEventListener("keydown", onKeydown);
			const onDocumentClick = (event) => {
				if (!open) return;
				const target = event.target;
				if (!panel.contains(target) && !ball.contains(target)) toggle(false);
			};
			document.addEventListener("click", onDocumentClick);
			const disposeOverlay = ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dsh-deepseek-usage",
				order: 100
			}, () => null));
			const disposeVentusCard = ctx.slots.inject("ventus.plugin.item", () => ctx.slots.register({
				name: "ventus.plugin.item",
				id: "dsh-deepseek-usage",
				order: 20
			}, DeepSeekUsageSettingsCard));
			load();
			const timer = setInterval(() => {
				load();
			}, POLL_MS);
			ctx.effect(() => () => {
				clearInterval(timer);
				clearInterval(loginPollTimer);
				disposeOverlay();
				disposeVentusCard();
				document.removeEventListener("keydown", onKeydown);
				document.removeEventListener("click", onDocumentClick);
				host.remove();
				styleEl?.remove();
			}, "dsh-deepseek-usage: ui");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map