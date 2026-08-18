/**
 * dsh-deepseek-usage — host half. Pulls exact balance, cumulative cost, and
 * today's usage/cost from the DeepSeek Platform private API (the same source
 * as the official usage dashboard) and exposes them through loopback HTTP
 * routes for the browser floating widget. No local pricing is used.
 * @module dsh-deepseek-usage
 */
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync, } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import z from 'schemastery';
import { closePlatformLogin, readPlatformTokenFromBrowser, startPlatformLogin } from './login.js';
import { fetchPlatformSnapshot } from './platform.js';
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