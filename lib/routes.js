/**
 * HTTP route family for dsh-deepseek-usage: read the current usage snapshot
 * and force a balance refresh. All routes are loopback-only and `no-store`.
 * @module dsh-deepseek-usage/routes
 */
/** Cap on JSON request bodies. */
const MAX_JSON_BODY_BYTES = 16 * 1024;
/** Loopback literal check plus browser same-origin markers. */
function isLoopbackRequest(request) {
    const address = request.socket.remoteAddress;
    if (address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1')
        return false;
    const host = request.headers.host;
    if (typeof host !== 'string')
        return false;
    let hostUrl;
    try {
        hostUrl = new URL(`http://${host}`);
    }
    catch {
        return false;
    }
    if (hostUrl.hostname !== '127.0.0.1' && hostUrl.hostname !== 'localhost' && hostUrl.hostname !== '[::1]')
        return false;
    if (request.headers['sec-fetch-site'] === 'cross-site')
        return false;
    const origin = request.headers.origin;
    if (origin === undefined)
        return true;
    try {
        return new URL(origin).host === hostUrl.host;
    }
    catch {
        return false;
    }
}
/** Write one JSON response. */
function writeJson(res, status, body) {
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'referrer-policy': 'no-referrer',
        'cache-control': 'no-store',
    });
    res.end(JSON.stringify(body));
}
/** Guard helper: fence + method check. */
function guard(req, res, method) {
    if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: 'forbidden: loopback-only' });
        return false;
    }
    if (req.method !== method) {
        writeJson(res, 405, { error: `method not allowed (expected ${method})` });
        return false;
    }
    return true;
}
/** Build the route family. */
export function makeUsageRoutes(deps) {
    const state = {
        kind: 'exact',
        path: '/api/deepseek-usage/state',
        handler: (req, res) => {
            if (!guard(req, res, 'GET'))
                return;
            writeJson(res, 200, deps.getState());
        },
    };
    const refresh = {
        kind: 'exact',
        path: '/api/deepseek-usage/refresh',
        handler: async (req, res) => {
            if (!guard(req, res, 'POST'))
                return;
            try {
                writeJson(res, 200, await deps.refreshBalance());
            }
            catch (error) {
                writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
            }
        },
    };
    const loginStart = {
        kind: 'exact',
        path: '/api/deepseek-usage/login/start',
        handler: async (req, res) => {
            if (!guard(req, res, 'POST'))
                return;
            writeJson(res, 200, await deps.startLogin());
        },
    };
    const loginStatus = {
        kind: 'exact',
        path: '/api/deepseek-usage/login/status',
        handler: async (req, res) => {
            if (!guard(req, res, 'GET'))
                return;
            writeJson(res, 200, await deps.checkLogin());
        },
    };
    const logout = {
        kind: 'exact',
        path: '/api/deepseek-usage/logout',
        handler: (req, res) => {
            if (!guard(req, res, 'POST'))
                return;
            writeJson(res, 200, deps.logout());
        },
    };
    const modelUsage = {
        kind: 'exact',
        path: '/api/deepseek-usage/model-usage',
        handler: async (req, res) => {
            if (!guard(req, res, 'GET'))
                return;
            try {
                const url = new URL(req.url ?? '/', 'http://localhost');
                const start = url.searchParams.get('start') ?? '';
                const end = url.searchParams.get('end') ?? '';
                const granularity = url.searchParams.get('granularity') === 'day' ? 'day' : 'hour';
                if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
                    writeJson(res, 400, { error: 'start/end must be YYYY-MM-DD' });
                    return;
                }
                writeJson(res, 200, await deps.getModelUsage(start, end, granularity));
            }
            catch (error) {
                writeJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
            }
        },
    };
    return [state, refresh, loginStart, loginStatus, logout, modelUsage];
}
//# sourceMappingURL=routes.js.map