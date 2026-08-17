/**
 * DeepSeek API 用量 settings card registered into the Ventus plugin series.
 * Collapsed by default; the user clicks the chevron to expand.
 * @module dsh-deepseek-usage/client/VentusSettingsCard
 */
import { createElement, useState } from 'react';
/** Minimal inline styles matching the Ventus settings card chrome. */
const cardStyle = {
    listStyle: 'none',
    padding: '14px 16px',
    border: '1px solid var(--dsw-alias-line-normal)',
    borderRadius: '12px',
    background: 'var(--dsw-alias-bg-module-platform)',
    color: 'var(--dsw-alias-label-primary)',
    fontFamily: 'inherit',
};
const headStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
};
const titleStyle = {
    flex: '1',
    fontSize: '14px',
    fontWeight: '700',
};
const bodyStyle = {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
};
const buttonStyle = {
    alignSelf: 'flex-start',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--dsw-alias-line-normal)',
    background: 'transparent',
    color: 'var(--dsw-alias-label-primary)',
    cursor: 'pointer',
};
/** Settings card for the DeepSeek usage monitor. */
export function DeepSeekUsageSettingsCard() {
    const [collapsed, setCollapsed] = useState(true);
    const [loginMessage, setLoginMessage] = useState('');
    const startLogin = async () => {
        setLoginMessage('正在打开登录窗口…');
        try {
            const response = await fetch('/api/deepseek-usage/login/start', { method: 'POST' });
            const result = await response.json();
            setLoginMessage(result.message ?? '请在打开的浏览器中登录');
        }
        catch {
            setLoginMessage('无法启动登录窗口');
        }
    };
    return createElement('li', { style: cardStyle }, createElement('div', {
        style: headStyle,
        role: 'button',
        tabIndex: 0,
        onClick: () => setCollapsed(current => !current),
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCollapsed(current => !current);
            }
        },
    }, createElement('span', { style: titleStyle }, 'DeepSeek API 用量'), createElement('span', { style: { fontSize: '12px' } }, collapsed ? '▸' : '▾')), collapsed
        ? null
        : createElement('div', { style: bodyStyle }, createElement('span', null, '登录状态：请点击下方按钮登录 DeepSeek 开放平台'), createElement('button', { style: buttonStyle, onClick: () => void startLogin() }, '打开登录窗口'), loginMessage ? createElement('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, loginMessage) : null));
}
//# sourceMappingURL=VentusSettingsCard.js.map