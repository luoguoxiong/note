/**
 * @description: 权限申请标识
 */
export const FeeAuthApplyStatus = {
  申请查看: 0,
  申请中: 1,
  申请失败: 2,
} as const

/**
 * @description: 下单页来源标记（sourcePage）
 */
export enum SourcePage {
  '展会扫码' = 'exhibitionScan',
}

