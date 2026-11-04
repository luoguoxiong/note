/**
 * pc-web 旧基座根 store (Pinia 版)
 * 来源: netc-pc-web/src/store/index.js (根 state/mutations/actions) + src/store/getters.js (全局 getters)
 *
 * 使用场景(标注):
 *  - 【全局】登录态展示: userInfo / customerShortName / isCustomerIsMonthly(顶栏、个人中心、埋点)
 *  - 【全局】实名认证: realNameInfo / realNameDetail(实名弹窗、认证流程页)
 *  - 【全局】路由取消: cancelTokenArr(路由切换时取消未完成请求, request 层调用 PUSH_CANCEL/CLAER_CANCEL)
 *  - 【布局】菜单折叠: isMenuCollapse(侧边栏收缩)
 *  - 【布局】多页签: openTabs / hasOpenComponentsArr(tabs 栏、iframe 懒加载容器保持)
 *  - 【首页】advertisement 广告位 / visibleControl.backVersionFlag 返回旧版标识 / isShowWechat 关注公众号入口
 *  - 【绑码】customerList / companyInfoType / customerCodeBindCountLimit / relateAccountAuth /
 *    existedRelationBind / relationBindCount / relationRemarks / relationClientType / relationTips /
 *    loginMobileData(切换登录手机号) —— 绑码/关联账号流程与首页引导
 *  - 【商务/老客】hasBusiness 是否匹配商务 / oldCustomer 是否老客
 *  - 全局 getters: 客户类型判断(isB2BUser/isVipshopUser)、权限(authorityIds/permissionMap/permissionCodes/
 *    isEncryptField/hasFrightFeeAuth)、打印配置、下单配置(paymentTypeList/defaultConfig/requirements)、
 *    自定义字段(customFields/customFieldRules)、服务方式、地址簿(companyOrPersonal)、统计报表 strategyId、
 *    运单查询条件(getWaybillQueryList)、回单文案(noReceiptNodeMessage) 等 —— 供旧基座视图迁移时复用
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as storageUtil from './deps/storage'
import { generateBrowserUuid } from './deps/misc'
import {
  getAppUserRelationAuth as getAppUserRelationAuthApi,
  getBindableCompanyList,
  checkRealNameAuth as checkRealNameAuthApi,
  getCustomerCodeBindCountAndLimit as getCustomerCodeBindCountAndLimitApi,
  getLoginSwitchList,
  getUserInfoByPhoneNew,
  queryVerifyStatusInfo,
} from './deps/api'
import { usePcWebClientStore } from './client'

// ==================== 旧 mutation-types ====================
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO'
export const UPDATE_REAL_NAME_INFO = 'UPDATE_REAL_NAME_INFO'
export const PUSH_CANCEL = 'PUSH_CANCEL'
export const CLAER_CANCEL = 'CLAER_CANCEL'
export const SET_ADVERTISEMENT = 'SET_ADVERTISEMENT'
export const SET_OPEN_TABS = 'SET_OPEN_TABS'

type AnyRecord = Record<string, any>

export const usePcWebRootStore = defineStore('pcWebRoot', () => {
  // ==================== state (旧 index.js state) ====================
  const isMenuCollapse = ref(false)
  const onlineSettlementUrl = ref('')
  const userInfo = ref<AnyRecord>({})
  const realNameInfo = ref<AnyRecord>({}) // 实名认证信息
  const realNameDetail = ref<AnyRecord>({}) // 实名认证详细信息
  const cancelTokenArr = ref<any[]>([])
  const openTabs = ref<AnyRecord[]>([]) // 当前已打开tabs
  const hasOpenComponentsArr = ref<AnyRecord[]>([]) // 当前已打开懒加载iframe容器
  const advertisement = ref<AnyRecord[]>([])
  const customerList = ref<AnyRecord[]>([]) // 相关客户编码
  const companyInfoType = ref<string | number>('') // 客户编码列表类型
  const customerCodeBindCountLimit = ref<AnyRecord>({}) // 用户关联绑定上限以及绑定数量
  const relateAccountAuth = ref(false) // 是否有关联账号权限
  const existedRelationBind = ref(false) // 是否有关联绑定公司
  const relationBindCount = ref(0) // 关联绑定公司数量
  const relationRemarks = ref<AnyRecord[]>([]) // 绑码提示文案
  const relationClientType = ref(0) // 绑码类型
  const oldCustomer = ref(false) // 是否是老客
  const hasBusiness = ref(false) // 是否匹配到了商务
  const relationTips = ref('') // 绑码提示文案
  const loginMobileData = ref<AnyRecord>({}) // 切换登录手机号
  // 展示标识
  const visibleControl = ref({ backVersionFlag: false }) // 返回旧版标识
  const isShowWechat = ref(false) // 是否显示关注公众号入口（未登录或未关注）

  // ==================== mutations (旧 index.js mutations) ====================

  /** 更新用户信息并同步 sessionStorage */
  function updateUserInfo(payload: AnyRecord) {
    userInfo.value = payload
    // 同步sessionStorage
    storageUtil.setUserData(userInfo.value)
    storageUtil.setCustomerCode((payload as AnyRecord).customCode || '')
  }

  /** 更新实名认证信息(合并) */
  function updateRealNameInfoMutation(payload: AnyRecord) {
    realNameInfo.value = { ...realNameInfo.value, ...payload }
  }

  /** 记录需要取消的请求 */
  function pushCancel(payload: { cancelToken: any | any[] }) {
    let arr = [...cancelTokenArr.value]
    arr = arr.concat(payload.cancelToken)
    cancelTokenArr.value = arr
  }

  /** 清除(触发)已记录的请求取消 */
  function clearCancel() {
    cancelTokenArr.value.forEach((item) => {
      item('cancelToken')
    })
    cancelTokenArr.value = []
  }

  function updateRealNameDetailMutation(realNameDetailPayload: AnyRecord) {
    realNameDetail.value = realNameDetailPayload
  }

  function updateMenuCollapseStatus(flag: boolean) {
    isMenuCollapse.value = flag
  }

  function setOnlineSettlementUrl(url: string) {
    onlineSettlementUrl.value = url
  }

  function setOpenTabs(data: AnyRecord[]) {
    openTabs.value = data
  }

  function setAdvertisement(data: AnyRecord[]) {
    advertisement.value = data
  }

  function setCustomerList(data: AnyRecord) {
    customerList.value = data.companyInfoList || []
    // 之前版本：0-无推荐无关联，1-有关联公司，2-有推荐公司
    /**
     * 10-更换
     * 110-切换，有关联账号权限
     * 111-切换-无关联账号权限
     * 120-绑码-有推荐
     * 121-绑码-无推荐
     * 122-绑码-有关联
     */
    companyInfoType.value = data.type
  }

  function setSwitchLoginMobileData(payload: AnyRecord = {}) {
    loginMobileData.value = payload
  }

  function setCustomerCodeBindCountLimitData(payload: AnyRecord) {
    customerCodeBindCountLimit.value = payload
  }

  function setRelateAccountPermission(payload: AnyRecord) {
    const {
      bindAuth,
      existedRelationBind: existed,
      relationBindCount: count,
      remarks,
      clientType,
      tips,
      hasBusiness: hasB,
      oldCustomer: oldC,
    } = payload
    relateAccountAuth.value = bindAuth
    hasBusiness.value = hasB
    oldCustomer.value = oldC
    existedRelationBind.value = existed
    relationBindCount.value = count
    relationRemarks.value = remarks
    relationClientType.value = clientType
    relationTips.value = tips
  }

  /** 更新返回旧版标识 */
  function setBackVersionFlagMutation(payload: any) {
    if (visibleControl.value) {
      visibleControl.value.backVersionFlag = !!payload
    }
  }

  /** 更新已懒加载iframe容器 */
  function setOpenComponentsArr(data: AnyRecord[]) {
    hasOpenComponentsArr.value = data
  }

  function updateShowWxFlag(data: boolean) {
    isShowWechat.value = data
  }

  // ==================== actions (旧 index.js actions) ====================

  /** 【全局】拉取最新用户信息并写入 userInfo + sessionStorage */
  async function updateUserInfoAction(callback?: () => void) {
    const res = await getUserInfoByPhoneNew()
    updateUserInfo(res.data)
    callback && callback()
  }

  /** 【全局】拉取实名认证信息 */
  function updateRealNameInfoAction() {
    return new Promise((resolve) => {
      checkRealNameAuthApi().then((res) => {
        updateRealNameInfoMutation(res.data)
        resolve(res.data)
      })
    })
  }

  /** 【全局】拉取实名认证详细信息 */
  function updateRealNameDetailAction() {
    return new Promise((resolve, reject) => {
      queryVerifyStatusInfo().then((res) => {
        if (res.code !== 0 || !res.data) {
          return reject(res)
        }
        updateRealNameDetailMutation(res.data)
        resolve(res)
      })
    })
  }

  /** 【绑码】拉取可绑定公司列表 */
  async function setCustomerListAction() {
    const res = await getBindableCompanyList()
    if (res.code === 0 && res.data) {
      setCustomerList(res.data)
    } else {
      ElMessage.error('服务异常，请稍后重试')
    }
  }

  /** 【切换登录手机号】拉取可切换手机号列表 */
  async function setSwitchLoginMobileAction() {
    const params = {
      from: 7,
      deviceCode: generateBrowserUuid(),
    }
    const res = await getLoginSwitchList(params)
    if (res.code === 0 && res.data) {
      setSwitchLoginMobileData(res.data)
    } else {
      ElMessage.error('服务异常，请稍后重试')
    }
  }

  /** 【绑码】拉取用户关联绑定上限以及绑定数量 */
  async function getCustomerCodeBindCountAndLimitAction() {
    const res = await getCustomerCodeBindCountAndLimitApi()
    if (res.code === 0 && res.data) {
      setCustomerCodeBindCountLimitData(res.data || {})
    }
  }

  /** 【绑码】拉取关联账号权限/绑码信息 */
  async function getAppUserRelationAuthAction() {
    const res = await getAppUserRelationAuthApi()
    if (res.code === 0 && res.data) {
      setRelateAccountPermission(res.data)
    }
    return res?.data
  }

  /** 【首页】设置回到旧版标识 */
  function setBackVersionFlagAction(payload: any) {
    setBackVersionFlagMutation(payload)
  }

  /** 【布局】更新已懒加载iframe容器 */
  function set_open_components_arr(payload: AnyRecord[]) {
    setOpenComponentsArr(payload)
  }

  // ==================== 全局 getters (旧 getters.js, 跨模块组合) ====================

  const getCustomerInfo = (): AnyRecord => {
    return (userInfo.value && userInfo.value.customerInfo) || {}
  }

  const getClientType = (): string => {
    if (!userInfo.value || !userInfo.value.customerInfo) {
      return ''
    }
    const { companyType, customerType } = userInfo.value.customerInfo
    if (String(companyType) === '20') {
      return '电商'
    }
    switch (customerType) {
      case '10':
        return '正常客户'
      case '20':
        return '京东专运'
      case '30':
        return '公共后台'
      case '40':
        return '内部专用'
      default:
        return ''
    }
  }

  const clientStore = usePcWebClientStore()

  /** 是否B2B客户(正常客户) */
  const isB2BUser = computed(() => {
    const clientType = getClientType()
    return !clientType || clientType === '正常客户'
  })
  /** 是否唯品会客户 */
  const isVipshopUser = computed(() => String(getCustomerInfo().vipshopFlag) === '10' || false)
  /** 客户主营产品 */
  const mainProduct = computed(() => getCustomerInfo().mainProduct)
  /** 是否可修改寄件公司 */
  const canModifySenderCompany = computed(() => String(getCustomerInfo().modifyShipperFlag) === '10' || false)
  /** 仓库类型 */
  const warehouseType = computed(() => getCustomerInfo().otherWarehouseType)
  /** 是否本人签收(20:否 30:是) */
  const isSignBySelf = computed(() => storageUtil.getCustomerData()?.selfSignType === '30')
  /** 本人签收标识 */
  const selfSign = computed(() => ['10'].includes(getCustomerInfo()?.selfSign))
  /** 权限ID列表 */
  const authorityIds = computed(() => clientStore.authorityIds)
  /** 新版权限对象 */
  const permissionMap = computed(() => clientStore.permissionMap)
  /** 权限code列表 */
  const permissionCodes = computed(() => clientStore.permissionCodes)
  /** 下单相关字段是否加密(权限ID 126) */
  const isEncryptField = computed(() => clientStore.authorityIds.includes('126'))
  /** 运费权限 */
  const hasFrightFeeAuth = computed(() => clientStore.permissionCodes.includes('freightLookAuthFlag'))
  /** 打印加密字符串 */
  const encryptionText = computed(() => clientStore.encryptionText)
  /** 项目信息 */
  const projectInfo = computed(() => clientStore.projectInfo)
  /** 付款方式列表 */
  const paymentTypeList = computed(() => clientStore.paymentTypeList)
  /** 下单默认配置 */
  const defaultConfig = computed(() => clientStore.defaultConfig)
  /** 下单要求配置(默认保价/回单标识) */
  const requirements = computed(() => clientStore.requirements)
  /** 打印配置 */
  const printConfig = computed(() => clientStore.printConfig)
  /** 默认打印机编号 */
  const printerNo = computed(() => clientStore.printerNo)
  /** 服务方式 */
  const serviceWay = computed(() => clientStore.serviceWay)
  /** 是否展示分享运单上新指引(运单列表) */
  const shareWaybillGuideVisible = computed(() => clientStore.userConfigCache.shareWaybillGuideVisible)
  /** 是否展示分享运单上新指引(运单详情) */
  const shareWaybillGuideVisible_indetails = computed(
    () => clientStore.userConfigCache.shareWaybillGuideVisible_indetails
  )
  /** 自定义字段原始数据 */
  const customOriginalFields = computed(() => clientStore.customOriginalFields)
  /** 不限制长度的自定义编码 */
  const unlimitedKyFields = computed(() => clientStore.unlimitedKyFields)
  /** 自定义字段表单字段信息 */
  const customFields = computed(() => getFormFields(clientStore.customOriginalFields, clientStore.unlimitedKyFields))
  /** 自定义字段表单验证规则 */
  const customFieldRules = computed(() => getFormRules(clientStore.customOriginalFields))
  /** 付款公司信息 */
  const payCustomerInfo = computed(() => clientStore.payCustomerInfo)
  /** 打印模板列表 */
  const printTemplateList = computed(() => clientStore.printTemplateList)
  /** 客户简称 */
  const customerShortName = computed(() => {
    return (userInfo.value && userInfo.value.customerInfo && userInfo.value.customerInfo.customerShortName) || ''
  })
  /** 是否月结客户 */
  const isCustomerIsMonthly = computed(() => userInfo.value && userInfo.value.isCustomerIsMonthly)
  /** 是否有鲁班安装服务权限 */
  const haveInstallServiceAuth = computed(() => storageUtil.getCustomerData().decorationFlag === '10')
  /** 是否有货品管控权限 */
  const haveGoodsControlAuth = computed(() => storageUtil.getCustomerData().goodsControlFlag === '10')
  /** 检查path是否在已打开openTabs中 */
  const checkPathOnOpenTabs = computed(() => (path: string) => {
    return openTabs.value.find((f) => path && path.includes(f.path))
  })
  /** 检查path是否在已打开的预加载容器中 */
  const checkPathOnOpenComponents = computed(() => (path: string) => {
    return hasOpenComponentsArr.value.find((f) => path && path.includes(f.path))
  })

  return {
    // state
    isMenuCollapse,
    onlineSettlementUrl,
    userInfo,
    realNameInfo,
    realNameDetail,
    cancelTokenArr,
    openTabs,
    hasOpenComponentsArr,
    advertisement,
    customerList,
    companyInfoType,
    customerCodeBindCountLimit,
    relateAccountAuth,
    existedRelationBind,
    relationBindCount,
    relationRemarks,
    relationClientType,
    oldCustomer,
    hasBusiness,
    relationTips,
    loginMobileData,
    visibleControl,
    isShowWechat,
    // mutations
    updateUserInfo,
    updateRealNameInfoMutation,
    pushCancel,
    clearCancel,
    updateRealNameDetailMutation,
    updateMenuCollapseStatus,
    setOnlineSettlementUrl,
    setOpenTabs,
    setAdvertisement,
    setCustomerList,
    setSwitchLoginMobileData,
    setCustomerCodeBindCountLimitData,
    setRelateAccountPermission,
    setBackVersionFlagMutation,
    setOpenComponentsArr,
    updateShowWxFlag,
    // actions
    updateUserInfoAction,
    updateRealNameInfoAction,
    updateRealNameDetailAction,
    setCustomerListAction,
    setSwitchLoginMobileAction,
    getCustomerCodeBindCountAndLimitAction,
    getAppUserRelationAuthAction,
    setBackVersionFlagAction,
    set_open_components_arr,
    // getters
    isB2BUser,
    isVipshopUser,
    mainProduct,
    canModifySenderCompany,
    warehouseType,
    isSignBySelf,
    selfSign,
    authorityIds,
    permissionMap,
    permissionCodes,
    isEncryptField,
    hasFrightFeeAuth,
    encryptionText,
    projectInfo,
    paymentTypeList,
    defaultConfig,
    requirements,
    printConfig,
    printerNo,
    serviceWay,
    shareWaybillGuideVisible,
    shareWaybillGuideVisible_indetails,
    customOriginalFields,
    unlimitedKyFields,
    customFields,
    customFieldRules,
    payCustomerInfo,
    printTemplateList,
    customerShortName,
    isCustomerIsMonthly,
    haveInstallServiceAuth,
    haveGoodsControlAuth,
    checkPathOnOpenTabs,
    checkPathOnOpenComponents,
  }
})

// ==================== 自定义字段工具(旧 utils/customColumn) ====================

/** 取得表单字段信息(旧 customColumnUtil.getFormFields) */
function getFormFields(originalCustomColumns: AnyRecord[] | null | undefined, unlimitedKyFields: string[]) {
  const result = (originalCustomColumns || []).map((item, index) => {
    let maxlength = 128
    if (unlimitedKyFields.includes(item.kyField)) {
      maxlength = -1
    }
    const obj = {
      label: item.customerField,
      code: item.kyField,
      prop: `customColumnValue_${index}_${item.kyField}`,
      required: item.orderMustStatus === 1,
      maxlength,
    }
    return obj
  })
  return result
}

/** 取得表单验证规则(旧 customColumnUtil.getFormRules) */
function getFormRules(originalCustomColumns: AnyRecord[] | null | undefined) {
  const result = (originalCustomColumns || []).reduce((rules: AnyRecord, item, index) => {
    if (item.orderMustStatus === 1) {
      rules[`customColumnValue_${index}_${item.kyField}`] = [
        {
          required: true,
          trigger: 'blur',
          message: `请填写${item.customerField}`,
          msg: `请填写${item.customerField}`,
        },
      ]
    }
    return rules
  }, {})
  return result
}
