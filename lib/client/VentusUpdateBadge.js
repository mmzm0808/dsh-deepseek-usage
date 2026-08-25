/**
 * Ventus 整合包更新入口（客户端）。
 *
 * 点击流程（安装确认 → 顶层模态）不变：
 *  1. 先弹「是否安装更新？」确认框；
 *  2. 确认后打开顶层模态（VentusUpdateModal）：完整多选安装/更新列表。
 *
 * 徽标改用「版本号」判断更新：本地整合包 package.json version vs 远程
 * master version。
 *  - 一致 → 「已是最新版本 · vX」；
 *  - 不一致 → 「发现更新 · vX」（高亮可点）；
 *  - 版本号读不到（GitHub 不可达 / 本地读不到）→ 降级为提交 sha 对比；
 *  - 全部失败 → 「检查失败」。
 *
 * 数据统一来自 host 路由 GET /api/deepseek-usage/ventus-update/list。
 * @module dsh-deepseek-usage/client/VentusUpdateBadge
 */
import { createElement, useEffect, useState } from 'react';
import { VentusUpdateModal } from './VentusUpdateModal.js';
/** 检查结果缓存键（避免每次进设置页都打 GitHub）。 */
const CACHE_KEY = 'dsh.ventus.updateCheck';
/** 缓存有效期：30 分钟。 */
const CACHE_TTL_MS = 30 * 60 * 1000;
/** 本地构建 sha（版本号读不到时兜底对比）。 */
const LOCAL_SHA_KEY = 'dsh.ventus.localSha';
function readLocalSha() {
    try {
        const v = localStorage.getItem(LOCAL_SHA_KEY);
        return typeof v === 'string' && v.length >= 7 ? v : null;
    }
    catch {
        return null;
    }
}
function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw === null)
            return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.at !== 'number' || typeof parsed?.remoteVersion !== 'string')
            return null;
        if (Date.now() - parsed.at > CACHE_TTL_MS)
            return null;
        return {
            at: parsed.at,
            localVersion: typeof parsed.localVersion === 'string' ? parsed.localVersion : '',
            remoteVersion: parsed.remoteVersion,
            message: typeof parsed.message === 'string' ? parsed.message : '',
        };
    }
    catch {
        return null;
    }
}
function writeCache(value) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    }
    catch { /* 忽略 */ }
}
const badgeStyle = {
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
};
const updateStyle = {
    ...badgeStyle,
    border: '1px solid var(--edge-accent, var(--dsw-alias-state-business-primary))',
    color: 'var(--edge-accent, var(--dsw-alias-state-business-primary))',
};
/** 整合包更新入口（放在 Ventus 设置页右上角）。 */
export function VentusUpdateBadge() {
    const [state, setState] = useState({ kind: 'checking' });
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => {
        let alive = true;
        const decide = (localVersion, remoteVersion, remoteSha, message) => {
            if (!alive)
                return;
            // 主判断：版本号都有 → 直接对比。
            if (localVersion !== null && remoteVersion !== null) {
                if (localVersion === remoteVersion)
                    setState({ kind: 'latest', version: localVersion });
                else
                    setState({ kind: 'update', version: remoteVersion, message });
                return;
            }
            // 版本号读不到（如离线）→ 降级为提交 sha 对比。
            const localSha = readLocalSha();
            if (localSha !== null && remoteSha !== null && !(remoteSha.startsWith(localSha) || localSha.startsWith(remoteSha))) {
                setState({ kind: 'update', version: remoteSha.slice(0, 7), message });
                return;
            }
            setState({ kind: 'latest' });
        };
        const cached = readCache();
        if (cached !== null) {
            decide(cached.localVersion === '' ? null : cached.localVersion, cached.remoteVersion, null, cached.message);
            return () => { alive = false; };
        }
        fetch('/api/deepseek-usage/ventus-update/list', { cache: 'no-store' })
            .then(async (res) => {
            if (!res.ok)
                throw new Error(`http ${res.status}`);
            return await res.json();
        })
            .then((payload) => {
            if (!alive)
                return;
            const localVersion = payload.localVersion ?? null;
            const remoteVersion = payload.remoteVersion ?? null;
            const message = payload.remote?.message ?? '';
            if (localVersion !== null && remoteVersion !== null) {
                writeCache({ at: Date.now(), localVersion, remoteVersion, message });
            }
            decide(localVersion, remoteVersion, payload.remote?.sha ?? null, message);
        })
            .catch(() => { if (alive)
            setState({ kind: 'error' }); });
        return () => { alive = false; };
    }, []);
    const open = () => {
        if (window.confirm('是否安装更新？\n\n点击确定后将打开安装窗口，可勾选要安装 / 更新的插件，仅对选中项执行更新。')) {
            setModalOpen(true);
        }
    };
    const label = state.kind === 'checking' ? '检查更新…'
        : state.kind === 'error' ? '检查失败'
            : state.kind === 'latest' ? `已是最新版本${state.version === undefined ? '' : ` · v${state.version}`}`
                : `发现更新 · v${state.version}`;
    return createElement('span', { style: { display: 'inline-flex' } }, createElement('button', {
        type: 'button',
        style: state.kind === 'update' ? updateStyle : badgeStyle,
        title: state.kind === 'update' && state.message !== ''
            ? `最新提交：${state.message}`
            : '打开安装 / 更新窗口',
        onClick: open,
    }, label), modalOpen && createElement(VentusUpdateModal, {
        onClose: () => { setModalOpen(false); },
    }));
}
//# sourceMappingURL=VentusUpdateBadge.js.map