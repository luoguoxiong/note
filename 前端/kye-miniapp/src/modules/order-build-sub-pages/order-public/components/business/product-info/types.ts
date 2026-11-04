import { FieldsConfig } from '@order-public-sub-public/types'

export type SubComponentsProps = FieldsConfig & {
  moduleStyle: string | undefined
}

export enum GoodsTypeRestrictEnum {
  '包装类型' = 'originalPackageFlag',
  '电池' = 'includes_10',
}

export const NatureMap: Record<number, string> = {
  1: '生鲜',
  2: '易碎',
  3: '危险品',
  4: '贵重物品',
  5: '异性货物、不规则货物类',
  6: '液体',
  7: '气体',
  8: '常规',
  9: '含锂电池',
  10: '含磁性',
  11: '粉末',
  12: '膏状',
  13: '含电池',
}

export enum AgentTipType {
  'OVERLENTH' = '10', // 超长
  'OVERWEIGHT' = '20', // 超重
  'OVERLENTHANDWEIGHT' = '30', // 超长又超重
}
