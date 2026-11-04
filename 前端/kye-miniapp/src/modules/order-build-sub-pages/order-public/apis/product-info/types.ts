import { GoodsSupplementEnum } from '@order-public-sub-public/types'

export interface LinkGoods {
  goodsCode: string
  goodsType: string
  firstCategoryId: string
  secondCategoryId: string
  firstCategory: string
  secondCategory: string
  nature: number
  transportFlag: number
}

export enum OverLengthWeightType {
  超重 = 10,
  超长 = 20,
  超长超重 = 30,
}

export interface GoodsExtends {
  oldGoods: GoodsSupplementEnum
  nudedGoods: GoodsSupplementEnum
}

export interface GoodsInfo {
  goodsType: string
  goodsCode: string
  count: number
  volumeSize: number
  actualWeight: number
  waybillGoodsSizes: GoodsSize[]
  overLength: number
  overWeight: number
  overLengthFee: number
  overWeightFee: number
  overWeightTips: string | number
  overLengthTips: number
  agent?: { agentOverTips: string; agentTipType: string } | null
  skuId: string
  isDefault: boolean
  overLengthTip?: { index: number | string; overLengthAmount: number; overLengthTips: string }[]
  overLengthWeightType?: OverLengthWeightType
  goodsExtends?: GoodsExtends
}

export interface GoodsSize {
  length: number
  width: number
  height: number
  count: number
  singleWeight?: number //单件重量(kg)
}

export interface OverLengthAndWeightFee {
  agent?: { agentOverTips: string; agentTipType: string } | null
  overLengthTip: { index: number | string; overLengthAmount: number; overLengthTips: string; goodsSizeDesc?: string }[]
  overWeightTips: string
  goodsWeightDesc?: string
  billableWeight: { estimateWeight: string; grossWeightTips: string }
  goodsTimeOptimiTips: string
}

export interface HistoryGoodsSize {
  id?: string
  length?: string
  width: string
  height: string
  count: number
  singleWeight?: string //单件重量(kg)
}

export interface HistorySize {
  batchSizeList: HistorySizeList[]
}

export interface HistorySizeByPage {
  pageTotal: number
  rowTotal: number
  pageSize: number
  page: number
  rows: HistorySizeList[]
}

export interface HistorySizeList {
  batchId: number
  goodsSizes: HistoryGoodsSize[]
  sourceId: number
  goodsName: string
}

export interface SelectSize {
  id: string
  goodsType: string
  goodsWeight: string
  fragileGoodsFlag: string
  goodsLength: string
  goodsWidth: string
  goodsHeight: string
  /** CRM 客户后台同步数据标识（有此标识的数据不支持删除），具体字段名以后端返回为准 */
  crmFlag?: boolean
  /** 是否可删除标识：true 正常可删，其他场景置灰不可删除 */
  deleteEnable?: boolean
}

export interface PageSelectSize {
  rows: SelectSize[]
  rowTotal: number
  pageTotal: number
  page: number
  pageSize: number
}

/** 我的尺寸操作标记 */
export interface CustomerSkuInfo {
  /** 我的尺寸是否可操作，true-可操作，false-不可操作 */
  mySizeOptFlag: boolean
}

/** 我的尺寸新增项 */
export interface CustomerSkuItem {
  id?: number
  /** 托寄物名称 */
  goodsName: string
  /** 尺寸信息 */
  goodsSizes: HistoryGoodsSize[]
}

/** 我的尺寸新增入参 */
export interface CustomerSkuSaveParams {
  sizeList: CustomerSkuItem[]
}
