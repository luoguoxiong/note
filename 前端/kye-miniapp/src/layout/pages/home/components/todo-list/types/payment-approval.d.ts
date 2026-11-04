export type PaymentApproval = {
  /**
   * 付款授权申请明细表id
   */
  id?: number
  /**
   * 批次号
   */
  batchNo?: string
  /**
   * 授权类型(10公司授权  20：个人授权 30运单授权)
   */
  authType?: number
  /**
   * 授权类型描述
   */
  authTypeDesc?: string
  /**
   * 申请类型 10：运单申请  20 公司申请  30：个人申请 40：给公司授权 50：给个人授权
   */
  applicationType?: number
  /**
   * 子授权类型 10：给公司授权-指定公司  20：给公司授权-所有公司
   */
  subApplicationType?: number
  /**
   * 授权状态 10：待审批 20：已授权已同意 30：已拒绝  40：已解除 50：已撤销
   */
  authStatus?: number
  /**
   * 授权范围(10：本次所有运单 20：寄方寄出 30寄方个人寄出 40：寄方寄给收方 50寄方寄给个人)
   */
  authLevel?: number
  /**
   * 申请公司编码
   */
  applyCustomerCode?: string
  /**
   * 寄件公司名称
   */
  applyCustomerName?: string
  /**
   * 收件公司名称
   */
  recipientCustomerName?: string
  /**
   * 付款公司名称
   */
  payCustomerName?: string
  /**
   * 付款公司编码
   */
  payCustomerCode?: string
  /**
   * 申请人，运单申请时有效
   */
  applicant?: string
  /**
   * 申请人
   */
  applyName?: string
  /**
   * 申请人手机
   */
  applyMobile?: string
  /**
   * 申请日期
   */
  applyDate?: number
  /**
   * 审批人姓名
   */
  authName?: string
  /**
   * 审批人手机号
   */
  authMobile?: string
  /**
   * 审批（授权）时间
   */
  authDate?: number
  /**
   * 解除人姓名
   */
  unAuthName?: string
  /**
   * 解除人手机号
   */
  unAuthMobile?: string
  /**
   * 解除时间
   */
  unAuthDate?: number
  /**
   * 被授权公司简称
   */
  grantAuthCustomerName?: string
  /**
   * 被授权公司客户编码
   */
  grantAuthCustomerCode?: string
  /**
   * 被授权人姓名
   */
  grantAuthName?: string
  /**
   * 被授权人手机号
   */
  grantAuthMobile?: string
  /**
   * 授权范围描述
   */
  authLevelDesc?: string
  /**
   * 批次号下的运单数
   */
  waybillCount?: number
  /**
   * 运单编号列表
   */
  waybillNumList?: string[]
  /**
   * 是否商务发起的申请，1-是，0-否
   */
  isEmpApply?: number
  /**
   * 是否商务审批，1-是，0-否
   */
  isEmpAuth?: number
  /**
   * 付款方式(10收方付 20第三方付 30收方付+第三方付)
   */
  payType?: number
  /**
   * 撤回时间
   */
  revokeDate?: number
  /**
   * 备注
   */
  remarks?: string
  /**
   * 是否可以再次授权，0-不展示按钮 ，1-展示且可操作 ，2-展示且置灰
   */
  canReGrant?: number
  /**
   * 再次授权置灰提示语
   */
  reGrantTip?: string
  /**
   * 是否可以再次申请，0-不展示按钮 ，1-展示且可操作 ，2-展示且置灰
   */
  canReApply?: number
  /**
   * 再次申请置灰提示语
   */
  reApplyTip?: string
  /**
   * 重授权类型，40：给公司授权 50：给个人授权
   */
  reGrantType?: number
  /**
   * 是否可以解除授权，0-否 ，1-是
   */
  canUnAuth?: number
  /**
   * 操作时间（根据当前状态取对应的时间）
   */
  operateDate?: number
  /**
   * 授权范围描述
   */
  grantRangeDesc?: string
  /**
   * 服务方式描述
   */
  serviceModesDesc?: string
}
