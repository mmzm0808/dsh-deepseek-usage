/**
 * Ventus 整合包更新入口（客户端）。
 *
 * 点击流程（安装确认 → 顶层模态）不变：
 *  1. 先弹「是否安装更新？」确认框；
 *  2. 确认后打开顶层模态（VentusUpdateModal）：完整多选安装/更新列表。
 *
 * 徽标改用「版本号」判断更新：本地整合包 package.json version vs 远程
 * master version。
 *  - 一致 → 「已是最新版本 · vX」；
 *  - 不一致 → 「发现更新 · vX」（高亮可点）；
 *  - 版本号读不到（GitHub 不可达 / 本地读不到）→ 降级为提交 sha 对比；
 *  - 全部失败 → 「检查失败」。
 *
 * 数据统一来自 host 路由 GET /api/deepseek-usage/ventus-update/list。
 * @module dsh-deepseek-usage/client/VentusUpdateBadge
 */
/** 整合包更新入口（放在 Ventus 设置页右上角）。 */
export declare function VentusUpdateBadge(): unknown;
