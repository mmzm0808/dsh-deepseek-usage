/**
 * HTTP route family for dsh-deepseek-usage: read the current usage snapshot
 * and force a balance refresh. All routes are loopback-only and `no-store`.
 * @module dsh-deepseek-usage/routes
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import type { ModelUsageResponse, UsageState } from './protocol.js';
/** Dependencies the routes need from the plugin host. */
export interface UsageRoutesDeps {
    /** Build the latest state snapshot. */
    getState(): UsageState;
    /** Force a balance refresh and return the resulting snapshot. */
    refreshBalance(): Promise<UsageState>;
    /** Open the platform login browser. */
    startLogin(): Promise<{
        ok: boolean;
        message: string;
    }>;
    /** Check whether the platform login browser has produced a userToken. */
    checkLogin(): Promise<{
        loggedIn: boolean;
        message?: string;
    }>;
    /** Clear stored userToken and reset to logged-out state. */
    logout(): {
        ok: boolean;
        message?: string;
    };
    /** Fetch per-model usage buckets for a date range. */
    getModelUsage(start: string, end: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>;
    /** Fetch per-model usage buckets and emit progressive snapshots while scanning. */
    streamModelUsage(start: string, end: string, granularity: 'hour' | 'day', onSnapshot: (series: ModelUsageResponse['series']) => void): Promise<ModelUsageResponse>;
}
/** Build the route family. */
export declare function makeUsageRoutes(deps: UsageRoutesDeps): WebRoute[];
