/**
 * pc-web 旧基座 client 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/client.js (namespaced: 'client')
 *
 * 使用场景(标注):
 *  - 【权限】authorityIds 老版权限ID集合 / permissionMap 新版权限对象(报表/看板可见性) /
 *    permissionCodes UAM权限code补充 —— 按钮显隐、页面访问控制(下单/报表/运单查询等)
 *  - 【下单】paymentTypeList 付款方式 / defaultConfig 下单默认配置(含月结账号清空逻辑) /
 *    requirements 下单要求(默认保价、回单标识) —— 下单页初始化
 *  - 【打印】printConfig 打印配置 / printerNo 默认打印机编号 / printTemplateList 打印模板 /
 *    encryptionText 面单加密字符串 —— 打印面单、打印设置
 *  - 【自定义字段】customOriginalFields KA客户自定义编码字段 / unlimitedKyFields 不限长字段
 *    —— 下单表单动态渲染(配合 root 的 customFields/customFieldRules getters)
 *  - 【运单查询】serviceWay/payCustomerInfo 与 2021.10重构后的拉取逻辑
 *    —— 运单列表查询条件下拉
 *  - 【打印】printConfig 打印配置 / printerNo 默认打印机编号 / printTemplateList 打印模板 /
 *    encryptionText 面单加密字符串 —— 打印面单、打印设置
 *  - 【自定义字段】customOriginalFields KA客户自定义编码字段 / unlimitedKyFields 不限长字段
 *    —— 下单表单动态渲染(配合 root 的 customFields/customFieldRules getters)
 *  - 【系统】projectInfo 项目信息 / userConfigCache 用户本地设置(分享运单上新指引) / assetCodeInfo 资产编码
 *
 * 【2026-09 删除】下单/托寄物/运单查询相关(含相关引用):
 *  - hasSetReceiptImage + setSystemConfig/setSystemConfigAction(+api getSystemConfigApi)
 *  - historyGoodsList + setHistoryGoodsList/setHistoryGoodsListAction(+api getDeliveryHistoryGoodsList)
 *  - skuList + setSkuList/setSkuListAction(+api querySkuList)
 *  - goodsBatchTimes + setGoodsBatchTimes/setGoodsBatchTimesAction(+api getGoodsBatchTimesApi)
 *  - newServiceWay/newPayCustomerInfo + setNewServiceWay/setNewPayCustomerInfo 及 actions(+api getCustomerServiceTypes/getPayCustomerList)
 *  - cacheOfWaybill 的 getUserPermission/getUserPermissionNew/getPaymentTypes/getRequirementConfig 中转已删除, 相关 action 改为直连 deps/api
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as cacheOfWaybill from './deps/cacheOfWaybill'
import {
  getKaCustomerMapping,
  queryDefaultConfig,
  getUserPermissionApi,
  getUserPermissionNewApi,
  queryPaymentTypes,
  getRequirementNew,
} from './deps/api'

type AnyRecord = Record<string, any>

export const usePcWebClientStore = defineStore('pcWebClient', () => {
  // ==================== state (旧 client.js state) ====================
  const assetCodeInfo = ref<AnyRecord>({}) // 资产编码相关信息
  const encryptionText = ref('3333333001-1111111001-1111111001')
  const authorityIds = ref<string[]>(
    '004,004-a,004-b,004-c,004-d,004-e,004-f,006,006-a,006-b,006-c,013,034,034-a,034-b,034-c,035,038,044,123,124,125'.split(
      ','
    )
  )
  // 新权限数据，{ summaryReport: '10', detailReport: '20', dataBoard: null }
  // value说明：10有权限 20或null无权限；see:http://apimg.kyepm.com/manageApi/apiWordDetail?id=2075431400201326592
  const permissionMap = ref<AnyRecord>({})
  const permissionCodes = ref<string[]>([]) // 权限控制补充
  const projectInfo = ref<AnyRecord>({}) // 项目信息
  const paymentTypeList = ref<AnyRecord[]>([]) // 付款方式
  const defaultConfig = ref<AnyRecord>({})
  const requirements = ref<AnyRecord>({}) // defaultInsurancePrice：默认保价  recoveryReceiptFlag：回单标识
  const printConfig = ref<AnyRecord>({}) // 打印配置信息
  const printerNo = ref('') // 默认打印机编号
  const customOriginalFields = ref<AnyRecord[]>([]) // 自定义字段接口返回数据
  const unlimitedKyFields = ref<string[]>([]) // 不限制长度的自定义编码
  const serviceWay = ref<AnyRecord[]>([]) // 运单查询条件中的付款方式来源
  const payCustomerInfo = ref<AnyRecord[]>([]) // 运单查询条件中的付款公司来源
  const printTemplateList = ref<AnyRecord[]>([]) // 打印模板

  const userConfigCache = ref<AnyRecord>({
    // 用户设置
    shareWaybillGuideVisible: false, // 是否展示分享运单的上新指引（运单列表）
    shareWaybillGuideVisible_indetails: false, // 是否展示分享运单的上新指引 （运单详情）
  })

  // ==================== mutations (旧 client.js mutations) ====================

  function setUserConfigCache(config: AnyRecord) {
    userConfigCache.value = {
      ...userConfigCache.value,
      ...config,
    }
  }
  function setCustomerMappingField(fields: AnyRecord[]) {
    customOriginalFields.value = fields
  }
  function setUnlimitedKyFields(fields: string[]) {
    unlimitedKyFields.value = fields
  }
  function setPrinterNo(no: string) {
    printerNo.value = no
  }
  function setPermission(resourcesID: string) {
    const ids = (resourcesID && resourcesID.split(/,|，/).filter((f) => f)) || []
    authorityIds.value = ids
  }
  function setPermissionMap(map: AnyRecord) {
    // 新权限接口权限数据
    permissionMap.value = map
  }
  function setPermissionPlus(payload: string[]) {
    permissionCodes.value = payload
  }
  function setPrintConfig(config: AnyRecord) {
    printConfig.value = config
  }
  function setPaymentTypeList(list: AnyRecord[]) {
    paymentTypeList.value = list
  }
  function setDefaultConfig(config: AnyRecord) {
    defaultConfig.value = config
  }
  function setRequirements(data: AnyRecord) {
    requirements.value = data
  }
  function setEncryptText(text: string) {
    encryptionText.value = text
  }
  function setAssetCode(info: AnyRecord) {
    assetCodeInfo.value = info
  }
  function setCustomerProjectInfo(info: AnyRecord) {
    projectInfo.value = info
  }
  function setServiceWay(list: AnyRecord[]) {
    serviceWay.value = list
  }
  function setPayCustomerCodeList(list: AnyRecord[]) {
    payCustomerInfo.value = list
  }
  function setPrintTemplateList(list: AnyRecord[]) {
    printTemplateList.value = list
  }

  // ==================== actions (旧 client.js actions) ====================

  /** 【自定义字段】拉取KA客户自定义编码映射(下单表单动态字段) */
  async function setCustomerMappingFieldAction() {
    const res = await getKaCustomerMapping()
    if (res.code === 0 && res.data) {
      setCustomerMappingField(res.data.rows)
      setUnlimitedKyFields(res.data.unlimitedKyFields)
      return res.data
    }

    setCustomerMappingField([])
    setUnlimitedKyFields([])
  }

  /** 【权限】新老权限接口一起请求(按钮显隐/报表权限) */
  async function setPermissionAction() {
    // 新老权限接口一起请求
    const results = await Promise.allSettled([getUserPermissionApi(), getUserPermissionNewApi()])
    const oldRes = results[0].status === 'fulfilled' ? results[0].value : undefined
    const newRes = results[1].status === 'fulfilled' ? results[1].value : undefined

    // 旧逻辑: code===0 且 data.list.resourcesID 存在才生效
    const permissionIdStr =
      oldRes && oldRes.code === 0 && oldRes.data && oldRes.data.list && oldRes.data.list.resourcesID
        ? oldRes.data.list.resourcesID
        : undefined
    // 旧逻辑: code===0 且 data 存在才生效
    const permissionMapData = newRes && newRes.code === 0 && newRes.data ? newRes.data : undefined

    if (permissionIdStr) {
      setPermission(permissionIdStr)
    }

    if (permissionMapData) {
      setPermissionMap(permissionMapData)
    }
  }

  /** 【打印】拉取打印配置 */
  async function setPrintConfigAction() {
    const data = await cacheOfWaybill.getPrintConfig()
    if (data) {
      setPrintConfig(data)
    }
  }

  /** 【下单】拉取付款方式列表 */
  async function setPaymentTypeListAction() {
    const res = await queryPaymentTypes()
    if (res.code === 0 && res.data && res.data.payWays) {
      setPaymentTypeList(res.data.payWays)
    }
  }

  /** 【下单】拉取下单默认配置(第三方付以外清空月结账号) */
  async function setDefaultConfigAction() {
    const res = await queryDefaultConfig({})
    if (res.code === 0 && res.data) {
      if (res.data.payType !== '第三方付' && res.data.payAccount) {
        res.data.payAccount = ''
      }
      setDefaultConfig(res.data)
    }
  }

  /** 【下单】拉取下单要求配置(默认保价/回单标识, 回单标识 10/20 反转与旧版一致) */
  async function setRequirementsAction() {
    const res = await getRequirementNew()
    if (res.code === 0 && res.data?.length > 0) {
      const data = res.data[0]
      const flag = data.recoveryReceiptFlag
      if (String(flag) === '10') {
        data.recoveryReceiptFlag = '20'
      } else if (String(flag) === '20') {
        data.recoveryReceiptFlag = '10'
      }
      setRequirements(data)
    }
  }

  /** 【打印】拉取面单加密字符串 */
  async function setEncryptTextAction() {
    const data = await cacheOfWaybill.getPrintEncryptText()
    if (data) {
      setEncryptText(data)
    }
  }

  /** 【打印】拉取打印模板列表 */
  async function setPrintTemplateListAction() {
    const data = await cacheOfWaybill.getTemplateList()
    if (data) {
      setPrintTemplateList(data)
    }
  }

  return {
    // state
    assetCodeInfo,
    encryptionText,
    authorityIds,
    permissionMap,
    permissionCodes,
    projectInfo,
    paymentTypeList,
    defaultConfig,
    requirements,
    printConfig,
    printerNo,
    customOriginalFields,
    unlimitedKyFields,
    serviceWay,
    payCustomerInfo,
    printTemplateList,
    userConfigCache,
    // mutations
    setUserConfigCache,
    setCustomerMappingField,
    setUnlimitedKyFields,
    setPrinterNo,
    setPermission,
    setPermissionMap,
    setPermissionPlus,
    setPrintConfig,
    setPaymentTypeList,
    setDefaultConfig,
    setRequirements,
    setEncryptText,
    setAssetCode,
    setCustomerProjectInfo,
    setServiceWay,
    setPayCustomerCodeList,
    setPrintTemplateList,
    // actions
    setCustomerMappingFieldAction,
    setPermissionAction,
    setPrintConfigAction,
    setPaymentTypeListAction,
    setDefaultConfigAction,
    setRequirementsAction,
    setEncryptTextAction,
    setPrintTemplateListAction,
  }
})
