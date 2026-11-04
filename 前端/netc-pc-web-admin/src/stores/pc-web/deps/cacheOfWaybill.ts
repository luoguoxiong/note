/**
 * 旧基座(netc-pc-web) cacheOfWaybill 适配层
 * 来源: netc-pc-web/src/utils/cacheOfWaybill.js
 *
 * 使用场景:
 *  - client Pinia store 的打印相关 action 内部调用(打印配置/面单加密/打印模板)
 *  - 保持与旧基座一致的数据加工逻辑(加密文本转换等)
 *  - 接口由 deps/api 提供
 *
 * 【2026-09 删除】(含相关引用, 权限/付款方式/默认要求中转改为 client action 直连 deps/api):
 *  - getUserPermission/getUserPermissionNew(权限中转, client.setPermissionAction 直连 api)
 *  - getPaymentTypes(付款方式中转, client.setPaymentTypeListAction 直连 api)
 *  - getRequirementConfig(下单要求中转, client.setRequirementsAction 直连 api)
 *  - getSystemConfig/getHistorySkuList/getGoodsBatchTimes/getNewServiceWays/getNewPayCustomerInfo
 *    (随 client 对应 action 删除, api 的 getSystemConfigApi/querySkuList/getGoodsBatchTimesApi/
 *    getCustomerServiceTypes/getPayCustomerList 一并删除)
 */
import { getEncryptInfo, getPrintConfigApi, getTemplateListApi } from './api'

/**
 * 打印面单加密字段列表转加密字符串
 * 来源: netc-pc-web/src/utils/clientUtil.js convertEncryptListToString
 */
export const convertEncryptListToString = (fieldsList: any[] | undefined | null): string | undefined => {
  if (!fieldsList || fieldsList.length < 1) {
    return
  }
  const dict: Record<string, string> = {
    10: '3',
    20: '1',
    30: '0',
  }
  const fields = [
    '寄件公司',
    '寄件人',
    '寄件电话',
    '收件公司',
    '收件人',
    '收件电话',
    '收件地址',
    '月结账号',
    '声明价值',
    '寄件地址',
  ]
  let encryptString = ''
  ;[10, 20, 30].forEach((type) => {
    encryptString += '-'
    fields.forEach((field) => {
      const target = fieldsList.find((f) => f.titleType === type && f.fieldName === field)
      const encryptType = target?.encryptType
      encryptString += dict[encryptType] || '3'
    })
  })
  return encryptString.replace(/^-+|-+$/g, '')
}

/** 打印配置 */
export const getPrintConfig = async (): Promise<any | undefined> => {
  const res = await getPrintConfigApi()
  if (res.code === 0 && res.data) {
    return res.data
  }
}

/** 打印加密字符串(waybillType==30) */
export const getPrintEncryptText = async (): Promise<string | undefined> => {
  const res = await getEncryptInfo()
  if (res.code === 0 && res.data) {
    const info = res.data.find((d: any) => String(d.waybillType) === '30')
    const encryptText = convertEncryptListToString(info && info.fieldsList)
    if (!encryptText) {
      return
    }
    return encryptText
  }
}

/** 打印模板列表 */
export const getTemplateList = async (): Promise<any | undefined> => {
  const res = await getTemplateListApi()
  if (res.code === 0 && res.data) {
    return res.data
  }
}
