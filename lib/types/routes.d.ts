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
    /** 总览页范围数据：DeepSeek 开放平台（官方用量看板同源），非本地 session 统计。 */
    platformModelUsage(start: string, end: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>;
    /** 插件元信息（当前 DSH 应用版本等）。 */
    getMeta(): {
        dshVersion: string;
    };
    /** 每个活跃会话的自算缓存命中率（两位小数字符串，无数据为 null）与最新活跃会话的值。 */
    getSessionHits(): {
        items: Array<{
            id: string;
            title: string;
            hit: string | null;
            promptTok: number;
            officialPct: number | null;
        }>;
        latest: string | null;
    };
}
/** Build the route family. */
export declare function makeUsageRoutes(deps: UsageRoutesDeps): WebRoute[];
