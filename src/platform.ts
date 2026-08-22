/**
 * DeepSeek Platform private API client. These endpoints back the official
 * usage dashboard and are the only source of exact cost/request/token data.
 * Authentication uses the web `userToken` (localStorage key `userToken`,
 * JSON `value` field), not an API key.
 * @module dsh-deepseek-usage/platform
 */

import type { ModelPriceRatio, ModelUsageResponse, ModelUsageSeries, PlatformSnapshot, PriceRatio } from './protocol.js'

const BASE = 'https://platform.deepseek.com'
const TZ_OFFSET_SECONDS = 28_800

/** Treat non-finite numbers as zero so NaN never poisons aggregates. */
function safeNumber(value: number | string | undefined): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

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
  modelUsage: Map<string, { requests: number; tokens: number; cacheHitTokens: number; cacheMissTokens: number }>
} {
  const modelUsage = new Map<string, { requests: number; tokens: number; cacheHitTokens: number; cacheMissTokens: number }>()
  let tokens = 0
  let requests = 0
  for (const series of amount.series ?? []) {
    const model = series.model ?? 'unknown'
    const entry = modelUsage.get(model) ?? { requests: 0, tokens: 0, cacheHitTokens: 0, cacheMissTokens: 0 }
    for (const bucket of series.buckets ?? []) {
      const usage = bucket.usage
      if (!usage) continue
      const bucketTokens = safeNumber(usage.RESPONSE_TOKEN)
        + safeNumber(usage.PROMPT_CACHE_HIT_TOKEN)
        + safeNumber(usage.PROMPT_CACHE_MISS_TOKEN)
      const bucketRequests = safeNumber(usage.REQUEST)
      entry.requests += bucketRequests
      entry.tokens += bucketTokens
      entry.cacheHitTokens += safeNumber(usage.PROMPT_CACHE_HIT_TOKEN)
      entry.cacheMissTokens += safeNumber(usage.PROMPT_CACHE_MISS_TOKEN)
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
        modelCost += safeNumber(bucket.cost)
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

/** Format a GMT+8 date string from an epoch second. */
function formatDate(epochSeconds: number): string {
  return new Date((epochSeconds + TZ_OFFSET_SECONDS) * 1000).toISOString().slice(0, 10)
}

/** List every GMT+8 calendar date in an inclusive range. */
function eachDay(startDate: string, endDate: string): string[] {
  const days: string[] = []
  let cursor = gmt8Start(startDate)
  const end = gmt8Start(endDate)
  while (cursor <= end) {
    days.push(formatDate(cursor))
    cursor += 86_400
  }
  return days
}

/**
 * Fetch per-model usage buckets for an inclusive date range. Hour mode queries
 * each calendar day separately so the platform returns hourly buckets even for
 * multi-day ranges; day mode queries the whole range at once.
 */
export async function fetchModelUsageSeries(
  token: string,
  startDate: string,
  endDate: string,
  granularity: 'hour' | 'day',
): Promise<ModelUsageResponse> {
  const start = gmt8Start(startDate)
  const end = gmt8Start(endDate) + 86_400
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('日期范围无效')
  }
  const days = (end - start) / 86_400
  if (days > 31) {
    throw new Error('日期范围不能超过 31 天')
  }

  const amountPayloads = granularity === 'hour'
    ? await Promise.all(eachDay(startDate, endDate).map(day => getPlatform<AmountPayload>(
      `/api/v0/usage/by_api_key/amount?start=${gmt8Start(day)}&end=${gmt8Start(day) + 86_400}&tz=${TZ_OFFSET_SECONDS}`,
      token,
    )))
    : [await getPlatform<AmountPayload>(
      `/api/v0/usage/by_api_key/amount?start=${start}&end=${end}&tz=${TZ_OFFSET_SECONDS}`,
      token,
    )]

  const bucketsByModel = new Map<string, Map<number, {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheWriteTokens: number
    tokens: number
    requests: number
    label: string
  }>>()

  const ingest = (amount: AmountPayload): void => {
    for (const series of amount.series ?? []) {
      const model = series.model ?? 'unknown'
      let buckets = bucketsByModel.get(model)
      if (!buckets) {
        buckets = new Map()
        bucketsByModel.set(model, buckets)
      }
      for (const bucket of series.buckets ?? []) {
        const time = bucket.time
        const usage = bucket.usage
        if (typeof time !== 'number' || !usage) continue
        const inputTokens = safeNumber(usage.PROMPT_CACHE_MISS_TOKEN)
        const outputTokens = safeNumber(usage.RESPONSE_TOKEN)
        const cacheReadTokens = safeNumber(usage.PROMPT_CACHE_HIT_TOKEN)
        const cacheWriteTokens = 0
        const tokens = inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens
        const requests = safeNumber(usage.REQUEST)
        const local = new Date((time + TZ_OFFSET_SECONDS) * 1000)
        const month = String(local.getUTCMonth() + 1).padStart(2, '0')
        const day = String(local.getUTCDate()).padStart(2, '0')
        const hour = String(local.getUTCHours()).padStart(2, '0')
        const key = granularity === 'hour'
          ? Math.floor((time + TZ_OFFSET_SECONDS) / 3600)
          : Math.floor((time + TZ_OFFSET_SECONDS) / 86_400)
        const label = granularity === 'hour' ? `${month}-${day} ${hour}:00` : `${month}-${day}`
        const entry = buckets.get(key) ?? {
          inputTokens: 0,
          outputTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          tokens: 0,
          requests: 0,
          label,
        }
        entry.inputTokens += inputTokens
        entry.outputTokens += outputTokens
        entry.cacheReadTokens += cacheReadTokens
        entry.cacheWriteTokens += cacheWriteTokens
        entry.tokens += tokens
        entry.requests += requests
        buckets.set(key, entry)
      }
    }
  }

  for (const payload of amountPayloads) ingest(payload)

  const series: ModelUsageSeries[] = []
  for (const [model, buckets] of bucketsByModel) {
    const points = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([key, value]) => ({
        timestamp: key * (granularity === 'hour' ? 3600 : 86_400) - TZ_OFFSET_SECONDS,
        label: value.label,
        tokens: value.tokens,
        inputTokens: value.inputTokens,
        outputTokens: value.outputTokens,
        cacheReadTokens: value.cacheReadTokens,
        cacheWriteTokens: value.cacheWriteTokens,
        requests: value.requests,
      }))
    series.push({ provider: 'deepseek', model, points })
  }

  series.sort((a, b) => {
    const totalA = a.points.reduce((sum, point) => sum + point.tokens, 0)
    const totalB = b.points.reduce((sum, point) => sum + point.tokens, 0)
    return totalB - totalA
  })

  return { start: startDate, end: endDate, granularity, series }
}

/** Build one model's R0 pair from historical/since/today aggregates. */
function buildModelRatio(
  model: string,
  historicalTokens: number,
  historicalCost: number,
  totalTokens: number,
  totalCost: number,
  todayTokens: number,
  todayCost: number,
): ModelPriceRatio {
  const a1 = historicalTokens > 0 ? historicalCost / historicalTokens : DEFAULT_A1
  const a2Total = totalTokens > 0 ? totalCost / totalTokens : null
  const r0Total = a2Total !== null ? a2Total / a1 : null
  const a2Today = todayTokens > 0 ? todayCost / todayTokens : null
  const r0Today = a2Today !== null ? a2Today / a1 : null
  return {
    model,
    has_history: historicalTokens > 0 && historicalCost > 0,
    used_total: totalTokens > 0,
    used_today: todayTokens > 0,
    a1,
    a2_total: a2Total,
    r0_total: r0Total,
    a2_today: a2Today,
    r0_today: r0Today,
  }
}

/** Build the R0 multipliers from historical, since-cutoff, and today averages. */
function buildPriceRatio(
  historicalTokens: number,
  historicalCost: number,
  totalTokens: number,
  totalCost: number,
  todayTokens: number,
  todayCost: number,
  models: ModelPriceRatio[],
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
    default_a1: DEFAULT_A1,
    models,
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

  const models = [...currentAmount.modelUsage.keys()].map(model => {
    const usage = currentAmount.modelUsage.get(model)
    return {
      model,
      requests: usage?.requests ?? 0,
      tokens: usage?.tokens ?? 0,
      cost: currentCost.modelCosts.get(model) ?? 0,
      cacheHitTokens: usage?.cacheHitTokens ?? 0,
      cacheMissTokens: usage?.cacheMissTokens ?? 0,
    }
  }).sort((a, b) => b.cost - a.cost || b.tokens - a.tokens)

  // 模型范围动态从平台返回的用量数据收集，开放平台新增模型（如视觉模型）无需改代码即自动纳入。
  const modelNames = new Set<string>(['deepseek-v4-flash', 'deepseek-v4-pro'])
  for (const mapName of [historyAmountAgg, sinceAmountAgg, currentAmount]) {
    for (const model of mapName.modelUsage.keys()) modelNames.add(model)
  }
  const modelRatios = [...modelNames].map(model => buildModelRatio(
    model,
    historyAmountAgg.modelUsage.get(model)?.tokens ?? 0,
    historyCostAgg.modelCosts.get(model) ?? 0,
    sinceAmountAgg.modelUsage.get(model)?.tokens ?? 0,
    sinceCostAgg.modelCosts.get(model) ?? 0,
    currentAmount.modelUsage.get(model)?.tokens ?? 0,
    currentCost.modelCosts.get(model) ?? 0,
  ))

  return {
    fetched_at: new Date().toISOString(),
    balance: {
      currency,
      balance,
      bonus_balance: bonusBalance,
      total_cost: totalCost,
    },
    // 累计用量：平台仅保留 2026-08-01 起的数据，history(8/1~cutoff) 与
    // since(cutoff~now) 无缝衔接相加即为 8/1 至今的总和。
    cumulative: {
      tokens: historyAmountAgg.tokens + sinceAmountAgg.tokens,
      requests: historyAmountAgg.requests + sinceAmountAgg.requests,
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
      modelRatios,
    ),
  }
}