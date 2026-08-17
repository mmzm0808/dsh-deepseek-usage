/**
 * Fallback Ventus group card. Used only when dsh-ventus-whale is not
 * installed, so the DeepSeek usage settings still appear under a Ventus
 * series group instead of floating as a standalone settings item.
 * @module dsh-deepseek-usage/client/VentusFallbackGroupCard
 */

import { createElement, useState } from 'react'

/** Minimal props for a settings group card with a child slot. */
interface VentusFallbackGroupCardProps {
  renderSlot: (name: string, props: Record<string, unknown>) => unknown
}

const groupStyle: Record<string, string> = {
  listStyle: 'none',
  padding: '12px 16px',
  border: '1px solid var(--dsw-alias-line-normal)',
  borderRadius: '12px',
  background: 'var(--dsw-alias-bg-module-platform)',
  color: 'var(--dsw-alias-label-primary)',
  fontFamily: 'inherit',
}

const headerStyle: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  cursor: 'pointer',
}

const bodyStyle: Record<string, string> = {
  paddingTop: '6px',
}

/** Render a Ventus series group that hosts our settings card. */
export function VentusFallbackGroupCard(props: VentusFallbackGroupCardProps): unknown {
  const [open, setOpen] = useState(false)
  return createElement(
    'li',
    { style: groupStyle },
    createElement(
      'div',
      {
        style: headerStyle,
        role: 'button',
        tabIndex: 0,
        onClick: () => setOpen(current => !current),
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(current => !current)
          }
        },
      },
      createElement('span', { style: { fontWeight: '700', fontSize: '14px' } }, 'Ventus 插件'),
      createElement('span', { style: { fontSize: '12px' } }, open ? '▾' : '▸'),
    ),
    open
      ? createElement(
        'div',
        { style: bodyStyle },
        props.renderSlot('ventus.plugin.item', {}),
      )
      : null,
  )
}
