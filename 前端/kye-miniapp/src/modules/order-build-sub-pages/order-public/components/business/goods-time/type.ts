export interface PickTime {
  text: string
  value: string
  children?: PickTime[]
}

export enum EGoodsTimeHindMap {
  显示 = '10',
  不显示 = '20',
}
