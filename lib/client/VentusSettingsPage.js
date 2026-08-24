/**
 * Ventus settings page (a `settings.section` named "Ventus"). Renders the
 * Ventus-series plugin settings cards contributed into `ventus.settings.item`.
 * Auto-created by whichever Ventus plugin mounts first; later Ventus plugins
 * merge their cards into the existing page.
 * @module dsh-deepseek-usage/client/VentusSettingsPage
 */
import { createElement } from 'react';
import { VentusUpdateBadge } from './VentusUpdateBadge.js';
const pageStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
};
const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 2px 6px',
};
/** Render the Ventus settings page: 更新徽标 + 每个 Ventus 插件一张卡片。 */
export function VentusSettingsPage(props) {
    return createElement('div', null, createElement('div', { style: headerStyle }, createElement(VentusUpdateBadge, null)), createElement('ul', { style: pageStyle }, props.renderSlot('ventus.settings.item', {})));
}
//# sourceMappingURL=VentusSettingsPage.js.map