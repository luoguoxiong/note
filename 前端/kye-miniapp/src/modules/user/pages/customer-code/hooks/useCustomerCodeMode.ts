/**
 * 客户编码模式判断 Hook
 *
 * 根据用户权限信息和可绑定公司列表自动判断显示模式（绑定/猜您绑定/切换/更换）
 * 统一入口页和统一弹窗组件都使用此 Hook
 *
 * 模式判断逻辑（与H5保持一致，基于 getBindableCompanyList 返回的 type 字段）：
 * - type=121 → bind (需要首次绑定)
 * - type=120 → guess (猜您需要绑定 - 近一个月下单过的公司推荐列表)
 * - type=110/111/122 → switch (有权限可切换/有关联记录可切换)
 * - type=10 → change (只能更换当前绑定)
 *
 * 兼容原有逻辑：当无法获取公司列表时，回退到 getAppUserRelationAuth 判断
 */
import { ref, computed } from 'vue'
import { getBindableCompanyList, getAppUserRelationAuth } from '@modules/user/apis/customerCode'
import type { BindableCompanyListResponse, AppUserRelationAuthResponse } from '@modules/user/apis/customerCode/types'
import { useCustomerCodeStore } from '../store/customerCode'
import type { CompanyInfo as StoreCompanyInfo } from '../types/customer-code'

export type CustomerCodeMode = 'bind' | 'guess' | 'switch' | 'change' | ''

/** 默认模式: 绑定（仅用于接口异常时的兜底） */
const DEFAULT_MODE: CustomerCodeMode = 'bind'

/** 初始模式: 空（等待接口返回后再设置，避免提前触发渲染逻辑） */
const INIT_MODE: CustomerCodeMode = ''

/**
 * 根据API返回的 type 字段判断模式
 *
 * 与H5 popup/index.jsx 保持一致：
 * - 121 → bind (绑定)
 * - 120 → guess (猜您绑定)
 * - 110/111/122 → switch (切换)
 * - 10 → change (更换)
 */
const determineModeByType = (type: number): CustomerCodeMode => {
  switch (type) {
    case 121:
      return 'bind'
    case 120:
      return 'guess'
    case 110:
    case 111:
    case 122:
      return 'switch'
    case 10:
      return 'change'
    default:
      return DEFAULT_MODE
  }
}

/**
 * 回退：根据用户权限信息判断模式（兼容逻辑）
 *
 * @param customerInfo - 用户客户编码信息
 * @returns 判断后的模式类型
 */
const determineModeByAuth = (customerInfo: AppUserRelationAuthResponse | null): CustomerCodeMode => {
  if (!customerInfo) {
    return DEFAULT_MODE
  }

  const { hasCurBind, bindAuth, existedRelationBind } = customerInfo

  // 未绑定状态
  if (!hasCurBind) {
    if (bindAuth && existedRelationBind) {
      return 'switch'
    }
    return 'bind'
  }

  // 已绑定状态
  if (bindAuth || existedRelationBind) {
    return 'switch'
  }

  return 'change'
}

/** 页面URL标题映射 */
const PAGE_URL_TITLE_MAP: Record<CustomerCodeMode, string> = {
  '': '加载中...',
  bind: '绑定客户编码',
  guess: '客户编码',
  switch: '切换客户编码',
  change: '更换客户编码',
}

export const useCustomerCodeMode = () => {
  /** 当前模式（初始为空，接口返回后再设置，避免提前触发逻辑） */
  const mode = ref<CustomerCodeMode>(INIT_MODE)

  /** 加载状态 */
  const loading = ref(false)

  /** 公司列表类型标识（来自API响应） */
  const listType = ref<number>(0)

  /** 页面URL标题 */
  const pageUrlTitle = computed(() => PAGE_URL_TITLE_MAP[mode.value] || '客户编码')

  const customerCodeStore = useCustomerCodeStore()

  /**
   * 初始化模式判断（优先使用 getBindableCompanyList，与H5保持一致）
   */
  const initMode = async (noLoading?: boolean) => {
    if (!noLoading) {
      loading.value = true
    }
    try {
      // 优先通过 getBindableCompanyList 获取模式和公司列表（与H5一致）
      const res = await getBindableCompanyList()
      const data: BindableCompanyListResponse | undefined = res?.data || res
      console.log('getBindableCompanyList', data)
      if (data && typeof data.type === 'number') {
        listType.value = data.type
        mode.value = determineModeByType(data.type)

        // 同步公司列表到 store，并设置当前绑定公司
        if (data.companyInfoList?.length) {
          customerCodeStore.setCompanyInfoList(data.companyInfoList as StoreCompanyInfo[])
          const current = (data.companyInfoList as StoreCompanyInfo[]).find((item) => item.isCurrBond === '1') || null
          customerCodeStore.setCurrentCompany(current)
        }
      } else {
        // 回退到权限接口判断
        const authRes = await getAppUserRelationAuth()
        const authData: AppUserRelationAuthResponse | null = authRes?.data || authRes || null
        mode.value = determineModeByAuth(authData)
      }
    } catch (error) {
      console.error('获取用户模式信息失败:', error)
      mode.value = DEFAULT_MODE // 失败时使用默认模式
    } finally {
      loading.value = false
    }
  }

  /**
   * 手动设置模式（特殊场景）
   */
  const setMode = (newMode: CustomerCodeMode) => {
    mode.value = newMode
  }

  /**
   * 重置为默认模式
   */
  const resetMode = () => {
    mode.value = DEFAULT_MODE
    listType.value = 0
  }

  return {
    mode,
    loading,
    pageUrlTitle,
    listType,
    initMode,
    setMode,
    resetMode,
  }
}
