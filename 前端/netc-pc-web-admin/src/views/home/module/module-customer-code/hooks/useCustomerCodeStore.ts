/**
 * 客户编码共享状态(TS 版)
 * 来源: customer-code 引用的 @/views/setting/user/hooks/useCustomerCodeStore (netc-pc-web)
 *  - vuex state(userInfo.customCode/companyInfoType/customerList) -> 模块级单例 ref
 *  - 当前绑定客户编码/手机号: 旧 store.state.userInfo -> 新基座 useUserStore(pinia)
 *  - setCustomerListAction(dispatch) -> fetchCustomerListAction
 *  - getAppUserRelationAuth(dispatch) -> getAppUserRelationAuthAction
 */
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { AppUserRelationAuth } from '@/apis/user/types'
import { getBindableCompanyList, getAppUserRelationAuthApi } from '../api'
import { CompanyInfoType } from '../consts'
import type { CustomerListItem } from '../types'

/** 当前绑定的客户编码 */
const customCode = computed(() => useUserStore().user?.customCode || '')

/** 当前登录用户手机号(老 storageUtil.getPhone 等价数据源) */
const phone = computed(() => useUserStore().user?.phone || '')

/** 客户编码列表 */
const customerList = ref<CustomerListItem[]>([])

/** 客户编码列表类型(10-更换 110/111-切换 120/121/122-绑码) */
const companyInfoType = ref<number | ''>('')

/** 是否有推荐公司 */
const hasSuggestCustomerCode = computed(() => companyInfoType.value === CompanyInfoType.BIND_HAS_RECOMMEND)

/** 是否有关联账号权限 */
const relateAccountAuth = ref(false)

/** 是否有关联绑定公司 */
const existedRelationBind = ref(false)

/** 没有关联账号权限且没有关联绑定公司 */
const withoutRelateBindCustomerCode = computed(() => companyInfoType.value === CompanyInfoType.CHANGE_CUSTOMER_CODE)

/** 可绑定公司列表是否已加载(会话级缓存: 绑码/解绑成功均 routerReload 整页刷新, 标志随之重置, 数据不会陈旧) */
let hasLoadedCustomerList = false

/**
 * 刷新可绑定公司列表 + 绑码关系权限(同一会话内仅首次真实请求, 后续走 store 缓存)
 * 对齐老基座: store.dispatch('setCustomerListAction') + commit('setCustomerList')
 * @param force 强制刷新(默认 false 走缓存)
 * @returns 是否加载成功(失败时全局已 toast, 调用方据此中止后续弹窗/列表逻辑)
 */
async function fetchCustomerListAction(force = false): Promise<boolean> {
  if (hasLoadedCustomerList && !force) return true
  try {
    const res = await getBindableCompanyList()
    if (res.code === 0 && res.data) {
      customerList.value = res.data.companyInfoList || []
      companyInfoType.value = res.data.type
      hasLoadedCustomerList = true
      return true
    }
    ElMessage.error('服务异常，请稍后重试')
    return false
  } catch (e) {
    console.log(e)
    return false
  }
}

/**
 * 查询用户绑码关联权限
 * 对齐老基座: store.dispatch('getAppUserRelationAuth')(返回 res.data)
 */
async function getAppUserRelationAuthAction(): Promise<AppUserRelationAuth | undefined> {
  const res = await getAppUserRelationAuthApi()
  if (res.code === 0 && res.data) {
    relateAccountAuth.value = !!res.data.bindAuth
    existedRelationBind.value = !!res.data.existedRelationBind
  }
  return res?.data
}

export default function useCustomerCodeStore() {
  return {
    customCode,
    phone,
    customerList,
    companyInfoType,
    hasSuggestCustomerCode,
    relateAccountAuth,
    existedRelationBind,
    withoutRelateBindCustomerCode,
    fetchCustomerListAction,
    getAppUserRelationAuthAction,
  }
}
