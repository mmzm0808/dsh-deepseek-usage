/**
 * Ventus settings page (a `settings.section` named "Ventus"). Renders the
 * Ventus-series plugin settings cards contributed into `ventus.settings.item`.
 * Auto-created by whichever Ventus plugin mounts first; later Ventus plugins
 * merge their cards into the existing page.
 * @module dsh-deepseek-usage/client/VentusSettingsPage
 */
/** Minimal props for the settings section page with a child slot. */
interface VentusSettingsPageProps {
    renderSlot: (name: string, props: Record<string, unknown>) => unknown;
}
/** Render the Ventus settings page: one stacked card per Ventus-series plugin. */
export declare function VentusSettingsPage(props: VentusSettingsPageProps): unknown;
export {};
