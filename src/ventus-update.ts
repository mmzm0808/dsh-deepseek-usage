/**
 * Ventus 整合包选择性安装 / 更新（host 半身）。
 *
 * 整合包（dsh-ventus-plugins）以单一插件形态安装，子插件产物在包内
 * vendor/ 目录。本模块负责：
 *  - list：整合包目录探测 + GitHub 远程最新提交 + 本地已装子插件清单；
 *  - apply：git clone 远程整合包到临时目录，按勾选项把子插件产物
 *    整体覆盖到本机 vendor/，再用远程构建脚本重建聚合 client bundle
 *    （只内嵌本机实际存在的子插件），未勾选且已装的子插件保持旧版。
 *
 * 产物覆盖用「先删后拷」，避免残留旧文件；重建时 STAMP_SHA 传远程 sha，
 * bundle 自带的 stamp 使更新检查在刷新后自动归零为「已是最新」。
 * @module dsh-deepseek-usage/ventus-update
 */

import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 整合包远程仓库（GitHub owner/repo）。 */
const VENTUS_REPO = 'mmzm0808/dsh-ventus-plugins'
const VENTUS_REPO_URL = `https://github.com/${VENTUS_REPO}.git`

/** 子插件展示元数据（与整合包 build-client.mjs 的 CLIENT_ENTRIES 对齐）。
 *  requires：依赖的其他子插件 id；勾选本项时弹窗自动连带勾选并提示「将一并安装」。 */
const SUB_PLUGINS: Array<{ id: string; name: string; category: string; entry: string; requires: string[] }> = [
  { id: 'dsh-better-sidebar', name: '右侧重栏', category: '侧边栏', entry: 'dsh-better-sidebar/lib/client.js', requires: [] },
  { id: 'dsh-deepseek-usage', name: '用量监测', category: '用量', entry: 'dsh-deepseek-usage/lib/client.js', requires: [] },
  { id: 'dsh-theme-endfield', name: '终末地主题', category: '主题', entry: 'dsh-theme-endfield/client.js', requires: [] },
  { id: 'dsh-ventus-progress', name: '子代理进度', category: '进度', entry: 'dsh-ventus-progress/lib/client.js', requires: [] },
  { id: 'dsh-ventus-search', name: '多引擎搜索', category: '搜索', entry: 'dsh-ventus-search/lib/client.js', requires: [] },
  { id: 'dsh-ventus-whale', name: '虎鲸桌宠', category: '桌宠', entry: 'dsh-ventus-whale/lib/client.js', requires: [] },
  { id: '@dsh-external/dsh-super-injector', name: '模组注入', category: '工具链', entry: '@dsh-external/dsh-super-injector/lib/client.js', requires: [] },
  { id: '@dsh-external/dsh-visualize', name: '可视化', category: '工具链', entry: '@dsh-external/dsh-visualize/lib/client.js', requires: [] },
  { id: '@dsh-external/dsh-webui', name: 'WebUI 工具链', category: '工具链', entry: '@dsh-external/dsh-webui/lib/client.js', requires: [] },
  { id: '@nanmicoder/dsh-auto-mode', name: 'Auto 权限', category: '权限', entry: '@nanmicoder/dsh-auto-mode/lib/client.js', requires: [] },
  { id: 'dsh-usage-skill', name: '用量热力图', category: '用量', entry: 'dsh-usage-skill/lib/client.js', requires: [] },
  // 科研工作流插件（host-only，无 client bundle；entry 用 host 产物判断安装状态）。
  { id: 'dsh-ventus-research', name: '科研工作流', category: '科研', entry: 'dsh-ventus-research/lib/index.js', requires: [] },
]

export interface VentusPluginItem {
  id: string
  name: string
  category: string
  /** 本机 vendor 是否有该子插件产物（client 入口存在即视为已安装）。 */
  installed: boolean
  /** 依赖的其他子插件 id（勾选本项时自动连带勾选，取消时提示）。 */
  requires: string[]
}

export interface VentusUpdateList {
  ok: boolean
  /** 非整合包形态安装（独立 usage）时为 false。 */
  bundled: boolean
  /** 远程最新提交；GitHub 不可达时为 null（列表仍可用，但无法执行更新）。 */
  remote: { sha: string; message: string } | null
  /** 本地整合包版本号（package.json version）。 */
  localVersion: string | null
  /** 远程最新版本号（GitHub package.json version）。 */
  remoteVersion: string | null
  plugins: VentusPluginItem[]
  error?: string
}

export interface VentusUpdateApplyResult {
  ok: boolean
  updated: string[]
  /** 更新后写入 bundle stamp 的远程 sha。 */
  sha: string | null
  /** 本机重建后的子插件数量（内嵌进聚合 bundle）。 */
  bundledCount: number
  error?: string
}

/** 定位整合包包根：本模块位于 <root>/vendor/dsh-deepseek-usage/lib/，上溯四级。 */
export function locateVentusRoot(): string | null {
  const here = dirname(fileURLToPath(import.meta.url))
  const root = join(here, '..', '..', '..')
  const hostEntry = join(root, 'lib', 'index.js')
  const selfVendor = join(root, 'vendor', 'dsh-deepseek-usage', 'lib', 'index.js')
  if (!existsSync(hostEntry) || !existsSync(selfVendor)) return null
  return root
}

