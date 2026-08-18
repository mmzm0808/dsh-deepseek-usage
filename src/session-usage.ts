/**
 * Local session-log usage aggregator. Reads the DSH session persistence store
 * and folds provider-reported `assistant/message` usage into per-provider and
 * per-model hourly/daily buckets. This covers every configured provider, not
 * just the DeepSeek official API.
 * @module dsh-deepseek-usage/session-usage
 */

import type { ModelUsagePoint, ModelUsageResponse, ModelUsageSeries } from './protocol.js'

const TZ_OFFSET_SECONDS = 28_800

/** Minimal structural face of `ctx.sessionPersistence`. */
export interface SessionPersistenceLike {
  list(): Promise<Array<{ id: string }>>
  inspect(id: string): Promise<{
    events: Array<{
      type: string
      time: number
      data: {
        header?: { config?: { provider?: string; model?: string } }
        usage?: {
          inputTokens?: number
          outputTokens?: number
          cacheReadTokens?: number
          cacheWriteTokens?: number
        }
      }
    }>
  }>
}

/** GMT+8 midnight epoch seconds for a YYYY-MM-DD date. */
function gmt8Start(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000)
}

/** List every GMT+8 calendar date in an inclusive range. */
function eachDate(startDate: string, endDate: string): string[] {
  const days: string[] = []
  let cursor = gmt8Start(startDate)
  const end = gmt8Start(endDate)
  while (cursor <= end) {
    days.push(new Date((cursor + TZ_OFFSET_SECONDS) * 1000).toISOString().slice(0, 10))
    cursor += 86_400
  }
  return days
}

interface Bucket extends ModelUsagePoint {
  label: string
}

interface ModelAggregate {
  provider: string
  model: string
  buckets: Map<number, Bucket>
}

/** Build an empty bucket for an expected timestamp/label. */
function emptyBucket(timestamp: number, label: string): Bucket {
  return {
    timestamp,
    label,
    tokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    requests: 0,
  }
}

/**
 * Aggregate provider-reported token usage from all persisted sessions.
 * @param persistence - the DSH session persistence service.
 * @param startDate - inclusive GMT+8 start date, `YYYY-MM-DD`.
 * @param endDate - inclusive GMT+8 end date, `YYYY-MM-DD`.
 * @param granularity - `hour` for hourly buckets, `day` for daily buckets.
 * @returns model usage series grouped by provider/model.
 */
export async function fetchSessionModelUsageSeries(
  persistence: SessionPersistenceLike,
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

  const byProviderModel = new Map<string, ModelAggregate>()
  const headers = await persistence.list()

  for (const header of headers) {
    let inspection: Awaited<ReturnType<SessionPersistenceLike['inspect']>>
    try {
      inspection = await persistence.inspect(header.id)
    } catch {
      // A corrupt or unreadable session must not break the whole trend page.
      continue
    }

    let currentProvider: string | undefined
    let currentModel: string | undefined
    for (const event of inspection.events) {
      if (event.type === 'request/header') {
        const config = event.data.header?.config
        currentProvider = config?.provider
        currentModel = config?.model
        continue
      }
      if (event.type !== 'assistant/message') continue
      const usage = event.data.usage
      if (!usage) continue
      if (!currentProvider || !currentModel) continue

      const timeSeconds = Math.floor(event.time / 1000)
      if (timeSeconds < start || timeSeconds >= end) continue

      const key = granularity === 'hour'
        ? Math.floor((timeSeconds + TZ_OFFSET_SECONDS) / 3600)
        : Math.floor((timeSeconds + TZ_OFFSET_SECONDS) / 86_400)

      const aggregateKey = `${currentProvider}\u0000${currentModel}`
      let aggregate = byProviderModel.get(aggregateKey)
      if (!aggregate) {
        aggregate = { provider: currentProvider, model: currentModel, buckets: new Map() }
        byProviderModel.set(aggregateKey, aggregate)
      }

      let bucket = aggregate.buckets.get(key)
      if (!bucket) {
        const local = new Date((key * (granularity === 'hour' ? 3600 : 86_400) - TZ_OFFSET_SECONDS) * 1000)
        const month = String(local.getUTCMonth() + 1).padStart(2, '0')
        const day = String(local.getUTCDate()).padStart(2, '0')
        const hour = String(local.getUTCHours()).padStart(2, '0')
        const label = granularity === 'hour' ? `${month}-${day} ${hour}:00` : `${month}-${day}`
        bucket = emptyBucket(key * (granularity === 'hour' ? 3600 : 86_400) - TZ_OFFSET_SECONDS, label)
        aggregate.buckets.set(key, bucket)
      }

      const inputTokens = usage.inputTokens ?? 0
      const outputTokens = usage.outputTokens ?? 0
      const cacheReadTokens = usage.cacheReadTokens ?? 0
      const cacheWriteTokens = usage.cacheWriteTokens ?? 0
      bucket.inputTokens += inputTokens
      bucket.outputTokens += outputTokens
      bucket.cacheReadTokens += cacheReadTokens
      bucket.cacheWriteTokens += cacheWriteTokens
      bucket.tokens += inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens
      bucket.requests += 1
    }
  }

  const series: ModelUsageSeries[] = []
  for (const aggregate of byProviderModel.values()) {
    const points = [...aggregate.buckets.values()]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ label, timestamp, tokens, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, requests }) => ({
        label,
        timestamp,
        tokens,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheWriteTokens,
        requests,
      }))
    const totalTokens = points.reduce((sum, point) => sum + point.tokens, 0)
    if (totalTokens <= 0) continue
    series.push({ provider: aggregate.provider, model: aggregate.model, points })
  }

  series.sort((a, b) => {
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider)
    const totalA = a.points.reduce((sum, point) => sum + point.tokens, 0)
    const totalB = b.points.reduce((sum, point) => sum + point.tokens, 0)
    return totalB - totalA
  })

  return { start: startDate, end: endDate, granularity, series }
}
