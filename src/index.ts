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
import { homedir } from 'node:os'
import { join } from 'node:path'
import z from 'schemastery'
import { closePlatformLogin, readPlatformTokenFromBrowser, startPlatformLogin } from './login.js'
import { fetchPlatformSnapshot } from './platform.js'
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

/** Plugin config file path under the dsh home. */
function pluginConfigPath(): string {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  return join(home, 'dsh-deepseek-usage', 'config.json')
}

/** JSON cache file for extracted local model usage history. */
function modelUsageCachePath(): string {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  return join(home, 'dsh-deepseek-usage', 'model-usage-cache.json')
}

/** Read `platformUserToken` from the plugin config file (user-owned config item). */
function readTokenFromConfigFile(): string | undefined {
  const file = pluginConfigPath()
  if (!existsSync(file)) return undefined
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { platformUserToken?: unknown }
    return typeof parsed.platformUserToken === 'string' ? parsed.platformUserToken : undefined
  } catch {
    return undefined
  }
}

/** Read `platformUserToken` from the web profile's cordis.patch.yml config item. */
function readTokenFromProfileConfig(): string | undefined {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const file = join(home, 'profiles', 'web', 'cordis.patch.yml')
  if (!existsSync(file)) return undefined
  try {
    const text = readFileSync(file, 'utf8')
    const match = text.match(/platformUserToken:\s*['"]([^'"]+)['"]/)
    return match?.[1]
  } catch {
    return undefined
  }
}

/** Persist the platform userToken as a user config item. */
function saveTokenToConfigFile(token: string): void {
  const file = pluginConfigPath()
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
function resolveUserToken(config: Config): string | undefined {
  return config.platformUserToken
    || process.env.DEEPSEEK_PLATFORM_USER_TOKEN
    || readTokenFromProfileConfig()
    || readTokenFromConfigFile()
}

/** Remove stored userToken from the plugin config file and web profile patch. */
function clearStoredToken(): void {
  const configFile = pluginConfigPath()
  if (existsSync(configFile)) rmSync(configFile, { force: true })

  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const patchFile = join(home, 'profiles', 'web', 'cordis.patch.yml')
  if (!existsSync(patchFile)) return
  const text = readFileSync(patchFile, 'utf8')
  const cleaned = text.replace(/# dsh-deepseek-usage[\s\S]*?platformUserToken:\s*'[^']*'\n?/, '')
  if (cleaned !== text) writeFileSync(patchFile, cleaned)
}

/** Register the plugin. */
export function apply(ctx: AppContext, config: Config): void {
  const token = resolveUserToken(config)
  let snapshot: PlatformSnapshot = token === undefined
    ? { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() }
    : { balance: null, today: null, price_ratio: null, fetched_at: new Date().toISOString() }

  const getState = (): PlatformSnapshot => snapshot

  const refresh = async (): Promise<PlatformSnapshot> => {
    const current = resolveUserToken(config)
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
      clearStoredToken()
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
        saveTokenToConfigFile(token)
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
      modelUsageCachePath(),
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
      modelUsageCachePath(),
      start,
      end,
      granularity,
      onSnapshot,
    )
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
