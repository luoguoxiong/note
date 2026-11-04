// 业务数据
export interface WaybillRemarkData {
  aiWaybillRemarkTips?: string //	AI提示语
  waybillRemarkList: WaybillRemark[] //	运单备注列表
}
type WaybillRemark = {
  sort: number //	排序
  type: string //	类型
  value: string // 标签名称
  strategyId: string
}

// 提交数据
