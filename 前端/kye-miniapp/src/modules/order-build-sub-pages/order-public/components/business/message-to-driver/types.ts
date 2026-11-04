// 业务数据
export interface MessageToDriverData {
  aiOrderRemarkTips?: string // AI提示语
  messageToDriverList: MessageToDriver[] // 标签列表
}

type MessageToDriver = {
  sort: number //	排序
  type: string //	类型
  value: string // 标签名称
  strategyId: string
}
