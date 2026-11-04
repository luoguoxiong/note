/**
 * @description 货物信息最大数量
 */
export enum productCountMax {
  '件数' = 9999,
}

/**
 * @description 单件重量上限(kg)
 */
export enum productSingleWeightMax {
  '重量' = 60000,
}

/**
 * @description 货物信息最大组
 */
export enum maxOfGroup {
  '最大' = 20,
}

/**
 * @description 托寄物标签类型
 */
export const GOODS_INFO_SOURCE_MAP = {
  1: '历史备注',
  2: 'AI推荐',
  3: '下单配置',
}
