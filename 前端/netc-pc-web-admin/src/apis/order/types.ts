/** 下单权限校验结果（web.order.auth.getOrderTips） */
export interface OrderTips {
  checkResultList: Array<{
    /** true = 无下单权限（被拦截） */
    blockedFlag: boolean
    /** 弹窗文案（后端直出） */
    content: string
    extraData?: {
      /** haveApply：'10' 需要申请（弹「立即申请」）；'20' 无需申请/审核中（弹「我知道了」） */
      haveApply?: {
        haveApply?: string
        /** 审核人姓名（申请成功 toast 用） */
        authPersonName?: string
      }
    }
  }>
}
