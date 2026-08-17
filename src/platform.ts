/**
 * DeepSeek Platform private API client. These endpoints back the official
 * usage dashboard and are the only source of exact cost/request/token data.
 * Authentication uses the web `userToken` (localStorage key `userToken`,
 * JSON `value` field), not an API key.
 * @module dsh-deepseek-usage/platform
 */

import type { PlatformSnapshot, PriceRatio } from './protocol.js'

const BASE = 'https://platform.deepseek.com'
const TZ_OFFSET_SECONDS = 28_800

/** GMT+8 midnight second timestamp for a date string. */
function gmt8Start(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000)
}

/** History before the 2026-08-17 price period (platform API retains from 2026-08-01). */
const HISTORY_START = gmt8Start('2026-08-01')
const CUTOFF_DATE = '2026-08-17'
const CUTOFF_START = gmt8Start(CUTOFF_DATE)

/** Default historical average cost per token when no pre-cutoff data exists. */
const DEFAULT_A1 = 0.00000005

/** Common private-API headers. */
function headers(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    'x-app-version': '1.0.0',
    origin: 'https://platform.deepseek.com',
    referer: 'https://platform.deepseek.com/usage',
    accept: 'application/json',
  }
}

/** Envelope returned by every platform private endpoint. */
interface PlatformEnvelope<T> {
  code: number
  msg?: string
  data: {
    biz_code?: number
    biz_msg?: string
    biz_data: T
  }
}

/** Fetch and unwrap one private endpoint. */
async function getPlatform<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, { headers: headers(token) })
  if (!response.ok) {
    throw new Error(`platform HTTP ${response.status}`)
  }
  const body = await response.json() as PlatformEnvelope<T>
  if (body.code !== 0) {
    throw new Error(`platform code ${body.code}: ${body.msg ?? 'unknown error'}`)
  }
  if (body.data.biz_code !== undefined && body.data.biz_code !== 0) {
    throw new Error(`platform biz code ${body.data.biz_code}: ${body.data.biz_msg ?? 'unknown error'}`)
  }
  return body.data.biz_data
}

/** Summary payload from `/api/v0/users/get_user_summary`. */
interface UserSummary {
  normal_wallets?: Array<{ currency: string; balance: string }>
  bonus_wallets?: Array<{ currency: string; balance: string }>
  total_costs?: Array<{ currency: string; amount: string }>
}

/** One amount bucket's usage counters. */
interface AmountUsage {
  RESPONSE_TOKEN?: number
  REQUEST?: number
  PROMPT_CACHE_HIT_TOKEN?: number
  PROMPT_CACHE_MISS_TOKEN?: number
}

/** Amount payload from `/api/v0/usage/by_api_key/amount`. */
interface AmountPayload {
  series?: Array<{
    api_key?: { tracking_id?: string; name?: string; sensitive_id?: string; valid?: boolean }
    model?: string
    buckets?: Array<{ time?: number; usage?: AmountUsage }>
  }>
}

/** One currency group inside the cost payload. */
interface CostCurrencyGroup {
  currency?: string
  series?: Array<{
    api_key?: { tracking_id?: string; name?: string; sensitive_id?: string; valid?: boolean }
    model?: string
    buckets?: Array<{ time?: number; cost?: string | number }>
  }>
}

/** Cost payload from `/api/v0/usage/by_api_key/cost`. */
interface CostPayload {
  data?: CostCurrencyGroup[]
}

/** Aggregate an amount payload across all API keys/models. */
function aggregateAmount(amount: AmountPayload): {
  tokens: number
  requests: number
  modelUsage: Map<string, { requests: number; tokens: number }>
} {
  const modelUsage = new Map<string, { requests: number; tokens: number }>()
  let tokens = 0
  let requests = 0
  for (const series of amount.series ?? []) {
    const model = series.model ?? 'unknown'
    const entry = modelUsage.get(model) ?? { requests: 0, tokens: 0 }
    for (const bucket of series.buckets ?? []) {
      const usage = bucket.usage
      if (!usage) continue
      const bucketTokens = (usage.RESPONSE_TOKEN ?? 0)
        + (usage.PROMPT_CACHE_HIT_TOKEN ?? 0)
        + (usage.PROMPT_CACHE_MISS_TOKEN ?? 0)
      const bucketRequests = usage.REQUEST ?? 0
      entry.requests += bucketRequests
      entry.tokens += bucketTokens
      tokens += bucketTokens
      requests += bucketRequests
    }
    modelUsage.set(model, entry)
  }
  return { tokens, requests, modelUsage }
}

/** Aggregate a cost payload for one currency. */
function aggregateCost(cost: CostPayload, currency: string): {
  total: number
  modelCosts: Map<string, number>
} {
  const modelCosts = new Map<string, number>()
  let total = 0
  for (const currencyGroup of cost.data ?? []) {
    if (currencyGroup.currency !== currency) continue
    for (const series of currencyGroup.series ?? []) {
      const model = series.model ?? 'unknown'
      let modelCost = 0
      for (const bucket of series.buckets ?? []) {
        modelCost += Number(bucket.cost ?? 0)
      }
      total += modelCost
      modelCosts.set(model, (modelCosts.get(model) ?? 0) + modelCost)
    }
  }
  return { total, modelCosts }
}

