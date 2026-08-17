/**
 * DeepSeek Platform private API client. These endpoints back the official
 * usage dashboard and are the only source of exact cost/request/token data.
 * Authentication uses the web `userToken` (localStorage key `userToken`,
 * JSON `value` field), not an API key.
 * @module dsh-deepseek-usage/platform
 */
const BASE = 'https://platform.deepseek.com';
const TZ_OFFSET_SECONDS = 28_800;
/** Common private-API headers. */
function headers(token) {
    return {
        authorization: `Bearer ${token}`,
        'x-app-version': '1.0.0',
        origin: 'https://platform.deepseek.com',
        referer: 'https://platform.deepseek.com/usage',
        accept: 'application/json',
    };
}
/** Fetch and unwrap one private endpoint. */
async function getPlatform(path, token) {
    const response = await fetch(`${BASE}${path}`, { headers: headers(token) });
    if (!response.ok) {
        throw new Error(`platform HTTP ${response.status}`);
    }
    const body = await response.json();
    if (body.code !== 0) {
        throw new Error(`platform code ${body.code}: ${body.msg ?? 'unknown error'}`);
    }
    if (body.data.biz_code !== undefined && body.data.biz_code !== 0) {
        throw new Error(`platform biz code ${body.data.biz_code}: ${body.data.biz_msg ?? 'unknown error'}`);
    }
    return body.data.biz_data;
}
/** Today's GMT+8 start/end second timestamps. */
export function todayRange() {
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    const start = Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000);
    return { start, end: start + 86_400 };
}
/**
 * Fetch exact balance, cumulative cost, and today's usage/cost from the
 * DeepSeek Platform private API.
 * @param token - platform web `userToken`.
 * @returns a fully platform-sourced snapshot.
 */
export async function fetchPlatformSnapshot(token) {
    const [summary, amount, cost] = await Promise.all([
        getPlatform('/api/v0/users/get_user_summary', token),
        getPlatform(`/api/v0/usage/by_api_key/amount?start=${todayRange().start}&end=${todayRange().end}&tz=${TZ_OFFSET_SECONDS}`, token),
        getPlatform(`/api/v0/usage/by_api_key/cost?start=${todayRange().start}&end=${todayRange().end}&tz=${TZ_OFFSET_SECONDS}`, token),
    ]);
    const wallets = summary.normal_wallets ?? [];
    const bonus = summary.bonus_wallets ?? [];
    const costs = summary.total_costs ?? [];
    const currency = wallets.find(w => w.currency === 'CNY')?.currency ?? wallets[0]?.currency ?? 'CNY';
    const balance = Number(wallets.find(w => w.currency === currency)?.balance ?? 0);
    const bonusBalance = Number(bonus.find(w => w.currency === currency)?.balance ?? 0);
    const totalCost = Number(costs.find(w => w.currency === currency)?.amount ?? 0);
    const modelUsage = new Map();
    for (const series of amount.series ?? []) {
        const model = series.model ?? 'unknown';
        const entry = modelUsage.get(model) ?? { requests: 0, tokens: 0 };
        for (const bucket of series.buckets ?? []) {
            const usage = bucket.usage;
            if (!usage)
                continue;
            entry.requests += usage.REQUEST ?? 0;
            entry.tokens += (usage.RESPONSE_TOKEN ?? 0)
                + (usage.PROMPT_CACHE_HIT_TOKEN ?? 0)
                + (usage.PROMPT_CACHE_MISS_TOKEN ?? 0);
        }
        modelUsage.set(model, entry);
    }
    const modelCosts = new Map();
    let todayCost = 0;
    for (const currencyGroup of cost.data ?? []) {
        if (currencyGroup.currency !== currency)
            continue;
        for (const series of currencyGroup.series ?? []) {
            const model = series.model ?? 'unknown';
            let modelCost = 0;
            for (const bucket of series.buckets ?? []) {
                modelCost += Number(bucket.cost ?? 0);
            }
            todayCost += modelCost;
            modelCosts.set(model, (modelCosts.get(model) ?? 0) + modelCost);
        }
    }
    const models = [...modelUsage.keys()].map(model => ({
        model,
        requests: modelUsage.get(model)?.requests ?? 0,
        tokens: modelUsage.get(model)?.tokens ?? 0,
        cost: modelCosts.get(model) ?? 0,
    })).sort((a, b) => b.cost - a.cost || b.tokens - a.tokens);
    const todayTokens = [...modelUsage.values()].reduce((sum, item) => sum + item.tokens, 0);
    const todayRequests = [...modelUsage.values()].reduce((sum, item) => sum + item.requests, 0);
    return {
        fetched_at: new Date().toISOString(),
        balance: {
            currency,
            balance,
            bonus_balance: bonusBalance,
            total_cost: totalCost,
        },
        today: {
            date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }),
            requests: todayRequests,
            tokens: todayTokens,
            cost: todayCost,
            models,
        },
    };
}
//# sourceMappingURL=platform.js.map