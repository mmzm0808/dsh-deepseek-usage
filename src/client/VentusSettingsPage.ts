/**
 * Ventus settings page (a `settings.section` named "Ventus"). Renders the
 * Ventus-series plugin settings cards contributed into `ventus.settings.item`.
 * Auto-created by whichever Ventus plugin mounts first; later Ventus plugins
 * merge their cards into the existing page.
 * @module dsh-deepseek-usage/client/VentusSettingsPage
 */

import { createElement } from 'react'

/** Minimal props for the settings section page with a child slot. */
interface VentusSettingsPageProps {
  renderSlot: (name: string, props: Record<string, unknown>) => unknown
}

const pageStyle: Record<string, string> = {
  listStyle: 'none',
  padding: '0',
  margin: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

/** Render the Ventus settings page: one stacked card per Ventus-series plugin. */
export function VentusSettingsPage(props: VentusSettingsPageProps): unknown {
  return createElement('ul', { style: pageStyle }, props.renderSlot('ventus.settings.item', {}))
}
