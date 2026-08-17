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

/** Full snapshot served by `/api/deepseek-usage/state`. */
export interface PlatformSnapshot {
  balance: PlatformBalance | null
  today: PlatformToday | null
  error?: string
  fetched_at: string
}

/** Backwards-compatible alias used by older consumers. */
export type UsageState = PlatformSnapshot
