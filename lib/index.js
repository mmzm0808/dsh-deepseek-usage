/**
 * dsh-deepseek-usage — host half. Pulls exact balance, cumulative cost, and
 * today's usage/cost from the DeepSeek Platform private API (the same source
 * as the official usage dashboard) and exposes them through loopback HTTP
 * routes for the browser floating widget. No local pricing is used.
 * @module dsh-deepseek-usage
 */
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync, } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import z from 'schemastery';
import { closePlatformLogin, readPlatformTokenFromBrowser, startPlatformLogin } from './login.js';
import { fetchModelUsageSeries, fetchPlatformSnapshot } from './platform.js';
import { makeUsageRoutes } from './routes.js';
import { fetchSessionModelUsageSeries } from './session-usage.js';
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export const name = 'deepseek-usage';
/** Services required before routes can mount. */
export const inject = ['webServer', 'sessions', 'sessionPersistence'];
export const Config = z.object({
    refreshIntervalMs: z.number().min(5000).default(10_000),
    platformUserToken: z.string().default(''),
});
/** Default DSH home directory. */
function defaultDshHome() {
    return process.env.DSH_HOME ?? join(homedir(), '.dsh');
}
/** DSH 应用版本号（client 端显示在侧边栏 brand 下方）。 */
const dshVersion = (() => {
    if (typeof process.env.DSH_VERSION === 'string' && process.env.DSH_VERSION.length > 0) {
        return process.env.DSH_VERSION;
    }
    const req = createRequire(import.meta.url);
    // DSH 仓库结构：<root>/vendor/cordis/package.json —— 由 cordis 的解析位置
    // 反推仓库根，读 apps/web 的应用版本（与 client 构建同步）。
    try {
        const cordisPath = req.resolve('@deepseek-ai/cordis/package.json');
        const root = join(dirname(cordisPath), '..', '..');
        const webPkgPath = join(root, 'apps', 'web', 'package.json');
        if (existsSync(webPkgPath)) {
            const parsed = JSON.parse(readFileSync(webPkgPath, 'utf8'));
            if (typeof parsed.version === 'string' && parsed.version.length > 0)
                return parsed.version;
        }
    }
    catch {
        // 非 vendor 布局（pnpm 等）时走下一回退。
    }
    try {
        const runtimePath = req.resolve('@deepseek-ai/dsh-client-runtime/package.json');
        const parsed = JSON.parse(readFileSync(runtimePath, 'utf8'));
        if (typeof parsed.version === 'string' && parsed.version.length > 0)
            return parsed.version;
    }
    catch {
        // 宿主未暴露 runtime 包时返回占位。
    }
    return 'unknown';
})();
/** Resolve plugin data directory: Desktop profile dir when available, otherwise DSH home. */
function resolveDataDir(ctx) {
    const desktop = ctx.get?.('desktopProfiles');
    const dir = desktop?.current?.dir;
    return typeof dir === 'string' && dir.length > 0 ? dir : defaultDshHome();
}
/** Plugin config file path under a data directory. */
function pluginConfigPath(dataDir = defaultDshHome()) {
    return join(dataDir, 'dsh-deepseek-usage', 'config.json');
}
/** JSON cache file for extracted local model usage history. */
function modelUsageCachePath(dataDir = defaultDshHome()) {
    return join(dataDir, 'dsh-deepseek-usage', 'model-usage-cache.json');
}
/** Candidate cordis.patch.yml files that may hold the token. */
function profilePatchCandidates(dataDir) {
    const home = defaultDshHome();
    if (dataDir === home)
        return [join(home, 'profiles', 'web', 'cordis.patch.yml')];
    return [join(dataDir, 'cordis.patch.yml'), join(home, 'profiles', 'web', 'cordis.patch.yml')];
}
/** Read `platformUserToken` from the plugin config file (user-owned config item). */
function readTokenFromConfigFile(dataDir = defaultDshHome()) {
    const file = pluginConfigPath(dataDir);
    if (!existsSync(file))
        return undefined;
    try {
        const parsed = JSON.parse(readFileSync(file, 'utf8'));
        return typeof parsed.platformUserToken === 'string' ? parsed.platformUserToken : undefined;
    }
    catch {
        return undefined;
    }
}
/** Read `platformUserToken` from the active profile's cordis.patch.yml config item. */
function readTokenFromProfileConfig(dataDir = defaultDshHome()) {
    for (const file of profilePatchCandidates(dataDir)) {
        if (!existsSync(file))
            continue;
        try {
            const text = readFileSync(file, 'utf8');
            const match = text.match(/platformUserToken:\s*['"]([^'"]+)['"]/);
            if (match?.[1])
                return match[1];
        }
        catch {
            // A corrupt patch must not block login resolution.
        }
    }
    return undefined;
}
/** Persist the platform userToken as a user config item. */
function saveTokenToConfigFile(dataDir, token) {
    const file = pluginConfigPath(dataDir);
    mkdirSync(join(file, '..'), { recursive: true });
    const payload = JSON.stringify({ platformUserToken: token }, null, 2);
    const temp = file + '.tmp';
    const fd = openSync(temp, 'w');
    try {
        writeFileSync(fd, payload);
        fsyncSync(fd);
    }
    finally {
        closeSync(fd);
    }
    renameSync(temp, file);
}
/** Resolve the platform userToken from plugin config, env, profile config, then plugin config file. */
function resolveUserToken(config, dataDir = defaultDshHome()) {
    return config.platformUserToken
        || process.env.DEEPSEEK_PLATFORM_USER_TOKEN
        || readTokenFromProfileConfig(dataDir)
        || readTokenFromConfigFile(dataDir);
}
/** Remove stored userToken from plugin config files and profile patches. */
function clearStoredToken(dataDir = defaultDshHome()) {
    for (const dir of new Set([dataDir, defaultDshHome()])) {
        const configFile = pluginConfigPath(dir);
        if (existsSync(configFile))
            rmSync(configFile, { force: true });
    }
    for (const patchFile of profilePatchCandidates(dataDir)) {
        if (!existsSync(patchFile))
            continue;
        const text = readFileSync(patchFile, 'utf8');
        const cleaned = text.replace(/# dsh-deepseek-usage[\s\S]*?platformUserToken:\s*'[^']*'\n?/, '');
        if (cleaned !== text)
            writeFileSync(patchFile, cleaned);
    }
}
/** Register the plugin. */
export function apply(ctx, config) {
    const dataDir = resolveDataDir(ctx);
    const token = resolveUserToken(config, dataDir);
    let snapshot = token === undefined
        ? { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() }
        : { balance: null, today: null, price_ratio: null, fetched_at: new Date().toISOString() };
    const getState = () => snapshot;
    const refresh = async () => {
        const current = resolveUserToken(config, dataDir);
        if (!current) {
            snapshot = { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() };
            return snapshot;
        }
        try {
            snapshot = await fetchPlatformSnapshot(current);
        }
        catch (error) {
            snapshot = {
                balance: null,
                today: null,
                price_ratio: null,
                error: error instanceof Error ? error.message : String(error),
                fetched_at: new Date().toISOString(),
            };
        }
        return snapshot;
    };
    const logout = () => {
        try {
            clearStoredToken(dataDir);
            closePlatformLogin();
            snapshot = { balance: null, today: null, price_ratio: null, error: '未登录 DeepSeek 开放平台，请点击面板中的“登录”按钮', fetched_at: new Date().toISOString() };
            return { ok: true };
        }
        catch (error) {
            return { ok: false, message: error instanceof Error ? error.message : String(error) };
        }
    };
    const startLogin = async () => {
        try {
            await startPlatformLogin();
            return { ok: true, message: '请在打开的浏览器窗口中登录 DeepSeek 开放平台' };
        }
        catch (error) {
            return { ok: false, message: error instanceof Error ? error.message : String(error) };
        }
    };
    const checkLogin = async () => {
        try {
            const token = await readPlatformTokenFromBrowser(9333);
            if (token) {
                saveTokenToConfigFile(dataDir, token);
                closePlatformLogin();
                await refresh();
                return { loggedIn: true, message: '登录成功' };
            }
            return { loggedIn: false, message: '等待登录完成' };
        }
        catch (error) {
            return { loggedIn: false, message: error instanceof Error ? error.message : String(error) };
        }
    };
    const modelUsageCache = new Map();
    const MODEL_USAGE_CACHE_TTL_MS = 30_000;
    const getModelUsage = async (start, end, granularity) => {
        const cacheKey = `${start}|${end}|${granularity}`;
        const cached = modelUsageCache.get(cacheKey);
        if (cached && cached.expires > Date.now())
            return cached.data;
        const data = await fetchSessionModelUsageSeries(ctx.sessionPersistence, ctx.sessions, modelUsageCachePath(dataDir), start, end, granularity);
        modelUsageCache.set(cacheKey, { expires: Date.now() + MODEL_USAGE_CACHE_TTL_MS, data });
        return data;
    };
    const streamModelUsage = async (start, end, granularity, onSnapshot) => {
        return fetchSessionModelUsageSeries(ctx.sessionPersistence, ctx.sessions, modelUsageCachePath(dataDir), start, end, granularity, onSnapshot);
    };
    /** 总览页范围数据：走 DeepSeek 开放平台（与官方用量看板同源），非本地 session 统计。 */
    const platformModelUsage = async (start, end, granularity) => {
        const token = resolveUserToken(config, dataDir);
        if (!token)
            throw new Error('未登录开放平台（platformUserToken 缺失），范围数据需先登录');
        return fetchModelUsageSeries(token, start, end, granularity);
    };
    /** 每个活跃会话命中率 = cacheRead / (input + cacheRead + cacheWrite)，两位小数；
     *  latest 取事件时间最新的会话（通常即当前打开的会话）的值。 */
    const getSessionHits = () => {
        const items = [];
        let latestId = null;
        let latestTime = -1;
        for (const s of ctx.sessions.list()) {
            let input = 0;
            let read = 0;
            let write = 0;
            let lastTime = -1;
            for (const ev of s.events) {
                const u = ev?.data?.usage;
                if (u) {
                    input += u.inputTokens ?? 0;
                    read += u.cacheReadTokens ?? 0;
                    write += u.cacheWriteTokens ?? 0;
                }
                if (typeof ev?.time === 'number' && ev.time > lastTime)
                    lastTime = ev.time;
            }
            const denom = input + read + write;
            const hit = denom > 0 ? ((read / denom) * 100).toFixed(2) : null;
            // 标题：会话 log 中的 session/title 事件（官方命名/自动命名落库的
            // 标题，与客户端 header 显示的是同一来源）；缺失时回退首条用户文本。
            let ttl = '';
            for (const ev of s.events) {
                const evt = ev;
                if (evt?.type === 'session/title' && typeof evt.data?.title === 'string' && evt.data.title.trim() !== '') {
                    ttl = evt.data.title.trim();
                }
            }
            if (ttl === '') {
                for (const ev of s.events) {
                    const evt = ev;
                    if (evt?.type === 'user/message') {
                        const text = (evt.data?.content ?? []).map(c => c.text ?? '').join(' ').trim();
                        if (text !== '') {
                            ttl = text;
                            break;
                        }
                    }
                }
            }
            items.push({ id: s.id, title: ttl.slice(0, 40), hit });
            if (lastTime > latestTime) {
                latestTime = lastTime;
                latestId = s.id;
            }
        }
        const byId = new Map(items.map(i => [i.id, i]));
        const latestHit = latestId === null ? null : byId.get(latestId)?.hit ?? null;
        return { items, latest: latestHit };
    };
    const disposers = [];
    disposers.push(ctx.effect(() => {
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
        }).map(route => ctx.webServer.register(route));
        return () => { for (const dispose of routeDisposers)
            dispose(); };
    }, 'deepseek-usage: routes'));
    const timer = setInterval(() => {
        void refresh();
    }, config.refreshIntervalMs);
    disposers.push(() => clearInterval(timer));
    void refresh();
    ctx.effect(() => () => {
        closePlatformLogin();
        for (const dispose of disposers.splice(0))
            dispose();
    }, 'deepseek-usage: cleanup');
}
//# sourceMappingURL=index.js.map