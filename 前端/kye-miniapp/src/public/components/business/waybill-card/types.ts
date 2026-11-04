export interface IBaseFlag {
  /** 功能按钮是否展示，true为展示，false为不展示 */
  showStatus: boolean
  /** 操作类型，0查看 1新增 2修改（具体操作类型根据各自功能的权限单独定义） */
  operateStatus: number
  /** 操作类型对应文案 */
  operateStatusText: string
  /** 标题 */
  title: string
  /** 展示内容（文案、链接等等，对于具体的展示动作由前端根据功能去决定） */
  showText: string
  /** 角标（这里专门用于需要展示角标图片的场景，但使用场景跟展示内容有重合，只有同时有展示内容和角标的场景才可能有值） */
  cornerMark: string
  /** 附加参数，非通用场景使用的扩展参数，用于自定义特殊场景的字段 */
  extra: {
    /** 申请时间 */
    applyTime: string
    /** 10审核中、30审核失败 */
    applyStatus: string
    /** 审核状态文本 */
    applyStatusText: string
    /** 审核状态提示文案 */
    applyStatusTips: string
    /** 变更内容 */
    changeContent: string
    /** 失败原因 */
    failReason: string
    /** 收件会展编码 */
    pickupExhibitionCode: string
    /** 收件展馆号 */
    pickupExhibitionHallNumber: string
    /** 收件展位号 */
    pickupExhibitionSiteNumber: string
    /** 展示内容 */
    showText: string
  }
}
export interface ISearchWeb {
  /** 运单信息 */
  waybill: {
    /** 运单寄方信息 */
    delivery: {
      /** 姓名 */
      person: string
      /** 手机号 */
      mobile: string
      /** 电话 */
      phone: string
      /** 公司名 */
      customerName: string
      /** 运单寄方 */
      deliveryCustomerName: string
      /** 客户编码 */
      customerCode: string
      /** 省 */
      province: string
      /** 城市 */
      city: string
      /** 用于电子存根城市展示 */
      maskCity: string
      /** 区县 */
      district: string
      /** 区号 */
      areaCode: string
      /** 详细地址 */
      address: string
      /** 经度 */
      longitude: string
      /** 纬度 */
      latitude: string
      /** 仓库名称 */
      warehouseName: string
      /** 部门名称 */
      departmentName: string
      /** 部门编码 */
      departmentCode: string
    }
    /** 运单收方信息 */
    pickup: {
      /** 姓名 */
      person: string
      /** 手机号 */
      mobile: string
      /** 手机分机号 */
      extensionNumber: string
      /** 电话 */
      phone: string
      /** 公司名 */
      customerName: string
      /** 客户编码 */
      customerCode: string
      /** 省 */
      province: string
      /** 城市 */
      city: string
      /** 用于电子存根城市展示 */
      maskCity: string
      /** 区县 */
      district: string
      /** 区号 */
      areaCode: string
      /** 地址 */
      address: string
      /** 经度 */
      longitude: string
      /** 纬度 */
      latitude: string
      /** 仓库名称 */
      warehouseName: string
      /** 部门名称 */
      departmentName: string
      /** 部门编码 */
      departmentCode: string
      /** 国家 */
      country: string
    }
    /** 下单信息 */
    orderInfo: {
      /** 姓名 */
      person: string
      /** 手机号 */
      mobile: string
      /** 部门名称 */
      departmentName: string
      /** 部门编码 */
      departmentCode: string
    }
    /** 运单基础信息 */
    baseInfo: {
      /** 订单id */
      orderId: string
      /** 电子运单id */
      preWaybillId: string
      /** 运单号 */
      waybillNumber: string
      /** 母单号 */
      parentNumber: string
      /** 订单号 */
      orderNumber: string
      /** 运单状态10 待通知取货 20 待揽件 30 待签收 40 已签收 50 已取消 */
      waybillStatus: number
      /** 运单状态描述待通知取货 待揽件 待签收 已签收 已取消 */
      waybillStatusDesc: string
      /** 订单状态 报单标识 10有 20无 */
      orderStatus: number
      /** 货好时间戳 */
      goodsTime: string
      /** 预计送达时间戳 */
      preArriveTime: string
      /** 寄件时间戳 */
      deliveryTime: string
      /** 签收时间戳 */
      receiveTime: string
      /** 托寄物 */
      goodsType: string
      /** 实际重量 */
      actualWeight: string
      /** 收款方式 数据字典：crm_freight_way */
      chargeType: number
      /** 收款方式描述 */
      chargeTypeDesc: string
      /** 代收货款 */
      collectAmount: string
      /** 公司应收 */
      companyReceivable: number
      /** 件数 */
      count: string
      /** 创建时间戳 */
      creationDate: string
      /** 下单来源 数据字典 oms_order_source */
      orderSource: string
      /** 单据来源 数据字典 oms_waybill_source */
      waybillSource: string
      /** 计费重量 */
      freightWeight: string
      /** 服务方式 */
      serviceMode: number
      /** 服务方式描述 */
      serviceModeDesc: string
      /** 声明价值 */
      insuranceValue: string
      /** 付款方式 */
      payMode: number
      /** 付款方式描述 */
      payModeDesc: string
      /** 付款方式文案（数据字典 OMS_PAY_MODE 粗粒度：寄方付/收方付/第三方付，加密时为 ***） */
      payModeText: string
      /** 付款客户编码 */
      paymentCustomerCode: string
      /** 付款公司 */
      paymentCustomer: string
      /** 打印状态 10 已打印 20 未打印 */
      printStatus: string
      /** 产品编码 */
      productCode: string
      /** 回单份数 */
      receiptCount: string
      /** 回单类型 10-有，20-无 tms_receipt_type_new */
      receiptFlag: number
      /** 回单类型描述 */
      receiptFlagDesc: string
      /** 回单签收状态描述 */
      receiptSignedStatusDesc: string
      /** 签收人 */
      receiver: string
      /** 自提地址 */
      selfSufficiencyBranchAddress: string
      /** 运单备注 */
      waybillRemark: string
      /** 下单备注 */
      orderRemark: string
      /** 包装服务 */
      woodenFrameFlag: number
      /** 包装服务描述 */
      woodenFrameFlagDesc: string
      /** 签收手机 */
      signMobile: string
      /** 结算方式 数据字典 crm_finance_pay_mode */
      customerPayMode: number
      /** 项目名称 数据字典 tms_oms_prewaybill_project_name */
      projectName: string
      /** 送货方式 数据字典：tms_pre_waybill_delivery_mode */
      deliveryMode: string
      /** 预计派送时间戳 */
      finalAging: string
      /** 打印次数 */
      printNumber: number
      /** 子母单关系标识，10-母单，20-子单，30-即不是子单也不是母单 */
      waybillParentInden: number
      /** 子母单合并标识,10-合并 */
      mergeFlag: string
      /** 体积(立方米) */
      size: string
      /** 运单取货联系人 */
      waybillContactName: string
      /** 运单取货联系手机 */
      waybillContactMobile: string
      /** 运单取货联系固话 */
      waybillContactPhone: string
      /** 取消时间戳 */
      updationDate: number
      /** 业务范围 */
      waybillBusinessRange: number
      /** 费用合计 */
      totalAmount: string
      /** 运费金额 */
      freightAmount: string
      /** 附加费用 */
      extraAmount: string
      /** 运单类型 10正常运单 20回单运单 30发票运单 40内部件运单 */
      waybillType: number
      /** 回单对应的客户运单号 */
      receiptWaybillNumberList: string
      /** 回单提供方, 10-收方提供，20-寄放提供（默认选项） */
      receiptProvider: string
      /** 经手单号（回单） */
      handleNumber: string
      /** 经手单号（回单状态） */
      handleWaybillStatus: string
      /** 配置ID */
      configId: number
      /** 版本ID */
      configVersion: number
      /** 回单要求 */
      receiptRequirement: string
      /** 10网点自寄、20司机上门取货 */
      pickupMode: number
    }
  }
  /** 最新外部路由信息 */
  newExteriorRouteInfo: {
    /** 路由描述 */
    routeDescription: string
    /** 路由步骤 运单状态 0 待揽件 10正在安排司机 20司机正在赶来 30司机已到达 40已揽件 50运输中 60派送中 70派送异常 80已签收 */
    routeStep: number
    /** 路由步骤字典描述 */
    routeStepDesc: string
    /** 路由节点上传时间 */
    uploadDate: string
    /** 送货方式 10 网点自提 20 送货上门 */
    deliveryMode: number
  }
  /** 外部编码和类型 */
  waybillCustomerWaybillList: {
    /** 编码类型 数据字典：tms_customer_waybill_type */
    customerWaybillType: number
    /** 外部编码 */
    customerWaybillNumber: string
    /** 关联编码 */
    associateNumber: string
    /** 外部编码名称 */
    customerWaybillName: string
  }[]
  /** 功能权限信息 */
  functionInfo: {
    /** 是否需支付 */
    canNeedPay: CanNeedPay
    /** 能否催派 */
    canExpediting: IBaseFlag
    /** 能否再来一单 0-不可以 1-可以 */
    canAnotherOrder: IBaseFlag
    /** 能否取消运单订单（包含国际件能否修改运单） */
    canCancel: IBaseFlag
    /** 能否修改运单订单（包含国际件能否修改运单） */
    canModify: IBaseFlag
    /** 能否催取 */
    canTake: IBaseFlag
    /** 是否签收确认 */
    signReceiptConfirm: IBaseFlag
    /** 是否能移动端打印 */
    canPrint: IBaseFlag
    /** 是否展示派货照片按钮 */
    canShowDispatchPhoto: IBaseFlag
    /** 分享标识 */
    shareFlag: IBaseFlag
    /** 已改派送标识 10：是 其他：否 */
    finalAgingChangeFlag: IBaseFlag
    /** 已改货好标识 10：是 其他：否 */
    goodsTimeChangeFlag: IBaseFlag
    /** 展示标签标识 */
    showLabelFlag: IBaseFlag
    /** 取货评价信息 */
    deliveryScoreFlag: IBaseFlag
    /** 派货评价信息 */
    pickupScoreFlag: IBaseFlag
    /** 评价类型 0-取货评价 1-派货评价 */
    scoreType: number
    /** 是否展示收件展会信息 */
    pickupExhibition: {
      /** 收件会展编码 */
      pickupExhibitionCode: string
      /** 收件展馆号 */
      pickupExhibitionHallNumber: string
      /** 收件展位号 */
      pickupExhibitionSiteNumber: string
    }
    /** 时效申请状态，10为申请中，空或空串为非申请中 */
    agingApplyStatus: IBaseFlag
    /** 是否可以编辑代收人信息，0为否，1为是（客户端列表是否可以批量操作根据这个字段来判断） */
    modifyProxyPickupStatus: IBaseFlag
    /** 是否展示代收标签，0为否，1为是 */
    showProxyPickupLabel: IBaseFlag
    /** 保管费状态（如果需要展示，天数在展示内容字段里面取） */
    storageFeeStatus: IBaseFlag
  }
  /** 优惠券信息 */
  coupon: {
    /** 优惠券类型：０-免单券,10-账单券, 20-下单券,30-代金券 */
    couponType: number
    /** 优惠券描述简称 */
    couponShortDesc: string
    /** 优惠金额 */
    discountAmount: number
    /** 是否全额抵扣 1是 0 否 */
    fullDeductionStatus: number
  }
  /** 其他信息 */
  otherInfo: {
    /** 细分角色 code */
    userRoleCode: number
    /** 身份code,查看 WaybillRoleEnum */
    roleCode: string
    /** 签回联单号，可能为空，多个用英文逗号隔开 */
    signReceipt: string
    /** 子母单总件数 */
    childNumber: number
    /** 采购单号 */
    purchaseNumber: string
  }
  /** 管控提示信息 */
  tipsInfo: {
    /** 是否展示横条，true为是，false为否（showPaperwork不为空，则为true） */
    showLimitTipsStatus: boolean
    /** 限制类型，10：限制；20：提醒；30：不限制 */
    limitType: number
    /** 列表展示类型 */
    showWatermarkType: number
    /** 列表展示文案 */
    showPaperwork: string
    /** 印章类型（0解除管控 10疫情管控 20台风管控 30雨雪管控 40汛期管控 50假期管控 60春运管控 70国际会议管控 80限寄管控 90夜间管控 110调价管控 */
    sealType: number
    /** 限制类别 10疫情 20台风天气 30雨雪天气 40汛期 50假期 60春运期间 70国际大型会议 90夜间取货 80其他 100预存管控 200入仓（限制类别 数据字典：map_warn_basic_data_reason */
    limitReason: number
  }
}
