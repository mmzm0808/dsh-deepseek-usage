/**
 * Shared wire/state types for dsh-deepseek-usage. The client consumes only
 * platform-sourced values; no local pricing estimate crosses this boundary.
 * @module dsh-deepseek-usage/protocol
 */

/** Exact account summary from the DeepSeek Platform. */
export interface PlatformBalance {
  currency: string
  /** Recharge (topped-up) balance. */
  balance: number
  /** Granted/bonus balance. */
  bonus_balance: number
  /** Historical cumulative consumption. */
  total_cost: number
}

/** One model's exact today row from the Platform usage API. */
export interface PlatformModelUsage {
  model: string
  requests: number
  tokens: number
  cost: number
}

/** Exact today summary from the Platform usage API. */
export interface PlatformToday {
  date: string
  requests: number
  tokens: number
  cost: number
  models: PlatformModelUsage[]
}

/** Per-model real-time price multiplier vs historical average. */
export interface ModelPriceRatio {
  model: string
  /** Whether this model had pre-cutoff usage. */
  has_history: boolean
  /** Whether this model had any usage from cutoff onward. */
  used_total: boolean
  /** Whether this model had usage today. */
  used_today: boolean
  /** Historical average cost per token (or default when no history). */
  a1: number
  /** Average cost per token from cutoff onward. */
  a2_total: number | null
  /** Total multiplier since cutoff. */
  r0_total: number | null
  /** Average cost per token today. */
  a2_today: number | null
  /** Today's multiplier. */
  r0_today: number | null
}

/** Real-time price multiplier vs historical average. */
export interface PriceRatio {
  /** Whether any pre-cutoff historical data exists. */
  has_history: boolean
  /** Historical average cost per token (before cutoff), or the default when no history exists. */
  a1: number
  /** Average cost per token from cutoff onward (total). */
  a2_total: number | null
  /** Total multiplier since cutoff: a2_total / a1. */
  r0_total: number | null
  /** Average cost per token today. */
  a2_today: number | null
  /** Today's multiplier: a2_today / a1. */
  r0_today: number | null
  /** Default A1 used when no history exists. */
  default_a1: number
  /** Per-model breakdown for flash and pro. */
  models: ModelPriceRatio[]
  /** Cutoff date used in the calculation. */
  cutoff: string
}

/** Full snapshot served by `/api/deepseek-usage/state`. */
export interface PlatformSnapshot {
  balance: PlatformBalance | null
  today: PlatformToday | null
  price_ratio: PriceRatio | null
  /** Cumulative API usage since the platform retains history (2026-08-01). */
  cumulative?: { tokens: number; requests: number } | null
  error?: string
  fetched_at: string
}

/** One point in a model usage trend series. */
export interface ModelUsagePoint {
  /** Human-readable bucket label, e.g. `08-17 14:00` or `08-17`. */
  label: string
  /** Bucket start epoch seconds (UTC). */
  timestamp: number
  /** Total tokens consumed in the bucket (uncached input + cache write + cache read + output). */
  tokens: number
  /** Uncached input tokens. */
  inputTokens: number
  /** Output tokens. */
  outputTokens: number
  /** Cache-read (cache hit) tokens. */
  cacheReadTokens: number
  /** Cache-write tokens. */
  cacheWriteTokens: number
  /** API requests in the bucket. */
  requests: number
}

/** One model's usage trend series. */
export interface ModelUsageSeries {
  /** Display provider group the model belongs to (vision-toolkit-X is normalized to X). */
  provider: string
  /** Original provider/source when merged into a display group. */
  source?: string
  model: string
  points: ModelUsagePoint[]
}

/** Response served by `/api/deepseek-usage/model-usage`. */
export interface ModelUsageResponse {
  start: string
  end: string
  granularity: 'hour' | 'day'
  series: ModelUsageSeries[]
  error?: string
}

/** Backwards-compatible alias used by older consumers. */
export type UsageState = PlatformSnapshot
