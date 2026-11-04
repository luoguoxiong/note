export interface AiClipboardRemindSettingIn {
  /**
   * 是否不再提醒, true: 不再提醒; false: 恢复提醒
   */
  noRemind: boolean
  /**
   * 不再提醒天数（默认使用配置）
   */
  days?: number
}
