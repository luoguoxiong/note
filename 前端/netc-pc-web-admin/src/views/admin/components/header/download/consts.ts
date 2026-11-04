/**
 * 下载中心相关常量
 * 来源: netc-pc-web/src/consts/downloadCenter.js (仅下载中心组件群使用的常量)
 */

/** 任务压缩状态，0初始 1压缩中 2压缩完成 3失败 */
export const TASK_STATUS_VAL: Record<string, number> = {
  INIT: 0,
  COMPRESSING: 1,
  COMPRESS_SUCCESS: 2,
  COMPRESS_FAIL: 3,
}

/** 消息接口最大轮训次数 */
export const NOTIFICATION_MAX_POLLING_COUNT = 720

/** 下载api扩展名映射 */
export const DOWNLOAD_API_EXTEND_NAME_MAP: Record<string, string> = {
  xls: 'excel',
  xlsx: 'excel',
}
