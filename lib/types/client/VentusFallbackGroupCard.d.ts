/**
 * Fallback Ventus group card. Used only when dsh-ventus-whale is not
 * installed, so the DeepSeek usage settings still appear under a Ventus
 * series group instead of floating as a standalone settings item.
 * @module dsh-deepseek-usage/client/VentusFallbackGroupCard
 */
/** Minimal props for a settings group card with a child slot. */
interface VentusFallbackGroupCardProps {
    renderSlot: (name: string, props: Record<string, unknown>) => unknown;
}
/** Render a Ventus series group that hosts our settings card. */
export declare function VentusFallbackGroupCard(props: VentusFallbackGroupCardProps): unknown;
export {};