/** 查询 GitHub 仓库最新提交（无 token 的公开 API）。 */
export async function fetchRemoteCommit(): Promise<{ sha: string; message: string } | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${VENTUS_REPO}/commits?per_page=1`, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'dsh-deepseek-usage' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    const list = (await res.json()) as Array<{ sha?: unknown; commit?: { message?: unknown } }>
    const top = Array.isArray(list) ? list[0] : undefined
    const sha = typeof top?.sha === 'string' ? top.sha : ''
    if (sha === '') return null
    const message = typeof top?.commit?.message === 'string' ? top.commit.message.split('\n')[0] : ''
    return { sha, message }
  } catch {
    return null
  }
}

/** 读本地整合包版本号（<root>/package.json 的 version；读不到返回 null）。 */
export function readLocalVersion(root: string): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version?: unknown }
    return typeof pkg.version === 'string' && pkg.version !== '' ? pkg.version : null
  } catch {
    return null
  }
}

/** 查询 GitHub 远程最新版本号（raw package.json 的 version；不可达返回 null）。 */
export async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${VENTUS_REPO}/master/package.json`, {
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    const pkg = (await res.json()) as { version?: unknown }
    return typeof pkg.version === 'string' && pkg.version !== '' ? pkg.version : null
  } catch {
    return null
  }
}

/** 本机已装子插件清单。 */
function scanInstalled(root: string): VentusPluginItem[] {
  return SUB_PLUGINS.map(({ id, name, category, entry, requires }) => ({
    id,
    name,
    category,
    installed: existsSync(join(root, 'vendor', entry)),
    requires,
  }))
}

/** 整体替换一个子插件产物目录（先删后拷，避免残留）。 */
function replaceSubPlugin(srcVendor: string, destVendor: string, id: string): boolean {
  const src = join(srcVendor, id)
  const dest = join(destVendor, id)
  if (!existsSync(src)) return false
  rmSync(dest, { recursive: true, force: true })
  cpSync(src, dest, { recursive: true })
  return true
}

/** 白名单校验：id 必须是已知子插件。 */
function isKnownSubPlugin(id: string): boolean {
  return SUB_PLUGINS.some(item => item.id === id)
}

/**
 * 选择性更新：clone 远程整合包 → 覆盖勾选子插件产物 → 重建聚合 bundle。
 * @param selected - 本次要更新/安装的子插件 id 列表（空数组即只重建）。
 */
export async function applyVentusUpdate(selected: string[]): Promise<VentusUpdateApplyResult> {
  const root = locateVentusRoot()
  if (root === null) {
    return { ok: false, updated: [], sha: null, bundledCount: 0, error: '未检测到整合包安装（dsh-ventus-plugins）' }
  }
  const pick = selected.filter(isKnownSubPlugin)
  if (pick.length !== selected.length) {
    return { ok: false, updated: [], sha: null, bundledCount: 0, error: '包含未知插件 id' }
  }

  const tmp = mkdtempSync(join(tmpdir(), 'ventus-update-'))
  try {
    const clone = spawnSync('git', ['clone', '--depth', '1', VENTUS_REPO_URL, tmp], {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120_000,
    })
    if (clone.status !== 0) {
      const detail = (clone.stderr ?? '').split('\n').filter(Boolean).pop() ?? ''
      return { ok: false, updated: [], sha: null, bundledCount: 0, error: `git clone 失败：${detail}` }
    }
    const sha = spawnSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
      .stdout?.trim() ?? ''
    if (sha === '') return { ok: false, updated: [], sha: null, bundledCount: 0, error: '无法读取远程提交 sha' }

    const srcVendor = join(tmp, 'vendor')
    const destVendor = join(root, 'vendor')
    const updated: string[] = []
    for (const id of pick) {
      if (replaceSubPlugin(srcVendor, destVendor, id)) updated.push(id)
    }

    // 用远程构建脚本重建聚合（内嵌本机实际存在的子插件，缺失自动跳过）。
    cpSync(join(tmp, 'scripts', 'build-client.mjs'), join(root, 'scripts', 'build-client.mjs'), { force: true })
    const build = spawnSync('node', ['scripts', 'build-client.mjs'], {
      cwd: root,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120_000,
      env: { ...process.env, STAMP_SHA: sha },
    })
    if (build.status !== 0) {
      const detail = (build.stderr ?? '').split('\n').filter(Boolean).pop() ?? ''
      return { ok: false, updated, sha: null, bundledCount: 0, error: `重建聚合 bundle 失败：${detail}` }
    }
    const bundledCount = /\((\d+) sub-bundles?\)/.exec(build.stdout ?? '')?.[1]
      ? Number(/(\d+) sub-bundles?/.exec(build.stdout ?? '')?.[1])
      : 0
    return { ok: true, updated, sha, bundledCount }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** 更新检查列表（供 client 模态渲染）。 */
export async function getVentusUpdateList(): Promise<VentusUpdateList> {
  const root = locateVentusRoot()
  if (root === null) {
    return {
      ok: true,
      bundled: false,
      remote: null,
      localVersion: null,
      remoteVersion: null,
      plugins: [],
      error: '未检测到整合包安装（独立安装的 dsh-deepseek-usage 无此功能）',
    }
  }
  const [remote, remoteVersion] = await Promise.all([fetchRemoteCommit(), fetchRemoteVersion()])
  return { ok: true, bundled: true, remote, localVersion: readLocalVersion(root), remoteVersion, plugins: scanInstalled(root) }
}
