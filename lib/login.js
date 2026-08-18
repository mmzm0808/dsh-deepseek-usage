/**
 * DeepSeek Platform login helper. Opens a local Chromium-family browser window
 * (Chrome, Edge, Brave, Chromium, etc.) pointed at the platform, lets the user
 * sign in manually, then reads `userToken` from the page's localStorage over
 * the Chrome DevTools Protocol. The token is only stored as a plugin config
 * item; it is never embedded in plugin code.
 * @module dsh-deepseek-usage/login
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const LOGIN_PORT = 9333;
const PLATFORM_URL = 'https://platform.deepseek.com';
/** Active login browser process and profile dir. */
let active;
/** Strip surrounding quotes from a user-supplied browser path. */
function normalizeBrowserPath(value) {
    if (!value)
        return undefined;
    const trimmed = value.trim();
    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}
/** Return the first existing path from a list of candidates. */
function firstExisting(candidates) {
    return candidates.find(candidate => candidate && existsSync(candidate));
}
/** Resolve an executable name through the platform PATH lookup. */
function findInPath(names) {
    const command = process.platform === 'win32' ? 'where' : 'which';
    for (const name of names) {
        const result = spawnSync(command, [name], { encoding: 'utf8' });
        if (result.status === 0 && result.stdout) {
            const line = result.stdout.split(/\r?\n/).map(item => item.trim()).find(Boolean);
            if (line)
                return line;
        }
    }
    return undefined;
}
/** Collect Chromium-family browser executable candidates for this platform. */
function browserCandidates() {
    const candidates = [];
    if (process.platform === 'win32') {
        const programFiles = process.env.PROGRAMFILES ?? 'C:\\Program Files';
        const programFilesX86 = process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)';
        const localAppData = process.env.LOCALAPPDATA ?? join(process.env.USERPROFILE ?? '', 'AppData', 'Local');
        candidates.push(join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'), join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'), join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'), join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'), join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'), join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'), join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'), join(programFiles, 'Chromium', 'Application', 'chrome.exe'), join(localAppData, 'Chromium', 'Application', 'chrome.exe'), join(programFiles, 'Vivaldi', 'Application', 'vivaldi.exe'), join(localAppData, 'Vivaldi', 'Application', 'vivaldi.exe'));
        const pathHit = findInPath(['chrome', 'msedge', 'chromium', 'brave', 'vivaldi']);
        if (pathHit)
            candidates.push(pathHit);
    }
    else if (process.platform === 'darwin') {
        candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi');
        const pathHit = findInPath(['google-chrome', 'google-chrome-stable', 'microsoft-edge', 'brave-browser', 'chromium', 'vivaldi']);
        if (pathHit)
            candidates.push(pathHit);
    }
    else {
        const pathHit = findInPath(['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'microsoft-edge-stable', 'brave-browser', 'vivaldi']);
        if (pathHit)
            candidates.push(pathHit);
    }
    return candidates;
}
/**
 * Find a usable Chromium-family browser. Users can force a specific browser
 * through the `DSH_DEEPSEEK_LOGIN_BROWSER` environment variable.
 */
function findChromiumBrowser() {
    const override = normalizeBrowserPath(process.env.DSH_DEEPSEEK_LOGIN_BROWSER);
    if (override) {
        if (existsSync(override))
            return override;
        const resolved = findInPath([override]);
        if (resolved)
            return resolved;
        throw new Error(`指定的登录浏览器不存在或不在 PATH 中：${override}`);
    }
    const hit = firstExisting(browserCandidates());
    if (hit)
        return hit;
    throw new Error('未找到可用的 Chromium 内核浏览器（Chrome/Edge/Brave/Chromium 等）。请安装 Chrome 或 Edge，或设置环境变量 DSH_DEEPSEEK_LOGIN_BROWSER 指定浏览器路径');
}
/** Wait for the CDP endpoint to become ready. */
async function waitForCdp(port, timeoutMs = 20_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/json/version`);
            if (response.ok)
                return;
        }
        catch {
            // Browser not ready yet.
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    throw new Error('登录浏览器启动超时');
}
/** Open a visible Chromium-family window logged into the DeepSeek platform. */
export async function startPlatformLogin() {
    if (active) {
        return { port: LOGIN_PORT };
    }
    const browser = findChromiumBrowser();
    const profileDir = mkdtempSync(join(tmpdir(), 'dsh-deepseek-login-'));
    const child = spawn(browser, [
        `--remote-debugging-port=${LOGIN_PORT}`,
        '--remote-allow-origins=*',
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        PLATFORM_URL,
    ], {
        stdio: 'ignore',
        detached: false,
    });
    active = { process: child, profileDir };
    child.on('exit', () => {
        if (active?.process === child)
            active = undefined;
    });
    await waitForCdp(LOGIN_PORT);
    return { port: LOGIN_PORT };
}
/** Read the platform `userToken` from the open browser via CDP. */
export async function readPlatformTokenFromBrowser(port) {
    const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json());
    const page = targets.find(target => target.type === 'page' && target.url?.startsWith(PLATFORM_URL) && target.webSocketDebuggerUrl);
    if (!page?.webSocketDebuggerUrl)
        return undefined;
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    try {
        await new Promise((resolve, reject) => {
            socket.addEventListener('open', () => resolve(), { once: true });
            socket.addEventListener('error', () => reject(new Error('CDP 连接失败')), { once: true });
        });
        const result = await new Promise((resolve, reject) => {
            const id = 1;
            const onMessage = (event) => {
                const message = JSON.parse(String(event.data));
                if (message.id === id) {
                    socket.removeEventListener('message', onMessage);
                    resolve(message);
                }
            };
            socket.addEventListener('message', onMessage);
            socket.send(JSON.stringify({
                id,
                method: 'Runtime.evaluate',
                params: {
                    expression: `(() => { const raw = localStorage.getItem('userToken'); if (!raw) return undefined; try { const parsed = JSON.parse(raw); const v = parsed && parsed.value; return typeof v === 'string' && v.length > 0 ? v : undefined; } catch { return raw.length > 0 ? raw : undefined; } })()`,
                    returnByValue: true,
                },
            }));
            setTimeout(() => reject(new Error('CDP 读取超时')), 10_000);
        });
        const value = result.result?.result?.value;
        return typeof value === 'string' && value.length > 0 ? value : undefined;
    }
    finally {
        socket.close();
    }
}
/** Close the login browser and remove its temporary profile. */
export function closePlatformLogin() {
    const current = active;
    active = undefined;
    if (!current)
        return;
    try {
        current.process.kill();
    }
    catch {
        // Already exited.
    }
    try {
        rmSync(current.profileDir, { recursive: true, force: true });
    }
    catch {
        // Best-effort cleanup.
    }
}
//# sourceMappingURL=login.js.map