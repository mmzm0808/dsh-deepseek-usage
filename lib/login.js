/**
 * DeepSeek Platform login helper. Opens a local Edge window pointed at the
 * platform, lets the user sign in manually, then reads `userToken` from the
 * page's localStorage over the Chrome DevTools Protocol. The token is only
 * stored as a plugin config item; it is never embedded in plugin code.
 * @module dsh-deepseek-usage/login
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const EDGE_CANDIDATES = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const LOGIN_PORT = 9333;
const PLATFORM_URL = 'https://platform.deepseek.com';
/** Active login browser process and profile dir. */
let active;
/** Find an installed Edge executable. */
function findEdge() {
    for (const candidate of EDGE_CANDIDATES) {
        if (existsSync(candidate))
            return candidate;
    }
    throw new Error('未找到 Microsoft Edge，无法打开登录窗口');
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
/** Open a visible Edge window logged into the DeepSeek platform. */
export async function startPlatformLogin() {
    if (active) {
        return { port: LOGIN_PORT };
    }
    const edge = findEdge();
    const profileDir = mkdtempSync(join(tmpdir(), 'dsh-deepseek-login-'));
    const child = spawn(edge, [
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