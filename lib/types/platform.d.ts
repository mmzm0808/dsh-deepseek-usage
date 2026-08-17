/**
 * DeepSeek Platform private API client. These endpoints back the official
 * usage dashboard and are the only source of exact cost/request/token data.
 * Authentication uses the web `userToken` (localStorage key `userToken`,
 * JSON `value` field), not an API key.
 * @module dsh-deepseek-usage/platform
 */
import type { PlatformSnapshot } from './protocol.js';
/** Today's GMT+8 start/end second timestamps. */
export declare function todayRange(): {
    start: number;
    end: number;
};
/**
 * Fetch exact balance, cumulative cost, today's usage/cost, and the R0 price
 * multiplier from the DeepSeek Platform private API.
 * @param token - platform web `userToken`.
 * @returns a fully platform-sourced snapshot.
 */
export declare function fetchPlatformSnapshot(token: string): Promise<PlatformSnapshot>;
