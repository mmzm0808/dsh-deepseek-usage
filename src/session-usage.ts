/**
 * Local session-log usage aggregator. Reads the DSH session store and
 * persistence backend, then folds provider-reported `assistant/message` usage
 * into per-provider and per-model hourly/daily buckets. Extracted usage samples
 * are cached in a JSON file so already-read history loads quickly on later runs.
 * @module dsh-deepseek-usage/session-usage
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { ModelUsagePoint, ModelUsageResponse, ModelUsageSeries } from './protocol.js'

const TZ_OFFSET_SECONDS = 28_800
const INSPECT_TIMEOUT_MS = 5_000
const CONCURRENCY = 8
const CACHE_VERSION = 1

/** Minimal structural face of a live DSH session. */
export interface SessionLike {
  id: string
  events: SessionEventLike[]
}

/** Minimal structural face of `ctx.sessions`. */
export interface SessionsLike {
  list(): SessionLike[]
}

/** Minimal structural face of `ctx.sessionPersistence`. */
export interface SessionPersistenceLike {
  listSnapshots(): Promise<Array<{ header: { id: string }; revision: string }>>
  inspect(id: string): Promise<{ events: SessionEventLike[] }>
}

/** Minimal structural face of a session event used by this aggregator. */
export interface SessionEventLike {
  type: string
  seq?: number
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
}

/** One extracted provider usage sample. */
interface UsageSample {
  /** Bucket start epoch seconds (UTC). */
  t: number
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  requests: number
}

/** Cached extraction state for one session. */
interface SessionCacheEntry {
  /** Persistence revision last folded for a non-live session. */
  revision?: string
  /** Highest event seq already folded. */
  lastSeq: number
  samples: UsageSample[]
}

interface UsageCacheFile {
  version: typeof CACHE_VERSION
  sessions: Record<string, SessionCacheEntry>
}

/** GMT+8 midnight epoch seconds for a YYYY-MM-DD date. */
function gmt8Start(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000)
}

