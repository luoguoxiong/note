import { computed, ref } from 'vue'
import { useHomeStore } from '../store'
import { useGeneralDataHook } from '@/public/storage/hooks/useGeneralDataHook'
import { useCommonDataHook } from '@/public/storage/hooks/useCommonHook'
import { useLogin, useUserInfo } from '@/public/hooks'
import { useNewUserActivity } from '@/store/useNewUserActivity'

interface ActivityParams {
  hasLeadCapture: number
  phone?: string
  receiveSource?: number
  activityId?: number
  couponCount?: number
  waybillReceiveSource?: number
  waybillActivityId?: number
  waybillCouponCount?: number
  hasLeadCaptureActivity?: number
  hasShippingExpiredActivity?: number
}

export function useRoleFlags() {
  const store = useHomeStore()

  const userActivity = useNewUserActivity()

  const { getGeneralData } = useGeneralDataHook()

  const { onGlobalDataChange } = useCommonDataHook()
  const { userInfo } = useUserInfo()

  const { isLogin } = useLogin()

  const globalData = ref(getGeneralData())

  onGlobalDataChange(() => {
    globalData.value = getGeneralData()
  })

  const isNew = computed(() => {
    return `${userInfo.value?.isOldCustomer}` !== '1' && isLogin.value
  })

  const activityParams = computed(() => {
    if (!isNew.value) {
      return {}
    }
    const params: ActivityParams = {
      hasLeadCapture: userActivity.data.hasLeadCapture ? 1 : 0,
      phone: userInfo.value?.phone,
    }
    if (userActivity.data.hasLeadCaptureActivity && isNew.value) {
      const { receiveSource, activityId, couponCount } = userActivity.data.newCustomerActivity
      params.receiveSource = receiveSource
      params.activityId = activityId
      params.couponCount = couponCount
      params.hasLeadCaptureActivity = 1
    }
    if (userActivity.data.hasShippingExpiredActivity && isNew.value) {
      const { receiveSource, activityId, couponCount } = userActivity.data.waybillActivity
      params.waybillReceiveSource = receiveSource
      params.waybillActivityId = activityId
      params.waybillCouponCount = couponCount
      params.hasShippingExpiredActivity = 1
    }
    return params
  })

  // 0 老客，1 新客未留资有活动，2 新客未留资无活动，3 新客已留资
  const activeType = computed(() => {
    if (!isNew.value) {
      return 0
    }

    if (userActivity.data.hasLeadCapture) {
      return 3
    }

    return userActivity.data.hasLeadCaptureActivity ? 1 : 2
  })

  return {
    isLogin,
    isBindCode: computed(() => Boolean(userInfo.value?.customerCode)),
    isNew,
    isSign: computed(() => store.data.isSign),
    isEmployee: computed(() => globalData.value.isEmployee),
    hasSale: computed(() => store.data.hasSale),
    /** 有无商务二维码 */
    hasBusinessQrcode: computed(() => store.data.hasBusinessQrcode),
    /** 有无商务名称 */
    businessName: computed(() => store.data.businessName),
    /** 老客 */
    isOldCustomer: computed(() => !isNew.value && isLogin.value),
    /** 新客或未登录 */
    isNewOrNoLogin: computed(() => (isNew.value && isLogin.value) || !isLogin.value),
    /** 老客未绑码 */
    isNoBindCode: computed(() => !userInfo.value?.customerCode && !isNew.value && isLogin.value),
    /** 有无留资 */
    hasLeadCapture: computed(() => userActivity.data.hasLeadCapture),
    /** 有无运费时效活动 */
    hasShippingExpiredActivity: computed(() => userActivity.data.hasShippingExpiredActivity),
    /** 是否存在留资类活动 */
    hasLeadCaptureActivity: computed(() => userActivity.data.hasLeadCaptureActivity),
    // 留资活动跳转参数
    activityParams,
    activeType,
  }
}
