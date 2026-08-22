/**
 * HTTP route family for dsh-deepseek-usage: read the current usage snapshot
 * and force a balance refresh. All routes are loopback-only and `no-store`.
 * @module dsh-deepseek-usage/routes
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import type { ModelUsageResponse, UsageState } from './protocol.js'

/** Dependencies the routes need from the plugin host. */
export interface UsageRoutesDeps {
  /** Build the latest state snapshot. */
  getState(): UsageState
  /** Force a balance refresh and return the resulting snapshot. */
  refreshBalance(): Promise<UsageState>
  /** Open the platform login browser. */
  startLogin(): Promise<{ ok: boolean; message: string }>
  /** Check whether the platform login browser has produced a userToken. */
  checkLogin(): Promise<{ loggedIn: boolean; message?: string }>
  /** Clear stored userToken and reset to logged-out state. */
  logout(): { ok: boolean; message?: string }
  /** Fetch per-model usage buckets for a date range. */
  getModelUsage(start: string, end: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>
  /** Fetch per-model usage buckets and emit progressive snapshots while scanning. */
  streamModelUsage(
    start: string,
    end: string,
    granularity: 'hour' | 'day',
    onSnapshot: (series: ModelUsageResponse['series']) => void,
  ): Promise<ModelUsageResponse>
  /** 总览页范围数据：DeepSeek 开放平台（官方用量看板同源），非本地 session 统计。 */
  platformModelUsage(start: string, end: string, granularity: 'hour' | 'day'): Promise<ModelUsageResponse>
  /** 插件元信息（当前 DSH 应用版本等）。 */
  getMeta(): { dshVersion: string }
}

/** Cap on JSON request bodies. */
const MAX_JSON_BODY_BYTES = 16 * 1024

/** Loopback literal check plus browser same-origin markers. */
function isLoopbackRequest(request: IncomingMessage): boolean {
  const address = request.socket.remoteAddress
  if (address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1') return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl: URL
  try {
    hostUrl = new URL(`http://${host}`)
  } catch {
    return false
  }
  if (hostUrl.hostname !== '127.0.0.1' && hostUrl.hostname !== 'localhost' && hostUrl.hostname !== '[::1]') return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

/** Write one JSON response. */
function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

/** Guard helper: fence + method check. */
function guard(req: IncomingMessage, res: ServerResponse, method: string): boolean {
  if (!isLoopbackRequest(req)) {
    writeJson(res, 403, { error: 'forbidden: loopback-only' })
    return false
  }
  if (req.method !== method) {
    writeJson(res, 405, { error: `method not allowed (expected ${method})` })
    return false
  }
  return true
}

/** Build the route family. */
export function makeUsageRoutes(deps: UsageRoutesDeps): WebRoute[] {
  const state: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/state',
    handler: (req, res) => {
      if (!guard(req, res, 'GET')) return
      writeJson(res, 200, deps.getState())
    },
  }

  const refresh: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/refresh',
    handler: async (req, res) => {
      if (!guard(req, res, 'POST')) return
      try {
        writeJson(res, 200, await deps.refreshBalance())
      } catch (error) {
        writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }

  const loginStart: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/login/start',
    handler: async (req, res) => {
      if (!guard(req, res, 'POST')) return
      writeJson(res, 200, await deps.startLogin())
    },
  }

  const loginStatus: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/login/status',
    handler: async (req, res) => {
      if (!guard(req, res, 'GET')) return
      writeJson(res, 200, await deps.checkLogin())
    },
  }

  const logout: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/logout',
    handler: (req, res) => {
      if (!guard(req, res, 'POST')) return
      writeJson(res, 200, deps.logout())
    },
  }

  const modelUsage: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/model-usage',
    handler: async (req, res) => {
      if (!guard(req, res, 'GET')) return
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const start = url.searchParams.get('start') ?? ''
        const end = url.searchParams.get('end') ?? ''
        const granularity = url.searchParams.get('granularity') === 'day' ? 'day' : 'hour'
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
          writeJson(res, 400, { error: 'start/end must be YYYY-MM-DD' })
          return
        }
        writeJson(res, 200, await deps.getModelUsage(start, end, granularity))
      } catch (error) {
        writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }

  const modelUsageStream: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/model-usage/stream',
    handler: async (req, res) => {
      if (!guard(req, res, 'GET')) return
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const start = url.searchParams.get('start') ?? ''
        const end = url.searchParams.get('end') ?? ''
        const granularity = url.searchParams.get('granularity') === 'day' ? 'day' : 'hour'
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
          writeJson(res, 400, { error: 'start/end must be YYYY-MM-DD' })
          return
        }
        res.writeHead(200, {
          'content-type': 'application/x-ndjson; charset=utf-8',
          'cache-control': 'no-store',
          'transfer-encoding': 'chunked',
        })
        const writeSnapshot = (series: ModelUsageResponse['series']): void => {
          res.write(`${JSON.stringify({ type: 'snapshot', series })}\n`)
        }
        const result = await deps.streamModelUsage(start, end, granularity, writeSnapshot)
        res.end(`${JSON.stringify({ type: 'done', result })}\n`)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (!res.headersSent) {
          writeJson(res, 500, { error: message })
        } else {
          res.write(`${JSON.stringify({ type: 'error', error: message })}\n`)
          res.end()
        }
      }
    },
  }

  const modelUsagePlatform: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/model-usage/platform',
    handler: async (req, res) => {
      if (!guard(req, res, 'GET')) return
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const start = url.searchParams.get('start') ?? ''
        const end = url.searchParams.get('end') ?? ''
        const granularity = url.searchParams.get('granularity') === 'day' ? 'day' : 'hour'
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
          writeJson(res, 400, { error: 'start/end must be YYYY-MM-DD' })
          return
        }
        writeJson(res, 200, await deps.platformModelUsage(start, end, granularity))
      } catch (error) {
        writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }

  const meta: WebRoute = {
    kind: 'exact',
    path: '/api/deepseek-usage/meta',
    handler: (req, res) => {
      if (!guard(req, res, 'GET')) return
      writeJson(res, 200, deps.getMeta())
    },
  }

  return [state, refresh, loginStart, loginStatus, logout, modelUsage, modelUsageStream, modelUsagePlatform, meta]
}
