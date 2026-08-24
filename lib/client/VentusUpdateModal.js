/**
 * Ventus 整合包安装 / 更新弹窗（顶层模态）。
 *
 * 由 VentusUpdateBadge 在用户确认后打开：fixed 全屏遮罩 + 居中卡片，
 * z-index 99999（高于主题浮窗 9500 与一切既有层级）。弹窗内展示
 * 整合包全部子插件的多选清单（每项带勾选框与安装状态），仅对勾选项
 * 执行更新/安装；未勾选的已装子插件保持本机旧版不动。
 *
 * 数据与动作均走 host 路由：
 *  - GET  /api/deepseek-usage/ventus-update/list   （远程提交 + 本地清单）
 *  - POST /api/deepseek-usage/ventus-update/apply  （{ selected } 执行更新）
 * @module dsh-deepseek-usage/client/VentusUpdateModal
 */
import { createElement, useEffect, useState } from 'react';
/** 本地安装版本 sha（构建时由 bundle stamp 写入）。 */
const LOCAL_SHA_KEY = 'dsh.ventus.localSha';
function readLocalSha() {
    try {
        const v = window.localStorage.getItem(LOCAL_SHA_KEY);
        return typeof v === 'string' && v.length >= 7 ? v : null;
    }
    catch {
        return null;
    }
}
/** 已安装 + 本地版本与远程不一致 = 可更新。 */
function isUpdateable(item, localSha, remoteSha) {
    return item.installed && localSha !== null && remoteSha !== null && localSha !== remoteSha;
}
const overlayStyle = {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.45)',
};
const cardStyle = {
    width: 'min(560px, calc(100vw - 48px))',
    maxHeight: 'calc(100vh - 96px)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--dsw-alias-bg-layer-2, #1b1f27)',
    border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))',
    borderRadius: '12px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    overflow: 'hidden',
};
const headStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.08))',
};
const titleStyle = {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--dsw-alias-label-primary, #e6e9f0)',
};
const closeBtnStyle = {
    border: 'none',
    background: 'transparent',
    color: 'var(--dsw-alias-label-secondary, #9aa3b2)',
    fontSize: '18px',
    lineHeight: '1',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
};
const bodyStyle = {
    padding: '12px 18px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
};
const remoteLineStyle = {
    fontSize: '12px',
    color: 'var(--dsw-alias-label-secondary, #9aa3b2)',
    lineHeight: '1.6',
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.04))',
};
const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.08))',
    cursor: 'pointer',
    userSelect: 'none',
};
const itemNameStyle = {
    fontSize: '13px',
    color: 'var(--dsw-alias-label-primary, #e6e9f0)',
    fontWeight: '500',
};
const itemCatStyle = {
    fontSize: '11px',
    color: 'var(--dsw-alias-label-tertiary, #6b7484)',
};
const badgeStyle = {
    marginLeft: 'auto',
    fontSize: '11px',
    padding: '1px 8px',
    borderRadius: '99px',
    whiteSpace: 'nowrap',
};
function statusBadge(item, localSha, remoteSha) {
    if (!item.installed)
        return { text: '未安装', color: 'var(--dsw-alias-label-tertiary, #6b7484)' };
    if (isUpdateable(item, localSha, remoteSha))
        return { text: '可更新', color: 'var(--edge-accent, #e8b34b)' };
    return { text: '已安装', color: 'var(--dsw-alias-state-success, #4caf7d)' };
}
const footStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 18px',
    borderTop: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.08))',
};
const hintStyle = {
    fontSize: '12px',
    color: 'var(--dsw-alias-label-secondary, #9aa3b2)',
};
const primaryBtnStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#10141c',
    background: 'var(--edge-accent, #e8b34b)',
};
const ghostBtnStyle = {
    border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))',
    background: 'transparent',
    color: 'var(--dsw-alias-label-primary, #e6e9f0)',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer',
};
/** 顶层安装/更新模态。 */
export function VentusUpdateModal(props) {
    const [list, setList] = useState(null);
    const [checked, setChecked] = useState(new Set());
    const [phase, setPhase] = useState('loading');
    const [result, setResult] = useState(null);
    const [errorText, setErrorText] = useState('');
    const localSha = readLocalSha();
    const remoteSha = list?.remote?.sha ?? null;
    const plugins = list?.plugins ?? [];
    const isBundled = list?.bundled !== false;
    useEffect(() => {
        let alive = true;
        fetch('/api/deepseek-usage/ventus-update/list', { cache: 'no-store' })
            .then(async (res) => res.json())
            .then((payload) => {
            if (!alive)
                return;
            setList(payload);
            setChecked(new Set(payload.plugins?.map(item => item.id) ?? []));
            setPhase('ready');
        })
            .catch(() => {
            if (!alive)
                return;
            setPhase('error');
            setErrorText('无法连接更新服务');
        });
        return () => { alive = false; };
    }, []);
    const toggle = (id) => {
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const toggleAll = () => {
        setChecked(prev => prev.size === plugins.length
            ? new Set()
            : new Set(plugins.map(item => item.id)));
    };
    const apply = () => {
        if (phase === 'applying' || checked.size === 0)
            return;
        setPhase('applying');
        setErrorText('');
        fetch('/api/deepseek-usage/ventus-update/apply', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ selected: [...checked] }),
        })
            .then(async (res) => res.json())
            .then((payload) => {
            if (payload.ok === true && payload.updated !== undefined) {
                // 更新后的 bundle 自带新 stamp，本页先行对齐，避免关闭后仍显示「可更新」。
                if (payload.sha !== null && payload.sha !== undefined) {
                    try {
                        window.localStorage.setItem(LOCAL_SHA_KEY, payload.sha);
                    }
                    catch { /* ignore */ }
                }
                setResult(payload);
                setPhase('done');
            }
            else {
                setPhase('error');
                setErrorText(payload.error ?? '更新失败');
            }
        })
            .catch(() => {
            setPhase('error');
            setErrorText('更新请求失败');
        });
    };
    const ready = phase === 'ready' || phase === 'done' || phase === 'error';
    const applying = phase === 'applying';
    const busy = phase === 'loading' || applying;
    return createElement('div', { style: overlayStyle, onClick: () => { if (!busy)
            props.onClose(); } }, createElement('div', {
        style: cardStyle,
        onClick: (event) => { event.stopPropagation(); },
    }, createElement('div', { style: headStyle }, createElement('span', { style: titleStyle }, '安装 / 更新插件'), createElement('button', {
        type: 'button',
        style: closeBtnStyle,
        'aria-label': '关闭',
        disabled: busy,
        onClick: props.onClose,
    }, '✕')), createElement('div', { style: bodyStyle }, phase === 'loading' && createElement('div', { style: hintStyle }, '正在检查更新…'), ready && list?.bundled === false && createElement('div', { style: remoteLineStyle }, '独立安装的 dsh-deepseek-usage 无整合包更新功能，请安装 dsh-ventus-plugins 整合包。'), ready && isBundled && remoteSha === null &&
        createElement('div', { style: remoteLineStyle }, '无法连接 GitHub（远程版本未知）。仍可勾选已列出的插件尝试更新，执行时可能失败。'), ready && isBundled && remoteSha !== null && list?.remote != null &&
        createElement('div', { style: remoteLineStyle }, createElement('div', null, `远程最新：${list.remote.sha.slice(0, 7)}${localSha === null ? '' : `（本地 ${localSha.slice(0, 7)}${localSha !== list.remote.sha ? '，有更新' : '，已是最新'}）`}`), list.remote.message !== '' && createElement('div', null, list.remote.message)), ready && plugins.length > 0 && createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } }, createElement('label', { style: { ...itemStyle, borderStyle: 'dashed' } }, createElement('input', {
        type: 'checkbox',
        checked: checked.size === plugins.length && plugins.length > 0,
        onChange: toggleAll,
    }), createElement('span', { style: itemNameStyle }, '全选 / 取消全选')), plugins.map(item => {
        const badge = statusBadge(item, localSha, remoteSha);
        return createElement('label', { key: item.id, style: itemStyle }, createElement('input', {
            type: 'checkbox',
            checked: checked.has(item.id),
            disabled: applying,
            onChange: () => { toggle(item.id); },
        }), createElement('span', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, createElement('span', { style: itemNameStyle }, item.name), createElement('span', { style: itemCatStyle }, item.category)), createElement('span', { style: { ...badgeStyle, color: badge.color } }, badge.text));
    })), applying && createElement('div', { style: hintStyle }, '正在下载并安装选中项，请稍候…'), phase === 'done' && result !== null && createElement('div', { style: remoteLineStyle }, createElement('div', null, `已更新 ${(result.updated ?? []).length} 项：${(result.updated ?? []).map(id => id.split('/').pop()).join('、')}`), createElement('div', null, `聚合 bundle 已重建（含 ${result.bundledCount ?? '?'} 个子插件），重启 DSH 后生效。`)), phase === 'error' && createElement('div', { style: { ...remoteLineStyle, borderColor: 'var(--dsw-alias-state-danger, #e05c5c)' } }, `更新失败：${errorText}`)), createElement('div', { style: footStyle }, createElement('span', { style: hintStyle }, ready && plugins.length > 0 ? `已选 ${checked.size} / ${plugins.length} 项` : ''), createElement('div', { style: { display: 'flex', gap: '8px' } }, createElement('button', {
        type: 'button',
        style: ghostBtnStyle,
        disabled: busy,
        onClick: props.onClose,
    }, '取消'), ready && createElement('button', {
        type: 'button',
        style: primaryBtnStyle,
        disabled: applying || checked.size === 0 || list?.bundled === false,
        onClick: apply,
    }, applying ? '安装中…' : phase === 'done' ? '已完成' : `更新选中项 (${checked.size})`)))));
}
//# sourceMappingURL=VentusUpdateModal.js.map