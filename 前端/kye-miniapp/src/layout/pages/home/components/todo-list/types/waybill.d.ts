export type Waybill = {
  /**
   * 实际重量
   */
  actualWeight?: string
  /**
   * 收款方式 数据字典：crm_freight_way
   */
  chargeType?: number
  /**
   * 收款方式描述
   */
  chargeTypeDesc?: string
  /**
   * 代收货款
   */
  collectAmount?: string
  /**
   * 公司应收
   */
  companyReceivable?: number
  /**
   * 件数
   */
  count?: string
  /**
   * 寄件详细地址
   */
  deliveryAddress?: string
  /**
   * 寄件区号
   */
  deliveryAreaCode?: string
  /**
   * 寄件城市
   */
  deliveryCity?: string
  /**
   * 寄件区县
   */
  deliveryDistrict?: string
  /**
   * 寄件人手机
   */
  deliveryMobile?: string
  /**
   * 寄件人(只有运单要加密)
   */
  deliveryPerson?: string
  /**
   * 寄件人电话
   */
  deliveryPhone?: string
  /**
   * 寄件省
   */
  deliveryProvince?: string
  /**
   * 寄件公司
   */
  deliveryCustomerName?: string
  /**
   * 寄件公司编码
   */
  deliveryCustomerCode?: string
  /**
   * 下单来源 数据字典 oms_order_source
   */
  orderSource?: string
  /**
   * 单据来源 数据字典 oms_waybill_source
   */
  waybillSource?: string
  /**
   * 计费重量
   */
  freightWeight?: string
  /**
   * 货好时间
   */
  goodsTime?: string
  /**
   * 托寄物
   */
  goodsType?: string
  /**
   * 收方仓库
   */
  inWareHouseName?: string
  /**
   * 仓库类型  crm_value_add_warehouse_to
   */
  inWareHouseType?: number
  /**
   * 声明价值
   */
  insuranceValue?: string
  /**
   * 下单编码
   */
  orderNumber?: string
  /**
   * 下单备注
   */
  orderRemark?: string
  /**
   * 订单状态 报单标识 10有 20无
   */
  orderStatus?: number
  /**
   * 寄方仓库
   */
  outWareHouseName?: string
  /**
   * 付款方式
   */
  payMode?: number
  /**
   * 付款方式描述
   */
  payModeDesc?: string
  /**
   * 付款客户编码
   */
  paymentCustomerCode?: string
  /**
   * 付款公司
   */
  paymentCustomer?: string
  /**
   * 收件详细地址
   */
  pickupAddress?: string
  /**
   * 收件区号
   */
  pickupAreaCode?: string
  /**
   * 收件城市
   */
  pickupCity?: string
  /**
   * 收件区县
   */
  pickupDistrict?: string
  /**
   * 收件公司
   */
  pickupCustomerName?: string
  /**
   * 收件人手机
   */
  pickupMobile?: string
  /**
   * 收件人电话
   */
  pickupPhone?: string
  /**
   * 收件省
   */
  pickupProvince?: string
  /**
   * 收件人
   */
  pickupPerson?: string
  /**
   * 寄件时间
   */
  deliveryTime?: number
  /**
   * 打印状态 10 已打印 20 未打印
   */
  printStatus?: string
  /**
   * 产品编码
   */
  productCode?: string
  /**
   * 回单份数
   */
  receiptCount?: string
  /**
   * 回单类型  10-有，20-无  tms_receipt_type_new
   */
  receiptFlag?: number
  /**
   * 回单类型描述
   */
  receiptFlagDesc?: string
  /**
   * 回单签收状态描述
   */
  receiptSignedStatusDesc?: string
  /**
   * 签收时间
   */
  receiveTime?: string
  /**
   * 签收人
   */
  receiver?: string
  /**
   * 自提地址
   */
  selfSufficiencyBranchAddress?: string
  /**
   * 服务方式
   */
  serviceMode?: number
  /**
   * 服务方式描述
   */
  serviceModeDesc?: string
  /**
   * 订单id
   */
  orderId?: string
  /**
   * 电子运单id
   */
  preWaybillId?: string
  /**
   * 运单号
   */
  waybillNumber?: string
  /**
   * 运单备注
   */
  waybillRemark?: string
  /**
   * 运单状态10 待通知取货 20 待揽件 30 待签收 40 已签收 50 已取消
   */
  waybillStatus?: number
  /**
   * 运单状态描述待通知取货 待揽件 待签收 已签收 已取消
   */
  waybillStatusDesc?: string
  /**
   * 退拦单类型 ，10-退回，20-转寄， 其他情况返回空
   */
  orderReturnType?: string
  /**
   * 退拦单类型描述， 有时覆盖 运单状态
   */
  orderReturnDesc?: string
  /**
   * 包装服务
   */
  woodenFrameFlag?: number
  /**
   * 包装服务描述
   */
  woodenFrameFlagDesc?: string
  /**
   * 是否需支付 0-否 1-是
   */
  canNeedPay?: number
  /**
   * 货物保管费 10已产生、20即将产生、30无
   */
  storageFeeStatus?: number
  /**
   * 货物保管费 10已产生、20即将产生、30无
   */
  storageFeeStatusDesc?: string
  /**
   * 能否催派 0-不可以 1-可以
   */
  canExpediting?: number
  /**
   * 能否恢复派送 0 不可以 1可以
   */
  canResumeDelivery?: number
  /**
   * 是否可以评价 0-不能评价  1-可以评价 2-不能评价(超过评价时效) 3-登录用户为内部员工,不可评价
   */
  scoreStatus?: number
  /**
   * 评价提示 有效3天，有效2天，有效1天，已过期，无提示
   */
  scoreTips?: string
  /**
   * 是否可以查看评价 0-不能查看评价 1-查看评价
   */
  scoreQueryStatus?: number
  /**
   * 是否可以修改评价 0-不可修改评价 1-可以修改评价
   */
  scoreModifyStatus?: number
  /**
   * 能否再来一单 0-不可以 1-可以
   */
  canAnotherOrder?: number
  /**
   * 能否取消运单订单 0-不可以 1-可以
   */
  canCancel?: number
  /**
   * 能否修改运单订单 0-不可以 1-可以
   */
  canModify?: number
  /**
   * 国际件能否修改运单 0-不可以 1-可以
   */
  canModifyInternation?: number
  /**
   * 国际件能否取消运单 0-不可以 1-可以
   */
  canCancelInternation?: number
  /**
   * 是否有寄件码 0-否 1-是
   */
  hasDeliveryCode?: number
  /**
   * 是否有网点自提 0-否 1-是
   */
  hasSelfMention?: number
  /**
   * 是否有客服按钮 0-否 1-是
   */
  hasCustomerService?: number
  /**
   * 是否有下载回单按钮 0-否 1-是
   */
  hasDownloadReceipt?: number
  /**
   * 能否催取 0-不可以 1-可以
   */
  canTake?: number
  /**
   * 是否仅为取货联系人 0-不是 1-是
   */
  isPickupContactPerson?: number
  /**
   * 是否签收确认 0-不可签收 1-可以签收
   */
  signReceiptConfirm?: number
  /**
   * 下单人手机
   */
  orderMobile?: string
  /**
   * 签收手机
   */
  signMobile?: string
  /**
   * 最新外部路由信息
   */
  newExteriorRouteInfo?: {
    /**
     * 路由描述
     */
    routeDescription?: string
    /**
     * 路由步骤 运单状态 0 待揽件 10正在安排司机 20司机正在赶来 30司机已到达 40已揽件 50运输中 60派送中 70派送异常 80已签收
     */
    routeStep?: number
    /**
     * 路由步骤字典描述
     */
    routeStepDesc?: string
    /**
     * 路由节点上传时间
     */
    uploadDate?: string
    /**
     * 送货方式  10 网点自提  20 送货上门
     */
    deliveryMode?: number
  }
  /**
   * 结算方式 数据字典 crm_finance_pay_mode
   */
  customerPayMode?: number
  /**
   * 项目名称 数据字典 tms_oms_prewaybill_project_name
   */
  projectName?: string
  /**
   * 送货方式 数据字典：tms_pre_waybill_delivery_mode
   */
  deliveryMode?: string
  /**
   * 预计派送时间
   */
  finalAging?: string
  /**
   * 预计到达时间
   */
  preArriveTime?: string
  /**
   * 取货联系人
   */
  pickupContactPerson?: string
  /**
   * 取货联系手机
   */
  pickupContactPhone?: string
  /**
   * 取货客户编码
   */
  pickupCustomerCode?: string
  /**
   * 收件手机分机号
   */
  pickupExtensionNumber?: string
  /**
   * 打印次数
   */
  printNumber?: number
  /**
   * 是否能移动端打印 0 不能打印,1 能打印
   */
  canPrint?: number
  /**
   * 是否展示派货照片按钮 0-不展示 1-展示
   */
  canShowDispatchPhoto?: number
  /**
   * 评价类型 0-取货评价 1-派货评价
   */
  scoreType?: number
  /**
   * 运单寄方
   */
  uploadDeliveryCustomer?: string
  /**
   * 母单号
   */
  parentNumber?: string
  /**
   * 子母单关系标识，10-母单，20-子单，30-即不是子单也不是母单
   */
  waybillParentInden?: number
  /**
   * 子母单合并标识,10-合并
   */
  mergeFlag?: string
  /**
   * 体积(立方米)
   */
  size?: string
  /**
   * 运单取货联系人
   */
  waybillContactName?: string
  /**
   * 运单取货联系手机
   */
  waybillContactMobile?: string
  /**
   * 运单取货联系固话
   */
  waybillContactPhone?: string
  /**
   * 外部编码和类型
   */
  waybillCustomerWaybillList?: Array<{
    /**
     * 编码类型  数据字典：tms_customer_waybill_type
     */
    customerWaybillType?: number
    /**
     * 外部编码
     */
    customerWaybillNumber?: string
    /**
     * 关联编码
     */
    associateNumber?: string
    /**
     * 外部编码名称
     */
    customerWaybillName?: string
  }>
  /**
   * 业务范围
   */
  waybillBusinessRange?: number
  /**
   * 国际件收件国家
   */
  pickupCountry?: string
  /**
   * 费用合计
   */
  totalAmount?: string
  /**
   * 运费金额
   */
  freightAmount?: string
  /**
   * 附加费用
   */
  extraAmount?: string
  /**
   * 是否有运费权限
   */
  hasPermission?: boolean
  /**
   * 路由描述
   */
  routeDescription?: string
  /**
   * 全部多行路由信息
   */
  allRouteDescription?: string
  /**
   * 派送签到+本人签收为10，否则为空
   */
  waybillSort?: number
  /**
   * 结算中心url
   */
  settlementCenterUrl?: string
  /**
   * 限制类别 数据字典：map_warn_basic_data_reason
   */
  limitReason?: number
  /**
   * 限制类别 数据字典：map_warn_basic_data_reason
   */
  historyLimitReason?: number
  /**
   * 限制信息
   */
  noticeMessage?: string
  /**
   * 限制类型 数据字典：map_warn_restrict_type，10：限制；20：提醒；30：不限制
   */
  limitType?: number
  /**
   * 限制类别 数据字典：map_warn_basic_data_reason
   */
  limitCategory?: number
  /**
   * 限制信息
   */
  limitMessage?: string
  /**
   * 客户是否确认签收 10：是 其他：否
   */
  receiptConfirmFlag?: number
  /**
   * 限制取消标识 10-正常,20-解除限制-30未解除限制(TMS 10是)
   */
  limitCancelFlag?: number
  /**
   * 调价标识(调价后台) 10 是 20 否
   */
  adjustPriceFlag?: number
  /**
   * 报关入仓标识(客户同意报关入仓) 10 是 20 否
   */
  clearanceStorageFlag?: number
  /**
   * 司机确认标识 10 是 20 否
   */
  driverConfirmFlag?: number
  /**
   * 报关调价提示语
   */
  adjustPriceTips?: string
  /**
   * 报关管控标识 10-入仓异常 20-入仓提醒 30-非下单人无权限或运单状态非待揽件或待签收 40-未命中
   */
  clearanceControlFlag?: number
  /**
   * 列表展示类型
   */
  showWatermarkType?: number
  /**
   * 列表展示文案
   */
  showPaperwork?: string
  /**
   * 历史限制类别 数据字典：map_warn_basic_data_reason
   */
  historyLimitCategory?: number
  /**
   * 调价下单状态(10：待审核, 20：同意调价, 30：限制下单, 40：忽略调价, 50 已撤销, 60 已下单)
   */
  adjustPriceState?: number
  /**
   * 调价下单温馨提示富文本,eg. 因贵司加个过低, 运单正在审核中,审核后方可下单, 可联系您的商务了解详情
   */
  adjustPriceRichTips?: string
  /**
   * 资料上传状态 10 查看资料 20 上传资料
   */
  certificateUploadState?: number
  /**
   * 尺寸字段是否加密 10-加密 20-不加密
   */
  encryptGoodsSize?: number
  /**
   * 本运单是否加密 10-加密 20-不加密
   */
  encryptWaybill?: number
  /**
   * 140 待通知派送  150待通知发运
   */
  deliveryControlType?: number
  /**
   * 查件列表运单是否是回单
   */
  isReceipt?: number
  /**
   * 运单类型 10正常运单 20回单运单 30发票运单
   */
  waybillType?: number
  /**
   * 申请状态 10 申请中 20 已完成 30 撤销
   */
  applyStatus?: number
  /**
   * 是否出仓调价标识, 10 是; 20 否
   */
  outAdjustPriceFlag?: string
  /**
   * 客户是否同意出仓调价标识, 10 是; 20 否
   */
  adjustPriceConfirmFlag?: string
  /**
   * 操作确认出仓标识, 10 是; 20 否
   */
  operateConfirmFlag?: string
  /**
   * 实绑订单下单手机
   */
  reportOrderMobile?: string
  /**
   * 分享标识
   */
  shareFlag?: string
  /**
   * 回单对应的客户运单号
   */
  receiptWaybillNumberList?: string
  /**
   * 回单提供方, 10-收方提供，20-寄放提供（默认选项）
   */
  receiptProvider?: string
  /**
   * 经手单号（回单）
   */
  handleNumber?: string
  /**
   * 经手单号（回单状态）
   */
  handleWaybillStatus?: string
  /**
   * 空转陆标识
   */
  airToLandFlag?: string
  /**
   * 控货标识,数据字典：tms_follow_goods_control_flag
   */
  goodsControlFlag?: string
  /**
   * 已改派送标识 10：是  其他：否
   */
  finalAgingChangeFlag?: string
  /**
   * 已改货好标识   10：是  其他：否
   */
  goodsTimeChangeFlag?: string
  /**
   * 下单人标签
   */
  orderLabel?: string
  /**
   * 寄件人标签
   */
  deliveryLabel?: string
  /**
   * 收件人标签
   */
  pickupLabel?: string
  /**
   * 展示标签
   */
  showLabel?: string
  /**
   * 展示标签标识
   */
  showLabelFlag?: number
  /**
   * 身份code,查看 WaybillRoleEnum
   */
  roleCode?: string
  /**
   * 运单修改状态，10-运单修改工单未完结，20-运单修改工单已完结
   */
  waybillModifyStatus?: number
  /**
   * 互联网自定义ES字段（内部使用，不返回给前端）
   */
  netCustom?: {
    /**
     * 共享标签列表，每个元素使用手机号码+特殊符合+标签拼接而成
     */
    labels?: string[]
  }
  /**
   * 配置ID
   */
  configId?: number
  /**
   * 版本ID
   */
  configVersion?: number
  /**
   * NetData
   */
  netData?: {
    /**
     * 配置下单版本
     */
    configVersionId?: string
  }
  /**
   * 下单人部门信息
   */
  orderDepartmentInfo?: string
  /**
   * 下单人部门id
   */
  orderPersonDeptId?: string
  /**
   * 寄件人部门信息
   */
  deliveryDepartmentInfo?: string
  /**
   * 寄件人部门id
   */
  deliveryPersonDeptId?: string
  /**
   * 收件人部门信息
   */
  pickupDepartmentInfo?: string
  /**
   * 收件人部门id
   */
  pickupPersonDeptId?: string
  /**
   * 寄件人仓库名称
   */
  deliveryWarehouseName?: string
  /**
   * 寄件人仓库id
   */
  locationId?: string
  /**
   * 收件人仓库名称
   */
  pickupWarehouseName?: string
  /**
   * 收件人仓库id
   */
  pickupLocationId?: string
  /**
   * 等通知派货服务 10指定时间派送 20待通知派送
   */
  deliveryServiceType?: string
  /**
   * 等通知派货服务
   */
  waitNotification?: string
  /**
   * 派货评价信息
   */
  addPickupScoreFlag?: number
  /**
   * 取货评价信息
   */
  addDeliveryScoreFlag?: number
  /**
   * 派货评价提示
   */
  addPickupScoreTips?: string
  /**
   * 派货评价提示
   */
  addDeliveryScoreTips?: string
  /**
   * 修改派货评价信息
   */
  modifyPickupScoreFlag?: number
  /**
   * 修改取货评价信息
   */
  modifyDeliveryScoreFlag?: number
  /**
   * 查看取货评价
   */
  viewDeliveryScoreFlag?: number
  /**
   * 查看派货评价
   */
  viewPickupScoreFlag?: number
  /**
   * 提醒类型，10未付款提醒（不限制派送）、20控货提醒（限制派送）、30（点部控货提醒，限制派送）、40（取消控货提醒，不限制派送）
   */
  goodsControlRemindType?: number
  /**
   * 是否展示收件展会信息，0不展示、1只展示 2展示和编辑
   */
  showExhibitionStatus?: number
  /**
   * 收件会展编码
   */
  pickupExhibitionCode?: string
  /**
   * 收件展馆号
   */
  pickupExhibitionHallNumber?: string
  /**
   * 收件展位号
   */
  pickupExhibitionSiteNumber?: string
  /**
   * 时效批次号，有效申请处理中的才返回，无效申请或者已经完结的不返回
   */
  batchNo?: string
  /**
   * 时效申请状态，10为申请中，空或空串为非申请中
   */
  agingApplyStatus?: number
  /**
   * 修改前货好时间
   */
  goodsTimeBefore?: string
  /**
   * 修改后货好时间
   */
  goodsTimeAfter?: string
  /**
   * 回单要求
   */
  receiptRequirement?: string
  /**
   * 上次在i聊 0不可以 1可以
   */
  canUploadInfo?: number
  /**
   * 查看上次资料  0不可以 1可以
   */
  canReviewInfo?: number
  /**
   * 优惠券信息
   */
  coupon?: {
    /**
     * 优惠券类型：０-免单券,10-账单券, 20-下单券,30-代金券
     */
    couponType?: number
    /**
     * 优惠券描述简称
     */
    couponShortDesc?: string
    /**
     * 优惠金额
     */
    discountAmount?: number
    /**
     * 是否全额抵扣 1是 0 否
     */
    fullDeductionStatus?: number
  }
  /**
   * 10网点自寄、20司机上门取货
   */
  pickupMode?: number
  /**
   * 是否可以发起通知取货，1为是，0为否
   */
  canNoticePickup?: number
  /**
   * 是否可以修改货好时间，1为是，0为否
   */
  canModifyGoodsTime?: number
  /**
   * 是否整车
   */
  vehicleToken?: string
}
