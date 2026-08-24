/**
 * Ventus 整合包安装 / 更新弹窗（顶层模态）。
 *
 * 由 VentusUpdateBadge 在用户确认后打开：fixed 全屏遮罩 + 居中卡片，
 * z-index 99999（高于主题浮窗 9500 与一切既有层级）。弹窗内展示
 * 整合包全部子插件的多选清单（每项带勾选框与安装状态），仅对勾选项
 * 执行更新/安装；未勾选的已装子插件保持本机旧版不动。
 *
 * 数据与动作均走 host 路由：
 *  - GET  /api/deepseek-usage/ventus-update/list   （远程提交 + 本地清单）
 *  - POST /api/deepseek-usage/ventus-update/apply  （{ selected } 执行更新）
 * @module dsh-deepseek-usage/client/VentusUpdateModal
 */
/** 顶层安装/更新模态。 */
export declare function VentusUpdateModal(props: {
    onClose: () => void;
}): unknown;
