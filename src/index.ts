/**
 * dsh-deepseek-usage — host half. Pulls exact balance, cumulative cost, and
 * today's usage/cost from the DeepSeek Platform private API (the same source
 * as the official usage dashboard) and exposes them through loopback HTTP
 * routes for the browser floating widget. No local pricing is used.
 * @module dsh-deepseek-usage
 */

import type { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import {
  closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import z from 'schemastery'
import { closePlatformLogin, readPlatformTokenFromBrowser, startPlatformLogin } from './login.js'
import { fetchModelUsageSeries, fetchPlatformSnapshot } from './platform.js'
import type { ModelUsageResponse, PlatformSnapshot } from './protocol.js'
import { makeUsageRoutes } from './routes.js'
import { fetchSessionModelUsageSeries, type SessionPersistenceLike, type SessionsLike } from './session-usage.js'

/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export const name = 'deepseek-usage'

/** Services required before routes can mount. */
export const inject = ['webServer', 'sessions', 'sessionPersistence']

/** Plugin config. */
export interface Config {
  /** Balance/usage refresh interval in milliseconds. */
  refreshIntervalMs: number
  /** DeepSeek Platform web `userToken`; only a configuration item, never embedded in plugin code. */
  platformUserToken: string
}

export const Config: z<Config> = z.object({
  refreshIntervalMs: z.number().min(5000).default(10_000),
  platformUserToken: z.string().default(''),
})

type AppContext = Context & {
  webServer: WebServer
  sessions: SessionsLike
  sessionPersistence: SessionPersistenceLike
}

/** Minimal face of the Desktop profile service; only used when present. */
interface DesktopProfilesLike {
  current: { name: string; dir: string }
}

/** Default DSH home directory. */
function defaultDshHome(): string {
  return process.env.DSH_HOME ?? join(homedir(), '.dsh')
}

/** DSH 应用版本号（client 端显示在侧边栏 brand 下方）。 */
const dshVersion = (() => {
  if (typeof process.env.DSH_VERSION === 'string' && process.env.DSH_VERSION.length > 0) {
    return process.env.DSH_VERSION
  }
  const req = createRequire(import.meta.url)
  // DSH 仓库结构：<root>/vendor/cordis/package.json —— 由 cordis 的解析位置
  // 反推仓库根，读 apps/web 的应用版本（与 client 构建同步）。
  try {
    const cordisPath = req.resolve('@deepseek-ai/cordis/package.json')
    const root = join(dirname(cordisPath), '..', '..')
    const webPkgPath = join(root, 'apps', 'web', 'package.json')
    if (existsSync(webPkgPath)) {
      const parsed = JSON.parse(readFileSync(webPkgPath, 'utf8')) as { version?: unknown }
      if (typeof parsed.version === 'string' && parsed.version.length > 0) return parsed.version
    }
  } catch {
    // 非 vendor 布局（pnpm 等）时走下一回退。
  }
  try {
    const runtimePath = req.resolve('@deepseek-ai/dsh-client-runtime/package.json')
    const parsed = JSON.parse(readFileSync(runtimePath, 'utf8')) as { version?: unknown }
    if (typeof parsed.version === 'string' && parsed.version.length > 0) return parsed.version
  } catch {
    // 宿主未暴露 runtime 包时返回占位。
  }
  return 'unknown'
})()

/** Resolve plugin data directory: Desktop profile dir when available, otherwise DSH home. */
function resolveDataDir(ctx: AppContext): string {
  const desktop = (ctx as unknown as { get?: (key: string) => unknown }).get?.('desktopProfiles') as DesktopProfilesLike | undefined
  const dir = desktop?.current?.dir
  return typeof dir === 'string' && dir.length > 0 ? dir : defaultDshHome()
}

/** Plugin config file path under a data directory. */
function pluginConfigPath(dataDir = defaultDshHome()): string {
  return join(dataDir, 'dsh-deepseek-usage', 'config.json')
}

/** JSON cache file for extracted local model usage history. */
function modelUsageCachePath(dataDir = defaultDshHome()): string {
  return join(dataDir, 'dsh-deepseek-usage', 'model-usage-cache.json')
}

/** Candidate cordis.patch.yml files that may hold the token. */
function profilePatchCandidates(dataDir: string): string[] {
  const home = defaultDshHome()
  if (dataDir === home) return [join(home, 'profiles', 'web', 'cordis.patch.yml')]
  return [join(dataDir, 'cordis.patch.yml'), join(home, 'profiles', 'web', 'cordis.patch.yml')]
}

/** Read `platformUserToken` from the plugin config file (user-owned config item). */
function readTokenFromConfigFile(dataDir = defaultDshHome()): string | undefined {
  const file = pluginConfigPath(dataDir)
  if (!existsSync(file)) return undefined
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { platformUserToken?: unknown }
    return typeof parsed.platformUserToken === 'string' ? parsed.platformUserToken : undefined
  } catch {
    return undefined
  }
}

/** Read `platformUserToken` from the active profile's cordis.patch.yml config item. */
function readTokenFromProfileConfig(dataDir = defaultDshHome()): string | undefined {
  for (const file of profilePatchCandidates(dataDir)) {
    if (!existsSync(file)) continue
    try {
      const text = readFileSync(file, 'utf8')
      const match = text.match(/platformUserToken:\s*['"]([^'"]+)['"]/)
      if (match?.[1]) return match[1]
    } catch {
      // A corrupt patch must not block login resolution.
    }
  }
  return undefined
}

/** Persist the platform userToken as a user config item. */
function saveTokenToConfigFile(dataDir: string, token: string): void {
  const file = pluginConfigPath(dataDir)
  mkdirSync(join(file, '..'), { recursive: true })
  const payload = JSON.stringify({ platformUserToken: token }, null, 2)
  const temp = file + '.tmp'
  const fd = openSync(temp, 'w')
  try {
    writeFileSync(fd, payload)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(temp, file)
}

/** Resolve the platform userToken from plugin config, env, profile config, then plugin config file. */
function resolveUserToken(config: Config, dataDir = defaultDshHome()): string | undefined {
  return config.platformUserToken
    || process.env.DEEPSEEK_PLATFORM_USER_TOKEN
    || readTokenFromProfileConfig(dataDir)
    || readTokenFromConfigFile(dataDir)
}

/** Remove stored userToken from plugin config files and profile patches. */
function clearStoredToken(dataDir = defaultDshHome()): void {
  for (const dir of new Set([dataDir, defaultDshHome()])) {
    const configFile = pluginConfigPath(dir)
    if (existsSync(configFile)) rmSync(configFile, { force: true })
  }

  for (const patchFile of profilePatchCandidates(dataDir)) {
    if (!existsSync(patchFile)) continue
    const text = readFileSync(patchFile, 'utf8')
    const cleaned = text.replace(/# dsh-deepseek-usage[\s\S]*?platformUserToken:\s*'[^']*'\n?/, '')
    if (cleaned !== text) writeFileSync(patchFile, cleaned)
  }
}

/** Register the plugin. */
export function apply(ctx: AppContext, config: Config): void {
  const dataDir = resolveDataDir(ctx)
  const token = resolveUserToken(config, dataDir)
  let snapshot: PlatformSnapshot = token === undefined
    ? { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() }
    : { balance: null, today: null, price_ratio: null, fetched_at: new Date().toISOString() }

  const getState = (): PlatformSnapshot => snapshot

  const refresh = async (): Promise<PlatformSnapshot> => {
    const current = resolveUserToken(config, dataDir)
    if (!current) {
      snapshot = { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() }
      return snapshot
    }
    try {
      snapshot = await fetchPlatformSnapshot(current)
    } catch (error) {
      snapshot = {
        balance: null,
        today: null,
        price_ratio: null,
        error: error instanceof Error ? error.message : String(error),
        fetched_at: new Date().toISOString(),
      }
    }
    return snapshot
  }

  const logout = (): { ok: boolean; message?: string } => {
    try {
      clearStoredToken(dataDir)
      closePlatformLogin()
      snapshot = { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() }
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  const startLogin = async (): Promise<{ ok: boolean; message: string }> => {
    try {
      await startPlatformLogin()
      return { ok: true, message: '请在打开的浏览器窗口中登录 DeepSeek 开放平台' }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  const checkLogin = async (): Promise<{ loggedIn: boolean; message?: string }> => {
    try {
      const token = await readPlatformTokenFromBrowser(9333)
      if (token) {
        saveTokenToConfigFile(dataDir, token)
        closePlatformLogin()
        await refresh()
        return { loggedIn: true, message: '登录成功' }
      }
      return { loggedIn: false, message: '等待登录完成' }
    } catch (error) {
      return { loggedIn: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  const modelUsageCache = new Map<string, { expires: number; data: ModelUsageResponse }>()
  const MODEL_USAGE_CACHE_TTL_MS = 30_000

  const getModelUsage = async (
    start: string,
    end: string,
    granularity: 'hour' | 'day',
  ): Promise<ModelUsageResponse> => {
    const cacheKey = `${start}|${end}|${granularity}`
    const cached = modelUsageCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) return cached.data

    const data = await fetchSessionModelUsageSeries(
      ctx.sessionPersistence,
      ctx.sessions,
      modelUsageCachePath(dataDir),
      start,
      end,
      granularity,
    )
    modelUsageCache.set(cacheKey, { expires: Date.now() + MODEL_USAGE_CACHE_TTL_MS, data })
    return data
  }

  const streamModelUsage = async (
    start: string,
    end: string,
    granularity: 'hour' | 'day',
    onSnapshot: (series: ModelUsageResponse['series']) => void,
  ): Promise<ModelUsageResponse> => {
    return fetchSessionModelUsageSeries(
      ctx.sessionPersistence,
      ctx.sessions,
      modelUsageCachePath(dataDir),
      start,
      end,
      granularity,
      onSnapshot,
    )
  }

  /** 总览页范围数据：走 DeepSeek 开放平台（与官方用量看板同源），非本地 session 统计。 */
  const platformModelUsage = async (
    start: string,
    end: string,
    granularity: 'hour' | 'day',
  ): Promise<ModelUsageResponse> => {
    const token = resolveUserToken(config, dataDir)
    if (!token) throw new Error('未登录开放平台（platformUserToken 缺失），范围数据需先登录')
    return fetchModelUsageSeries(token, start, end, granularity)
  }


  /** 每个活跃会话命中率 = cacheRead / (input + cacheRead + cacheWrite)，两位小数；
   *  latest 取事件时间最新的会话（通常即当前打开的会话）的值。 */
  const getSessionHits = (): { items: Array<{ id: string; title: string; hit: string | null }>; latest: string | null } => {
    const items: Array<{ id: string; title: string; hit: string | null }> = []
    let latestId: string | null = null
    let latestTime = -1
    for (const s of ctx.sessions.list()) {
      let input = 0
      let read = 0
      let write = 0
      let lastTime = -1
      for (const ev of s.events) {
        const u = (ev as { data?: { usage?: { inputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number } } })?.data?.usage
        if (u) {
          input += u.inputTokens ?? 0
          read += u.cacheReadTokens ?? 0
          write += u.cacheWriteTokens ?? 0
        }
        if (typeof (ev as { time?: number })?.time === 'number' && (ev.time as number) > lastTime) lastTime = ev.time as number
      }
      const denom = input + read + write
      const hit = denom > 0 ? ((read / denom) * 100).toFixed(2) : null
      // 标题：首条用户文本（与官方自动标题通常同源），用于 client 在 DOM
      // 里把统计行与会话精确配对。
      let ttl = ''
      for (const ev of s.events) {
        const evt = ev as { type?: string; data?: { content?: Array<{ type?: string; text?: string }> } }
        if (evt?.type === 'user/message') {
          const text = (evt.data?.content ?? []).map(c => c.text ?? '').join(' ').trim()
          if (text !== '') { ttl = text; break }
        }
      }
      items.push({ id: s.id, title: ttl.slice(0, 24), hit })
      if (lastTime > latestTime) { latestTime = lastTime; latestId = s.id }
    }
    const byId = new Map(items.map(i => [i.id, i]))
    const latestHit = latestId === null ? null : byId.get(latestId)?.hit ?? null
    return { items, latest: latestHit }
  }

  const disposers: Array<() => void> = []

  disposers.push(ctx.effect(
    () => {
      const routeDisposers = makeUsageRoutes({
        getState,
        refreshBalance: refresh,
        startLogin,
        checkLogin,
        logout,
        getModelUsage,
        streamModelUsage,
        platformModelUsage,
        getMeta: () => ({ dshVersion }),
        getSessionHits,
      }).map(route => ctx.webServer.register(route))
      return () => { for (const dispose of routeDisposers) dispose() }
    },
    'deepseek-usage: routes',
  ))

  const timer = setInterval(() => {
    void refresh()
  }, config.refreshIntervalMs)
  disposers.push(() => clearInterval(timer))

  void refresh()

  ctx.effect(() => () => {
    closePlatformLogin()
    for (const dispose of disposers.splice(0)) dispose()
  }, 'deepseek-usage: cleanup')
}
