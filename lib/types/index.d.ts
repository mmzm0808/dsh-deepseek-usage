/**
 * dsh-deepseek-usage — host half. Pulls exact balance, cumulative cost, and
 * today's usage/cost from the DeepSeek Platform private API (the same source
 * as the official usage dashboard) and exposes them through loopback HTTP
 * routes for the browser floating widget. No local pricing is used.
 * @module dsh-deepseek-usage
 */
import type { Context } from '@deepseek-ai/cordis';
import type { WebServer } from '@deepseek-ai/dsh-host-webserver';
import z from 'schemastery';
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export declare const name = "deepseek-usage";
/** Services required before routes can mount. */
export declare const inject: string[];
/** Plugin config. */
export interface Config {
    /** Balance/usage refresh interval in milliseconds. */
    refreshIntervalMs: number;
    /** DeepSeek Platform web `userToken`; only a configuration item, never embedded in plugin code. */
    platformUserToken: string;
}
export declare const Config: z<Config>;
type AppContext = Context & {
    webServer: WebServer;
};
/** Register the plugin. */
export declare function apply(ctx: AppContext, config: Config): void;
export {};
