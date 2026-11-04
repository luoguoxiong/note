/**
 * 公司列表管理 Hook
 *
 * 封装公司列表的获取、切换、解绑等操作
 * 与 Store 联动，供 CompanyList 和 ChangeCodeCard 组件使用
 */
import { ref, computed } from 'vue'
import { useCustomerCodeStore } from '../store/customerCode'
import type { CompanyInfo, DepartmentInfo } from '../types/customer-code'
import type { UserRoleResponse, AppUserRelationAuthResponse } from '@modules/user/apis/customerCode/types'
import {
  getUserRoleByCustomerCode,
  getAppUserRelationAuth,
  userBindCustomerCode,
  unBindCustomerCode,
  unbindRelationCustomerCode,
  getBindableCompanyList,
  changeCurrentDepartment,
  getMoreDepartment,
} from '@modules/user/apis/customerCode'

export const useCompanyList = () => {
  const store = useCustomerCodeStore()

  /** 加载状态 */
  const loading = ref(false)

  /** 公司列表 */
  const companyList = computed(() => store.companyInfoList)

  /** 当前绑定公司 */
  const currentCompany = computed(() => store.currentCompany)

  /**
   * 获取可绑定公司列表
   *
   * H5 原始实现: getBindableCompanyList().then(res => setCompanyInfoList(res.companyInfoList || []))
   * API返回格式: { companyInfoList: CompanyInfo[], type: number }
   */
  const fetchList = async () => {
    loading.value = true
    try {
      const { data } = (await getBindableCompanyList()) || {}

      // 提取公司列表 (API返回格式: { companyInfoList: CompanyInfo[], type: number })
      const rawList = data?.companyInfoList || data
      const list: CompanyInfo[] = Array.isArray(rawList) ? (rawList as any) : []

      store.setCompanyInfoList(list)

      // 如果有多个公司且未设置当前绑定，自动查找并设置
      if (list.length > 0 && !currentCompany.value) {
        const current = list.find((item) => item.isCurrBond === '1')
        if (current) {
          store.setCurrentCompany(current)
        }
      }

      return list
    } catch (error) {
      console.error('获取公司列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换绑定到指定公司
   *
   * @param company - 目标公司信息
   * @param onSuccess - 成功回调
   */
  const switchBind = async (company: CompanyInfo, onSuccess?: () => void) => {
    try {
      loading.value = true

      // 🔑 设置"切换中"状态（UI 显示加载动画）
      store.setSwitchingCompany(company)

      // 记录原来的当前绑定公司（用于更新 isCurrBond）
      const previousCurrent = store.currentCompany

      // 调用绑定接口（type=1 表示切换）
      await userBindCustomerCode({
        customerCode: company.customerCode,
        customerPwd: '',
        type: 1,
      })

      // 更新当前绑定公司
      store.setCurrentCompany(company)

      // 🔑 关键：联动更新 companyList 中的 isCurrBond 状态
      if (previousCurrent && previousCurrent.customerCode !== company.customerCode) {
        store.updateIsCurrBond(previousCurrent.customerCode, false) // 原公司取消当前绑定
        store.updateIsCurrBond(company.customerCode, true) // 新公司设为当前绑定
      }

      // 🔑 清除"切换中"状态
      store.clearSwitchingCompany()

      onSuccess?.()
      return true
    } catch (error: any) {
      console.error('切换绑定失败:', error)

      // 🔑 失败时也要清除"切换中"状态
      store.clearSwitchingCompany()

      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 解绑指定公司
   *
   * @param company - 要解绑的公司
   * @returns 是否成功
   */
  const unbind = async (company: CompanyInfo, options?: { useRelationUnbind?: boolean }): Promise<boolean> => {
    try {
      loading.value = true

      // useRelationUnbind: 仅一键解绑场景使用关系解绑接口
      // 其他场景（常规解绑、冻结解绑）统一走单个解绑接口
      if (options?.useRelationUnbind) {
        await unbindRelationCustomerCode({ unbindList: [company.customerCode] })
        store.removeCompany(company.customerCode)
      } else {
        await unBindCustomerCode({ customerCode: company.customerCode })
        store.removeCurrentCompany()
      }

      return true
    } catch (error: any) {
      console.error('解绑失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取部门列表（快速寄件页场景）
   *
   * H5 原始实现: getMoreDepartment().then(data => { const deptList = data || [] })
   * API 直接返回部门数组，每个元素包含 current 字段标识当前部门
   */
  const fetchDepartmentList = async (params?: { phone?: string; customerCode?: string }): Promise<DepartmentInfo[]> => {
    loading.value = true
    try {
      const { data } = (await getMoreDepartment(params)) || {}
      const rawData = data as any

      // 确保返回数组格式（兼容直接返回数组或包装后的响应）
      return Array.isArray(rawData) ? rawData : rawData?.vos || []
    } catch (error) {
      console.error('获取部门列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取部门列表并更新Store（内部使用）
   */
  const fetchDepartments = async (customerCode?: string): Promise<DepartmentInfo[]> => {
    try {
      const params: Record<string, string> = {}
      if (customerCode) {
        params.customerCode = customerCode
      }

      const { data } = (await getMoreDepartment(params)) || {}
      console.log('fetchDepartments', data)
      const list: DepartmentInfo[] = Array.isArray(data) ? (data as any) : []

      store.setDepartmentList(list)

      // 如果有多个部门且未设置当前部门，设置第一个为当前
      if (list.length > 0 || !store.currentDepartment) {
        const current = list.find((dept) => dept.current) || list[0]
        store.setCurrentDepartment(current)
      }

      return list
    } catch (error) {
      store.setDepartmentList([])
      store.setCurrentDepartment(null)
      return []
    }
  }

  /**
   * 切换当前部门
   *
   * @param dept - 目标部门
   * @returns 是否成功
   */
  const switchDept = async (dept: DepartmentInfo): Promise<boolean> => {
    try {
      loading.value = true

      await changeCurrentDepartment({
        toDepartmentCode: dept.departmentCode,
        customerCode: currentCompany.value?.customerCode || '',
      })

      // 更新当前部门
      store.setCurrentDepartment(dept)
      return true
    } catch (error: any) {
      console.error('切换部门失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 检测用户是否有绑定/切换权限（H5 原始实现）
   *
   * H5 原始实现 (switch-list.jsx:327):
   * let data = await customerService.getAppUserRelationAuth().catch((err) => {})
   * if (data && !data.bindAuth) {
   *   // 弹出温馨提示：一键解绑 / 去申请
   * }
   *
   * @returns 权限信息，bindAuth=false 表示无权限需先解绑
   */
  const checkBindAuth = async (): Promise<AppUserRelationAuthResponse> => {
    try {
      const { data } = (await getAppUserRelationAuth()) || {}
      return data as AppUserRelationAuthResponse
    } catch (error: any) {
      console.error('获取绑定权限失败:', error)
      throw error
    }
  }

  /**
   * 检测用户对指定客户编码的角色/权限
   *
   * H5 原始实现 (switch-list.vue):
   * const { data } = await getUserRoleByCustomerCode(customerCode)
   * authorizer: data.authorizer  // 10-主授权人 20-副授权人 30-普通账号
   *
   * 用于:
   * - 解绑前获取角色信息以显示不同提示文案
   *
   * @param customerCode - 客户编码
   * @returns 用户角色信息，包含 msg/authorizer 字段
   */
  const checkUserRole = async (customerCode: string): Promise<UserRoleResponse> => {
    try {
      const { data } = (await getUserRoleByCustomerCode({ customerCode })) || {}
      console.log('getUserRoleByCustomerCode', data)
      return data as UserRoleResponse
    } catch (error: any) {
      console.error('获取用户角色失败:', error)
      throw error
    }
  }

  return {
    loading,
    companyList,
    currentCompany,
    fetchList,
    switchBind,
    unbind,
    fetchDepartmentList,
    fetchDepartments,
    switchDept,
    checkBindAuth,
    checkUserRole,
  }
}
