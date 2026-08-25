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
export interface VentusPluginItem {
    id: string;
    name: string;
    category: string;
    /** 本机 vendor 是否有该子插件产物（client 入口存在即视为已安装）。 */
    installed: boolean;
    /** 依赖的其他子插件 id（勾选本项时自动连带勾选，取消时提示）。 */
    requires: string[];
}
export interface VentusUpdateList {
    ok: boolean;
    /** 非整合包形态安装（独立 usage）时为 false。 */
    bundled: boolean;
    /** 远程最新提交；GitHub 不可达时为 null（列表仍可用，但无法执行更新）。 */
    remote: {
        sha: string;
        message: string;
    } | null;
    /** 本地整合包版本号（package.json version）。 */
    localVersion: string | null;
    /** 远程最新版本号（GitHub package.json version）。 */
    remoteVersion: string | null;
    plugins: VentusPluginItem[];
    error?: string;
}
export interface VentusUpdateApplyResult {
    ok: boolean;
    updated: string[];
    /** 更新后写入 bundle stamp 的远程 sha。 */
    sha: string | null;
    /** 本机重建后的子插件数量（内嵌进聚合 bundle）。 */
    bundledCount: number;
    error?: string;
}
/** 定位整合包包根：本模块位于 <root>/vendor/dsh-deepseek-usage/lib/，上溯四级。 */
export declare function locateVentusRoot(): string | null;
/** 查询 GitHub 仓库最新提交（无 token 的公开 API）。 */
export declare function fetchRemoteCommit(): Promise<{
    sha: string;
    message: string;
} | null>;
/** 读本地整合包版本号（<root>/package.json 的 version；读不到返回 null）。 */
export declare function readLocalVersion(root: string): string | null;
/** 查询 GitHub 远程最新版本号（raw package.json 的 version；不可达返回 null）。 */
export declare function fetchRemoteVersion(): Promise<string | null>;
/**
 * 选择性更新：clone 远程整合包 → 覆盖勾选子插件产物 → 重建聚合 bundle。
 * @param selected - 本次要更新/安装的子插件 id 列表（空数组即只重建）。
 */
export declare function applyVentusUpdate(selected: string[]): Promise<VentusUpdateApplyResult>;
/** 更新检查列表（供 client 模态渲染）。 */
export declare function getVentusUpdateList(): Promise<VentusUpdateList>;
