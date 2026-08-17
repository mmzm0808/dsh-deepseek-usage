/**
 * DeepSeek API 用量 settings card registered into the Ventus plugin series.
 * Collapsed by default; the header row toggles the body. Visual chrome mirrors
 * the dsh-ventus-whale settings card so the two Ventus pages stay unified.
 * @module dsh-deepseek-usage/client/VentusSettingsCard
 */
import { createElement, useState } from 'react';
/** Card chrome matching the Ventus whale settings card (gradient + platform bg). */
const cardStyle = {
    listStyle: 'none',
    padding: '16px 18px',
    border: '1px solid var(--dsw-alias-line-normal)',
    borderRadius: '12px',
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-state-business-primary) 5%, transparent), transparent 45%), var(--dsw-alias-bg-module-platform)',
    boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.03)',
    color: 'var(--dsw-alias-label-primary)',
    fontFamily: 'inherit',
};
/** Header row: the whole row toggles the body. */
const headStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    cursor: 'pointer',
};
/** Title with the brand-blue accent bar (mirrors the whale card's ::before). */
const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--dsw-alias-label-primary)',
};
const accentStyle = {
    width: '3px',
    height: '14px',
    borderRadius: '2px',
    background: 'var(--dsw-alias-state-business-primary)',
    boxShadow: '0 0 10px color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent)',
    flex: 'none',
};
const chevronStyle = {
    flex: 'none',
    marginLeft: '8px',
    color: 'var(--dsw-alias-label-secondary)',
    fontSize: '12px',
    transition: 'transform 150ms ease',
};
const bodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '13px',
};
const buttonStyle = {
    alignSelf: 'flex-start',
    appearance: 'none',
    WebkitAppearance: 'none',
    height: '32px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid var(--dsw-alias-state-business-primary, #4d6bfe)',
    background: 'var(--dsw-alias-state-business-primary, #4d6bfe)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(77,107,254,.35)',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    lineHeight: '30px',
    cursor: 'pointer',
};
const mutedStyle = {
    color: 'var(--dsw-alias-label-secondary)',
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
    const head = createElement('div', {
        style: headStyle,
        role: 'button',
        tabIndex: 0,
        'aria-expanded': !collapsed,
        onClick: () => setCollapsed(current => !current),
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCollapsed(current => !current);
            }
        },
    }, createElement('span', { style: titleStyle }, createElement('span', { style: accentStyle }), 'DeepSeek API 用量'), createElement('span', { style: { ...chevronStyle, transform: collapsed ? 'none' : 'rotate(180deg)' } }, '▾'));
    const body = collapsed
        ? null
        : createElement('div', { style: bodyStyle }, createElement('span', { style: mutedStyle }, '登录状态：请点击下方按钮登录 DeepSeek 开放平台'), createElement('button', { style: buttonStyle, onClick: () => void startLogin() }, '打开登录窗口'), loginMessage ? createElement('span', { style: mutedStyle }, loginMessage) : null);
    return createElement('li', { style: cardStyle }, head, body);
}
//# sourceMappingURL=VentusSettingsCard.js.map