/**
 * 申请绑定其他公司 - 业务逻辑 Hook
 *
 * 封装表单状态管理、动态表单、联想推荐、提交逻辑
 * 供主页面组件调用
 */
import { reactive, computed } from 'vue'
import Taro from '@tarojs/taro'
import {
  getFrontRecommendCustomer,
  bindOtherCustomerList,
  batchCheckBlackCustomerCode,
} from '@modules/user/apis/customerCode'
import { other_customer_code_bind_other_company_apply_sub } from '../../report/index'
import type { RecommendItem, ApplyBindFormState } from '../types'
import { MAX_COMPANY_COUNT, MIN_COMPANY_COUNT, MAX_RECOMMEND_LIST } from '../types'

export const useApplyBind = (title) => {
  const state = reactive<ApplyBindFormState>({
    // 使用 key 模式控制显示的客户编码字段
    visibleKeys: ['customerCode1'],
    localModel: {
      reason: '',
    },
    currentCode: '',
    reason: '',
    errorReason: false,
    loading: false,
    recommendList: [],
    realList: [],
    curBlurIndex: null,
    textareaInputing: false,
    showCaptcha: false,
    showAlert: false,
    safeVerifyId: '',
  })

  const isCanAdd = computed(() => state.visibleKeys.length < MAX_COMPANY_COUNT)
  const isCanRemove = computed(() => state.visibleKeys.length > MIN_COMPANY_COUNT)
  const addNum = computed(() => state.visibleKeys.length)

  // 所有的 customerCode keys
  const allCustomerCodeKeys = Array.from({ length: MAX_COMPANY_COUNT }, (_, i) => `customerCode${i + 1}`)

  const addCompany = () => {
    if (!isCanAdd.value) {
      Taro.showToast({ title: `新增客户编码已达上限${MAX_COMPANY_COUNT}`, icon: 'none' })
      return
    }
    // 找到下一个未使用的 key
    const nextKey = allCustomerCodeKeys.find(key => !state.visibleKeys.includes(key))
    if (nextKey) {
      state.visibleKeys.push(nextKey)
    }
  }

  const removeCompany = (key: string) => {
    if (!isCanRemove.value) {
      Taro.showToast({ title: `至少要有${MIN_COMPANY_COUNT}个申请绑定公司`, icon: 'none' })
      return
    }
    const index = state.visibleKeys.indexOf(key)
    if (index !== -1) {
      state.visibleKeys.splice(index, 1)
    }
  }

  const fetchRecommendList = async () => {
    try {
      const res = await getFrontRecommendCustomer()
      const list = res?.data || []
      state.recommendList = list.map((item) => ({
        customerCode: item.customerCode || '',
        customerShortName: item.customerShortName || '',
        selected: false,
        customerName: item.customerName,
      }))
    } catch (error) {
      console.error('获取推荐列表失败:', error)
    }
  }

  const filterRecommendList = (value: string, key: string, localModel: Record<string, string>) => {
    if (!value) {
      state.realList = []
      return
    }

    const selectedCodes = state.visibleKeys.map((k) => localModel[k]).filter(Boolean)

    const filtered = state.recommendList.filter(
      (obj) => obj.customerCode.includes(value) || obj.customerShortName.includes(value),
    )

    state.realList = filtered.slice(0, MAX_RECOMMEND_LIST).map((item) => ({
      ...item,
      selected: selectedCodes.includes(item.customerCode),
    }))
  }

  const selectRecommend = (item: RecommendItem, key: string, localModel: Record<string, string>) => {
    localModel[key] = item.customerCode
  }

  const handleBatchCheck = async (localModel: Record<string, string>): Promise<boolean> => {
    const codes = state.visibleKeys.map((key) => localModel[key]).filter(Boolean)

    try {
      const res = await batchCheckBlackCustomerCode({
        customerCodeList: codes,
      })
      console.log(res)
      return true
    } catch (error: any) {
      Taro.showToast({ title: error?.msg || '批量校验失败', icon: 'none' })
      return false
    }
  }

  const handleSubmit = async (localModel: Record<string, string>) => {
    if (state.loading) return

    state.loading = true

    try {
      const batchValid = await handleBatchCheck(localModel)
      if (!batchValid) {
        state.loading = false
        return
      }

      const codes = state.visibleKeys.map((key) => localModel[key]).filter(Boolean)

      const res = await bindOtherCustomerList({
        applyBindCustomerCodeList: codes,
        applyReason: localModel.reason,
      })
      console.log('bindOtherCustomerList', res)

      // 埋点：申请绑定其他公司成功
      other_customer_code_bind_other_company_apply_sub('成功')

      Taro.redirectTo({
        url: `/modules/user/pages/customer-code/apply-result/index?title=${title}&applyStatus=0`,
      })
    } catch (error: any) {
      // 埋点：申请绑定其他公司失败
      other_customer_code_bind_other_company_apply_sub('失败', error?.msg || '提交失败')
      Taro.showToast({ title: error?.msg || '提交失败，请重试', icon: 'none' })
    } finally {
      state.loading = false
    }
  }

  const handleCaptchaSuccess = (verifyId: string) => {
    state.safeVerifyId = verifyId
    state.showCaptcha = false
  }

  const hasUnsavedData = (localModel: Record<string, string>): boolean => {
    const hasCode = state.visibleKeys.some((key) => localModel[key]?.trim())
    const hasReason = state.localModel.reason.trim().length > 0
    return hasCode || hasReason
  }

  const resetForm = () => {
    state.visibleKeys = ['customerCode1', 'customerCode2']
    state.localModel.reason = ''
    state.errorReason = false
    state.loading = false
    state.realList = []
    state.curBlurIndex = null
    state.textareaInputing = false
    state.showAlert = false
    state.safeVerifyId = ''
  }

  return {
    state,
    isCanAdd,
    isCanRemove,
    addNum,
    // totalNum,
    addCompany,
    removeCompany,
    fetchRecommendList,
    filterRecommendList,
    selectRecommend,
    handleSubmit,
    handleBatchCheck,
    handleCaptchaSuccess,
    hasUnsavedData,
    resetForm,
  }
}
