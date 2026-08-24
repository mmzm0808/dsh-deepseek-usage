/**
 * Shared Ventus-series UI preferences (localStorage-backed).
 *
 * These are client-only display preferences shared by every Ventus plugin:
 *   - cacheHit2Decimals: rewrite the composer stats "缓存命中 x%" to two decimals.
 *   - fluidConversationWidth: expand the conversation column to fill the space
 *     between sidebars instead of the default fixed 748px column.
 *
 * The same module is mirrored in dsh-ventus-whale so either Ventus plugin can
 * provide the behavior and settings surface.
 */
export declare const VENTUS_PREFS_KEY = "dsh.ventus.preferences";
export declare const VENTUS_PREFS_EVENT = "ventus:prefs";
export interface VentusPrefs {
    /** When false, the usage widget hides its floating UI and stops polling. */
    usageEnabled: boolean;
    /** Rewrite cache-hit percentages to two decimals in the composer stats line. */
    cacheHit2Decimals: boolean;
    /** When true, --dsh-chat-content-width becomes fluid (fills sidebar gap). */
    fluidConversationWidth: boolean;
    /** When true, the hero page (headline + composer) docks to the column bottom.
        The theme styles the effect; this plugin owns the switch (body class
        `theme-endfield-hero-dock`). */
    heroDockBottom: boolean;
}
export declare const DEFAULT_VENTUS_PREFS: VentusPrefs;
export declare function readVentusPrefs(): VentusPrefs;
/** 记录最新真实命中率（今日该模型 命中/（命中+未命中））。无数据传 null。 */
export declare function setRealHitRate(pct: number | null): void;
export declare function writeVentusPrefs(prefs: VentusPrefs): void;
/**
 * Apply Ventus display preferences to the live DOM and keep them applied as
 * React re-renders the stats line / conversation column.
 * @returns a disposer that stops the observers.
 */
export declare function applyVentusPrefs(): () => void;
