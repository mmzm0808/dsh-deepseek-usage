/**
 * dsh-deepseek-usage — browser half. Renders a floating right-edge ball and a
 * slide-in usage panel as a body portal. The panel shows only exact values
 * fetched from the DeepSeek Platform private API.
 * @module dsh-deepseek-usage/client
 */
/** Minimal slot service face used by this plugin. */
interface SlotsLike {
    inject(key: string, callback: () => () => void): () => void;
    register(options: {
        name: string;
        id: string;
        order?: number;
    }, component: unknown): () => void;
}
/** Minimal client context shape this plugin uses. */
interface ClientContext {
    slots: SlotsLike;
    effect(callback: () => () => void, label?: string): void;
}
/** Required services: slots lets the plugin claim a shell overlay seat. */
export declare const inject: string[];
/** Mount the floating widget. */
export declare function apply(ctx: ClientContext): void;
export {};
