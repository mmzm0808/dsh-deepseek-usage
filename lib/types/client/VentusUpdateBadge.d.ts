/**
 * Ventus 整合包更新入口（客户端）。
 *
 * 点击流程（安装确认 → 顶层模态）：
 *  1. 先弹「是否安装更新？」确认框；
 *  2. 确认后打开顶层模态（VentusUpdateModal）：完整多选安装/更新列表，
 *     仅对勾选项执行更新（未勾选的已装子插件保持旧版不动）。
 *
 * 徽标显示整合包远程与本地提交的比对结果：
 *  - 有新提交 → 「发现更新 · sha」（高亮可点）；
 *  - 无新提交 → 「已是最新版本」；
 *  - 检查失败 → 「检查失败」。
 * 无论哪种状态都可点击打开安装窗口（最小包用户可借此补装未安装的子插件）。
 *
 * 纯客户端实现（GitHub 公开 API，无需 token），失败时静默降级。
 * @module dsh-deepseek-usage/client/VentusUpdateBadge
 */
/** 整合包更新入口（放在 Ventus 设置页右上角）。 */
export declare function VentusUpdateBadge(): unknown;