/** Today's GMT+8 start/end second timestamps. */
export function todayRange(): { start: number; end: number } {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
  const start = gmt8Start(date)
  return { start, end: start + 86_400 }
}

/** Build the R0 multipliers from historical, since-cutoff, and today averages. */
function buildPriceRatio(
  historicalTokens: number,
  historicalCost: number,
  totalTokens: number,
  totalCost: number,
  todayTokens: number,
  todayCost: number,
): PriceRatio {
  const a1 = historicalTokens > 0 ? historicalCost / historicalTokens : DEFAULT_A1
  const a2Total = totalTokens > 0 ? totalCost / totalTokens : null
  const r0Total = a2Total !== null ? a2Total / a1 : null
  const a2Today = todayTokens > 0 ? todayCost / todayTokens : null
  const r0Today = a2Today !== null ? a2Today / a1 : null
  return {
    has_history: historicalTokens > 0 && historicalCost > 0,
    a1,
    a2_total: a2Total,
    r0_total: r0Total,
    a2_today: a2Today,
    r0_today: r0Today,
    cutoff: CUTOFF_DATE,
  }
}

/**
 * Fetch exact balance, cumulative cost, today's usage/cost, and the R0 price
 * multiplier from the DeepSeek Platform private API.
 * @param token - platform web `userToken`.
 * @returns a fully platform-sourced snapshot.
 */
export async function fetchPlatformSnapshot(token: string): Promise<PlatformSnapshot> {
  const current = todayRange()
  const historyEnd = CUTOFF_START

  const [summary, todayAmount, todayCost, sinceAmount, sinceCost, historyAmount, historyCost] = await Promise.all([
    getPlatform<UserSummary>('/api/v0/users/get_user_summary', token),
    getPlatform<AmountPayload>(`/api/v0/usage/by_api_key/amount?start=${current.start}&end=${current.end}&tz=${TZ_OFFSET_SECONDS}`, token),
    getPlatform<CostPayload>(`/api/v0/usage/by_api_key/cost?start=${current.start}&end=${current.end}&tz=${TZ_OFFSET_SECONDS}`, token),
    getPlatform<AmountPayload>(`/api/v0/usage/by_api_key/amount?start=${CUTOFF_START}&end=${current.end}&tz=${TZ_OFFSET_SECONDS}`, token),
    getPlatform<CostPayload>(`/api/v0/usage/by_api_key/cost?start=${CUTOFF_START}&end=${current.end}&tz=${TZ_OFFSET_SECONDS}`, token),
    getPlatform<AmountPayload>(`/api/v0/usage/by_api_key/amount?start=${HISTORY_START}&end=${historyEnd}&tz=${TZ_OFFSET_SECONDS}`, token),
    getPlatform<CostPayload>(`/api/v0/usage/by_api_key/cost?start=${HISTORY_START}&end=${historyEnd}&tz=${TZ_OFFSET_SECONDS}`, token),
  ])

  const wallets = summary.normal_wallets ?? []
  const bonus = summary.bonus_wallets ?? []
  const costs = summary.total_costs ?? []
  const currency = wallets.find(w => w.currency === 'CNY')?.currency ?? wallets[0]?.currency ?? 'CNY'
  const balance = Number(wallets.find(w => w.currency === currency)?.balance ?? 0)
  const bonusBalance = Number(bonus.find(w => w.currency === currency)?.balance ?? 0)
  const totalCost = Number(costs.find(w => w.currency === currency)?.amount ?? 0)

  const currentAmount = aggregateAmount(todayAmount)
  const currentCost = aggregateCost(todayCost, currency)
  const sinceAmountAgg = aggregateAmount(sinceAmount)
  const sinceCostAgg = aggregateCost(sinceCost, currency)
  const historyAmountAgg = aggregateAmount(historyAmount)
  const historyCostAgg = aggregateCost(historyCost, currency)

  const models = [...currentAmount.modelUsage.keys()].map(model => ({
    model,
    requests: currentAmount.modelUsage.get(model)?.requests ?? 0,
    tokens: currentAmount.modelUsage.get(model)?.tokens ?? 0,
    cost: currentCost.modelCosts.get(model) ?? 0,
  })).sort((a, b) => b.cost - a.cost || b.tokens - a.tokens)

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
      requests: currentAmount.requests,
      tokens: currentAmount.tokens,
      cost: currentCost.total,
      models,
    },
    price_ratio: buildPriceRatio(
      historyAmountAgg.tokens,
      historyCostAgg.total,
      sinceAmountAgg.tokens,
      sinceCostAgg.total,
      currentAmount.tokens,
      currentCost.total,
    ),
  }
}