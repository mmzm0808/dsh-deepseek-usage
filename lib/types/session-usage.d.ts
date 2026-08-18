/**
 * Local session-log usage aggregator. Reads the DSH session persistence store
 * and folds provider-reported `assistant/message` usage into per-provider and
 * per-model hourly/daily buckets. This covers every configured provider, not
 * just the DeepSeek official API.
 * @module dsh-deepseek-usage/session-usage
 */
import type { ModelUsageResponse } from './protocol.js';
/** Minimal structural face of `ctx.sessionPersistence`. */
export interface SessionPersistenceLike {
    list(): Promise<Array<{
        id: string;
    }>>;
    inspect(id: string): Promise<{
        events: Array<{
            type: string;
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
        }>;
    }>;
}
/**
 * Aggregate provider-reported token usage from all persisted sessions.
 * @param persistence - the DSH session persistence service.
 * @param startDate - inclusive GMT+8 start date, `YYYY-MM-DD`.
 * @param endDate - inclusive GMT+8 end date, `YYYY-MM-DD`.
 * @param granularity - `hour` for hourly buckets, `day` for daily buckets.
 * @returns model usage series grouped by provider/model.
 */
export declare function fetchSessionModelUsageSeries(persistence: SessionPersistenceLike, startDate: string, endDate: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>;
