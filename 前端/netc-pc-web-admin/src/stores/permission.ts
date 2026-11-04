import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { useLightAppStore } from './lightapp'
import { useUserStore } from './user'
import { getAppUserRelationAuth, queryCustomerInfo } from '@/apis/user'
import type { AppUserRelationAuth, CustomerInfo } from '@/apis/user/types'
import { getOrderTips } from '@/apis/order'
import type { OrderTips } from '@/apis/order/types'

/** 无权限拦截弹窗场景 */
export type PermissionDialogType = 'auth' | 'customerCode' | 'order'

/**
 * 路由权限 store（见《路由权限方案》四、权限数据源设计）
 *
 * 权限基准：后端 queryAreaMenuList 按用户身份过滤后的 menuCode。
 * 能出现在接口返回/缓存里的菜单即代表有权限。
 * 注意：接口失败的 fallback 兜底数据不参与权限判断（防 mock 越权，见方案 6.2）。
 */
export const usePermissionStore = defineStore('permission', () => {
  const lightAppStore = useLightAppStore()

  /** 全部已授权 menuCode（含子菜单，拍平），仅来源于「接口成功 / localStorage 缓存」 */
  const menuCodes = computed(() => lightAppStore.serverMenuCodes)

  /** 预留：独立权限码接口（按钮/功能码），首期可空 */
  const authCodes = ref<Set<string>>(new Set())

  /** 权限元数据是否可用（接口失败且无缓存时为 false，守卫按「放行 + 告警埋点」策略处理） */
  const isAuthDataReady = computed(() => lightAppStore.isServerMenuReady)

  /** 无权限/未绑码拦截弹窗状态（路由守卫触发，全局 PermissionDialog 组件消费） */
  const dialog = reactive({
    visible: false,
    /** 'auth'：无访问权限；'customerCode'：未绑定客户编码 */
    type: 'auth' as PermissionDialogType,
    /** 被拦截的目标路由 fullPath（用于文案与埋点） */
    target: '',
  })

  function openPermissionDialog(type: PermissionDialogType, target = '') {
    dialog.type = type
    dialog.target = target
    dialog.visible = true
  }

  function closePermissionDialog() {
    dialog.visible = false
  }

  /** 绑码关系数据（getBindInfo，未绑码弹窗 4 场景 + 文案数据源） */
  const bindInfo = ref<AppUserRelationAuth | null>(null)
  let bindInfoPromise: Promise<void> | null = null

  /**
   * 拉取绑码关系数据：对齐老项目守卫内 dispatch('getAppUserRelationAuth')，
   * 每次未绑码拦截都重新拉取（用户可能刚发起过申请，状态会变化），并发时去重
   */
  async function loadBindInfo(): Promise<void> {
    if (bindInfoPromise) return bindInfoPromise
    bindInfoPromise = (async () => {
      try {
        const res = await getAppUserRelationAuth()
        if (res.code === 0 && res.data) {
          bindInfo.value = res.data
        }
      } catch (error) {
        // 拉取失败保持旧数据；弹窗侧对 null 数据有兜底场景
        console.error('获取绑码关系失败:', error)
      } finally {
        bindInfoPromise = null
      }
    })()
    return bindInfoPromise
  }

  /** 下单权限校验结果（getOrderTips，下单权限弹窗数据源） */
  const orderTips = ref<OrderTips | null>(null)
  let orderTipsPromise: Promise<boolean> | null = null

  /** 是否无下单权限（blockedFlag） */
  const isOrderBlocked = computed(() => {
    return orderTips.value?.checkResultList?.[0]?.blockedFlag === true
  })

  /** 报废/拉黑拦截文案（用户/客户级 allowToOrderTip，第一层拦截，非空即拦截） */
  const orderBlockTip = ref('')

  /** 客户信息（queryCustomerInfo，按客户编码缓存，对齐老项目 CUSTOMER_DATA） */
  const customerInfo = ref<CustomerInfo | null>(null)
  let customerInfoCode = ''
  let customerInfoPromise: Promise<CustomerInfo | null> | null = null

  async function loadCustomerInfo(): Promise<CustomerInfo | null> {
    const userStore = useUserStore()
    const code = userStore.currentCustomerCode
    if (!code) return null
    if (customerInfo.value && customerInfoCode === code) return customerInfo.value
    if (customerInfoPromise) return customerInfoPromise
    customerInfoPromise = (async () => {
      try {
        const res = await queryCustomerInfo(code, userStore.user?.phone || '')
        if (res.code === 0 && res.data) {
          customerInfo.value = res.data
          customerInfoCode = code
        }
      } catch (error) {
        console.error('获取客户信息失败:', error)
      } finally {
        customerInfoPromise = null
      }
      return customerInfo.value
    })()
    return customerInfoPromise
  }

  /**
   * 拉取下单权限（对齐老项目 checkOrderDeliveryAuthNew 两层校验）：
   * 第一层 报废/拉黑：客户级/用户级 allowToOrderFlag !== '10' 且有 tip → 拦截（单按钮「我知道了」）
   * 第二层 下单权限：getOrderTips blockedFlag → 拦截（「立即申请/审核中」）
   * 每次进入 requireOrderPermission 路由都重新拉取（状态会变化），接口失败不阻塞导航，返回是否被拦截
   */
  function loadOrderTips(): Promise<boolean> {
    if (orderTipsPromise) return orderTipsPromise
    orderTipsPromise = (async () => {
      const userStore = useUserStore()
      try {
        // 第一层：报废/拉黑预检
        const customer = await loadCustomerInfo()
        const userFlag = userStore.user?.allowToOrderFlag
        const blockMsg = customer?.allowToOrderTip || userStore.user?.allowToOrderTip
        if (customer?.allowToOrderFlag !== '10' && userFlag !== '10' && blockMsg) {
          orderBlockTip.value = blockMsg
          return true
        }
        orderBlockTip.value = ''

        // 第二层：下单权限校验
        const res = await getOrderTips()
        if (res.code === 0 && res.data) {
          orderTips.value = res.data
        }
        return isOrderBlocked.value
      } catch (error) {
        // 接口报错不阻塞主流程（对齐老项目 validateForOrderPermissionNew）
        console.error('获取下单权限失败:', error)
        return false
      } finally {
        orderTipsPromise = null
      }
    })()
    return orderTipsPromise
  }

  const isInitialized = ref(false)
  let initPromise: Promise<void> | null = null

  async function init(): Promise<void> {
    if (isInitialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      // 复用 lightapp 的缓存秒显 + 接口更新，不重复请求
      await lightAppStore.init()
      // 预留：此处可并行请求独立权限码接口，填充 authCodes
      isInitialized.value = true
    })()
    return initPromise
  }

  /** 是否有权限（支持单个或任一命中） */
  function hasAuth(auth: string | string[]): boolean {
    const arr = Array.isArray(auth) ? auth : [auth]
    return arr.some((code) => menuCodes.value.has(code) || authCodes.value.has(code))
  }

  return {
    menuCodes,
    authCodes,
    isInitialized,
    isAuthDataReady,
    dialog,
    bindInfo,
    orderTips,
    isOrderBlocked,
    orderBlockTip,
    openPermissionDialog,
    closePermissionDialog,
    loadBindInfo,
    loadOrderTips,
    init,
    hasAuth,
  }
})
