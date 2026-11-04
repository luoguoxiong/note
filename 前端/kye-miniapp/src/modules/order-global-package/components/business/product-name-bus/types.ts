export interface LinkGoodsItem {
  goodsCode: string
  goodsType: string
  secondCategory?: string
}

export interface RestrictTipItem {
  type: number | string
  msg: string
  iconName?: string
  className?: string
}

export interface RestrictSubPropertyItem {
  code: string
  name: string
}

export interface RestrictPropertyItem {
  code: string
  name: string
  require?: boolean
  dataValidate?: string
  elementId?: string
  subPropertyList: RestrictSubPropertyItem[]
}

export interface MatchItem {
  code: string
  value: string
}

export interface RestrictData {
  tips?: RestrictTipItem[]
  goodsRestrictPropertyList?: RestrictPropertyItem[]
}

export interface SlideTagDetail {
  tagName: string
  strategyId?: string
  waybillLogId?: string
  type?: number
}