/** Wait for a promise but resolve `undefined` after a timeout. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<undefined>(resolve => {
        timer = setTimeout(() => resolve(undefined), ms)
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

async function loadUsageCache(file: string): Promise<UsageCacheFile> {
  try {
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw) as UsageCacheFile
    if (parsed.version !== CACHE_VERSION || typeof parsed.sessions !== 'object' || parsed.sessions === null) {
      return { version: CACHE_VERSION, sessions: {} }
    }
    return { version: CACHE_VERSION, sessions: parsed.sessions }
  } catch {
    return { version: CACHE_VERSION, sessions: {} }
  }
}

async function saveUsageCache(file: string, cache: UsageCacheFile): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
  const temp = `${file}.${Date.now()}.tmp`
  await writeFile(temp, JSON.stringify(cache))
  await rename(temp, file)
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

/** Fold one usage sample into the provider/model bucket map for the requested range. */
function foldSample(
  sample: UsageSample,
  byProviderModel: Map<string, ModelAggregate>,
  start: number,
  end: number,
  granularity: 'hour' | 'day',
): void {
  if (sample.t < start || sample.t >= end) return
  const key = granularity === 'hour'
    ? Math.floor((sample.t + TZ_OFFSET_SECONDS) / 3600)
    : Math.floor((sample.t + TZ_OFFSET_SECONDS) / 86_400)

  const aggregateKey = `${sample.provider}\u0000${sample.model}`
  let aggregate = byProviderModel.get(aggregateKey)
  if (!aggregate) {
    aggregate = { provider: sample.provider, model: sample.model, buckets: new Map() }
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

  bucket.inputTokens += sample.inputTokens
  bucket.outputTokens += sample.outputTokens
  bucket.cacheReadTokens += sample.cacheReadTokens
  bucket.cacheWriteTokens += sample.cacheWriteTokens
  bucket.tokens += sample.inputTokens + sample.outputTokens + sample.cacheReadTokens + sample.cacheWriteTokens
  bucket.requests += sample.requests
}

/** Fold session events after `afterSeq` into new samples and aggregate buckets. */
function foldSessionEvents(
  events: SessionEventLike[],
  byProviderModel: Map<string, ModelAggregate>,
  newSamples: UsageSample[],
  afterSeq: number,
  start: number,
  end: number,
  granularity: 'hour' | 'day',
): void {
  let currentProvider: string | undefined
  let currentModel: string | undefined
  for (const event of events) {
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
    const seq = event.seq ?? -1
    if (seq <= afterSeq) continue

    const sample: UsageSample = {
      t: Math.floor(event.time / 1000),
      provider: currentProvider,
      model: currentModel,
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      cacheReadTokens: usage.cacheReadTokens ?? 0,
      cacheWriteTokens: usage.cacheWriteTokens ?? 0,
      requests: 1,
    }
    newSamples.push(sample)
    foldSample(sample, byProviderModel, start, end, granularity)
  }
}

/** Build the final provider/model series from the aggregate map. */
function buildSeries(byProviderModel: Map<string, ModelAggregate>): ModelUsageSeries[] {
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

  return series
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
export async function fetchSessionModelUsageSeries(
  persistence: SessionPersistenceLike,
  sessions: SessionsLike,
  cacheFile: string,
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

  const cache = await loadUsageCache(cacheFile)
  const byProviderModel = new Map<string, ModelAggregate>()

  // Cached samples are already extracted history; fold them into this request.
  for (const entry of Object.values(cache.sessions)) {
    for (const sample of entry.samples) {
      foldSample(sample, byProviderModel, start, end, granularity)
    }
  }

  let cacheDirty = false

  // Live sessions: fold only events not yet cached.
  const liveSessions = sessions.list()
  const liveIds = new Set<string>()
  for (const session of liveSessions) {
    liveIds.add(session.id)
    const entry = cache.sessions[session.id] ?? { lastSeq: -1, samples: [] }
    const newSamples: UsageSample[] = []
    foldSessionEvents(session.events, byProviderModel, newSamples, entry.lastSeq, start, end, granularity)
    if (newSamples.length > 0) {
      entry.samples.push(...newSamples)
      cacheDirty = true
    }
    const lastSeq = session.events.reduce((max, event) => Math.max(max, event.seq ?? -1), -1)
    if (lastSeq > entry.lastSeq) {
      entry.lastSeq = lastSeq
      cacheDirty = true
    }
    cache.sessions[session.id] = entry
  }

  // Persisted non-live sessions: skip when the stored revision is unchanged.
  const snapshots = await persistence.listSnapshots()
  const pending = snapshots.filter(snapshot => !liveIds.has(snapshot.header.id))
  let cursor = 0
  const workerCount = Math.min(CONCURRENCY, pending.length)
  const workers = Array.from({ length: workerCount }, async () => {
    for (;;) {
      const index = cursor
      cursor += 1
      if (index >= pending.length) return
      const snapshot = pending[index]!
      const id = snapshot.header.id
      const entry = cache.sessions[id]
      if (entry && entry.revision === snapshot.revision) continue

      try {
        const inspection = await withTimeout(persistence.inspect(id), INSPECT_TIMEOUT_MS)
        if (!inspection) continue
        const nextEntry = entry ?? { lastSeq: -1, samples: [] }
        const newSamples: UsageSample[] = []
        foldSessionEvents(inspection.events, byProviderModel, newSamples, nextEntry.lastSeq, start, end, granularity)
        if (newSamples.length > 0) {
          nextEntry.samples.push(...newSamples)
        }
        const lastSeq = inspection.events.reduce((max, event) => Math.max(max, event.seq ?? -1), -1)
        nextEntry.lastSeq = Math.max(nextEntry.lastSeq, lastSeq)
        nextEntry.revision = snapshot.revision
        cache.sessions[id] = nextEntry
        cacheDirty = true
      } catch {
        // A corrupt or unreadable session must not break the whole trend page.
      }
    }
  })
  await Promise.all(workers)

  if (cacheDirty) {
    await saveUsageCache(cacheFile, cache)
  }

  return {
    start: startDate,
    end: endDate,
    granularity,
    series: buildSeries(byProviderModel),
  }
}
