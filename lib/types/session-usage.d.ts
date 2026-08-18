/**
 * Local session-log usage aggregator. Reads the DSH session store and
 * persistence backend, then folds provider-reported `assistant/message` usage
 * into per-provider and per-model hourly/daily buckets. Extracted usage samples
 * are cached in a JSON file so already-read history loads quickly on later runs.
 * @module dsh-deepseek-usage/session-usage
 */
import type { ModelUsageResponse } from './protocol.js';
/** Minimal structural face of a live DSH session. */
export interface SessionLike {
    id: string;
    events: SessionEventLike[];
}
/** Minimal structural face of `ctx.sessions`. */
export interface SessionsLike {
    list(): SessionLike[];
}
/** Minimal structural face of `ctx.sessionPersistence`. */
export interface SessionPersistenceLike {
    listSnapshots(): Promise<Array<{
        header: {
            id: string;
        };
        revision: string;
    }>>;
    inspect(id: string): Promise<{
        events: SessionEventLike[];
    }>;
}
/** Minimal structural face of a session event used by this aggregator. */
export interface SessionEventLike {
    type: string;
    seq?: number;
    time: number;
    data: {
        header?: {
            config?: {
                provider?: string;
                model?: string;
            };
        };
        usage?: {
            inputTokens?: number;
            outputTokens?: number;
            cacheReadTokens?: number;
            cacheWriteTokens?: number;
        };
    };
}
/**
 * Aggregate provider-reported token usage from live sessions and persisted
 * session logs, using a JSON file cache to skip already-read history.
 * @param persistence - the DSH session persistence service.
 * @param sessions - the DSH live session store.
 * @param cacheFile - absolute path to the JSON usage cache file.
 * @param startDate - inclusive GMT+8 start date, `YYYY-MM-DD`.
 * @param endDate - inclusive GMT+8 end date, `YYYY-MM-DD`.
 * @param granularity - `hour` for hourly buckets, `day` for daily buckets.
 * @returns model usage series grouped by provider/model.
 */
export declare function fetchSessionModelUsageSeries(persistence: SessionPersistenceLike, sessions: SessionsLike, cacheFile: string, startDate: string, endDate: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>;
