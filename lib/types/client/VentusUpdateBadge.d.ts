/**
 * Ventus 整合包更新检查（客户端）。
 *
 * 读取 GitHub 仓库最新提交，与本地打包时记录的提交对比：
 *  - 有新提交 → 显示「发现更新」按钮，点击打开仓库 commits 页面；
 *  - 无新提交 → 显示「已是最新版本」。
 *
 * 纯客户端实现（GitHub 公开 API，无需 token），失败时静默显示「检查失败」，
 * 不影响任何其它功能。
 * @module dsh-deepseek-usage/client/VentusUpdateBadge
 */
/** 整合包更新状态小徽标（放在 Ventus 设置页右上角）。 */
export declare function VentusUpdateBadge(): unknown;
