import { http } from '@public/utils/request'

/** 雅思客户判断信息 (V1.0)  */
export const getCustomerBindWaybill = (params: { waybillNo: string } = {}) => {
  return http<{
    /** 运单号 */
    waybillNo: string
    /** 运单绑定信息 */
    waybillBindInfoVo: {
      /** 状态 0-报废 2-运单号未使用 3-运单号已使用 */
      status: number
      /** 段位号 */
      randomCode: string
      /** 公司编码 */
      companyNo: string
      /** 公司名称 */
      companyName: string
      /** 公司地址 */
      companyAddress: string
      /** 绑定id */
      waybillCompanyNoBindId: number
      /** 联系电话 */
      companyMobile: string
      /** 联系人 */
      contactPerson: string
      /** 省 */
      province: string
      /** 市 */
      city: string
      /** 区 */
      district: string
      /** 创建时间 */
      createTime: string
      /** 市场名 */
      marketName: string
      /** 市场电话 */
      marketPhone: string
      /** 市场工号 */
      marketNo: string
    }
    /** 客户代号（1：雅思) */
    customerBindCode: number
  }>('web.v2.customerBindWaybill.getCustomerBindWaybill', params)
}

export const qrcodeScanQRCode = (parmas: { scanCodeText: string }) => {
  return http<{
    /** 运单信息 */
    waybillInfo: {
      /** 去除掩码后的运单号 */
      waybillNumber: string
      /** 状态编码（0.运单号报废；1.运单号无效；2.运单号未使用；3.运单号已使用） */
      statusCode: number
      /** 是否是月结客户 */
      isMonthly: string
      /** 客户类型 */
      customerType: string
      /** 客户编码 */
      companyNo: string
      /** 客户id */
      companyId: string
      /** 公司名称 */
      companyName: string
      /** 是否提示用户绑定客户编码（0否；1是） */
      isNeedBind: string
      /** 是否大闸蟹客户 */
      isDazaxie: string
      /** 是否允许下单，是：10，否20,默认10 */
      allowToOrderFlag: string
      /** 是否允许付款，是：10，否20,默认10 */
      allowToPayFlag: string
      /** 客户类型（1.b2b客户；2.b2c客户） */
      companyType: string
      /** 所属行业(crm_company_type) */
      belongIndustry: string
      /** 六个月是否过期 */
      beoverdue: boolean
      /** 签收时间 */
      receiveDate: number
      /** 核销码 */
      verificCodeFlag: string
      /** 是否属于枇杷 */
      isBelongLoquat: string
      /** 负责人市场员 */
      contacterName: string
      /** 负责人电话 */
      contactPhone: string
      /** 客户类型 */
      kyeCustomerType: string
      /** 默认保价 */
      defaultInsurancePrice: string
      /** 收回单费 */
      recoveryReceiptFlag: string
      /** 到唯品会否(common_yes_no)10-是，20-否 */
      vipshopFlag: string
      /** 仓库类型 crm_value_add_warehouse_to 10-京东,20-菜鸟，30-苏宁，40-盒马，50-到其它 */
      otherWarehouseType: string
      /** 是否允许修改寄件公司(common_yes_no)，默认为否。10-是，20-否 */
      modifyShipperFlag: string
      /** 省份 */
      province: string
      /** 城市 */
      city: string
      /** 区县 */
      district: string
      /** 街道乡镇 */
      street: string
      /** 村社区 */
      village: string
      /** 门牌号 */
      doorNumber: string
      /** 详细地址 */
      address: string
      /** 是否游客 0-否 1-是 */
      visitorFlag: number
      /** 运单状态 0待揽件 10正在安排司机 20司机正在赶来 30司机已到达 40已揽件 50运输中 60派送中 70派送异常 80已签收 90下单成功，请尽快投递 100待通知取货 */
      waybillStatus: number
    }
    /** 定单信息 */
    orderInfo: {
      /** 下单人 */
      orderName: string
      /** 下单手机 */
      orderMobile: string
      /** 取货地址 */
      address: string
      /** 取货省 */
      province: string
      /** 取货市 */
      city: string
      /** 取货区县 */
      zone: string
      /** 取货联系人 */
      contactName: string
      /** 取货联系方式 */
      contactPhone: string
      /** 下单公司编码 */
      customerCode: string
      /** 下单公司名称 */
      customerName: string
      /** 下单编码状态 oms_operate_state */
      orderStatus: string
    }
    /** 二维码类型(1运单 2定单) */
    qrCodeType: number
  }>('web.order.scanQrCode', parmas)
}
