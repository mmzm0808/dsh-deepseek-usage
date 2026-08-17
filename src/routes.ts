/**
 * HTTP route family for dsh-deepseek-usage: read the current usage snapshot
 * and force a balance refresh. All routes are loopback-only and `no-store`.
 * @module dsh-deepseek-usage/routes
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import type { UsageState } from './protocol.js'

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

  return [state, refresh, loginStart, loginStatus]
}
