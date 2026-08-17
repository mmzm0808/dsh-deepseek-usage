/**
 * Fallback Ventus group card. Used only when dsh-ventus-whale is not
 * installed, so the DeepSeek usage settings still appear under a Ventus
 * series group instead of floating as a standalone settings item.
 * @module dsh-deepseek-usage/client/VentusFallbackGroupCard
 */
import { createElement, useState } from 'react';
const groupStyle = {
    listStyle: 'none',
    padding: '12px 16px',
    border: '1px solid var(--dsw-alias-line-normal)',
    borderRadius: '12px',
    background: 'var(--dsw-alias-bg-module-platform)',
    color: 'var(--dsw-alias-label-primary)',
    fontFamily: 'inherit',
};
const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
};
const bodyStyle = {
    paddingTop: '6px',
};
/** Render a Ventus series group that hosts our settings card. */
export function VentusFallbackGroupCard(props) {
    const [open, setOpen] = useState(false);
    return createElement('li', { style: groupStyle }, createElement('div', {
        style: headerStyle,
        role: 'button',
        tabIndex: 0,
        onClick: () => setOpen(current => !current),
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setOpen(current => !current);
            }
        },
    }, createElement('span', { style: { fontWeight: '700', fontSize: '14px' } }, 'Ventus 插件'), createElement('span', { style: { fontSize: '12px' } }, open ? '▾' : '▸')), open
        ? createElement('div', { style: bodyStyle }, props.renderSlot('ventus.plugin.item', {}))
        : null);
}
//# sourceMappingURL=VentusFallbackGroupCard.js.map