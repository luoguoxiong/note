import { useFreightTimeStore } from '../../../store'
import { useRoleFlags } from '@/layout/pages/home/hooks/use-role-flags'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import type { CouponItem } from '../../../types'

/** fetchNewCustomerActivity 返回类型 */
interface UseNewCustomerActivityReturn {
  fetchNewCustomerActivity: (fromOrigin?: boolean) => Promise<void>
}

/**
 * 获取新客活动数据并写入 store
 * 映射自 netc-h5-order-old 首页逻辑：
 * - hasLeadCapture 已留资 → resourceFlag = true
 * - 无留资 + 新客 → 调新客活动接口
 * - 首页已透传 activityParams → 直接使用
 */
export function useNewCustomerActivity(): UseNewCustomerActivityReturn {
  const store = useFreightTimeStore()
  const { isNew, hasLeadCapture, activityParams } = useRoleFlags()
  const userActivity = useNewUserActivity()

  /**
   * @param fromOrigin - 是否从首页 origin 跳入（true 时跳过步骤 1/2，直接走接口逻辑）
   */
  async function fetchNewCustomerActivity(): Promise<void> {
    store.setIsNewCustomer(isNew.value)
    store.setResourceFlag(false)
    store.setCouponList([])
    // 新客
    if (isNew.value) {
      await userActivity.getNewCustomerInfo(true)
    }

    // 1. 首页透传优惠券参数（activityParams 已合并 activityParams 的字段）
    const params = activityParams.value || {}
    if ((params.receiveSource || params.waybillReceiveSource)) {
      const coupons: CouponItem[] = []
      if (params.receiveSource) {
        coupons.push({
          receiveSource: String(params.receiveSource),
          activityId: String(params.activityId || ''),
          couponCount: String(params.couponCount || ''),
        })
      }
      if (params.waybillReceiveSource) {
        coupons.push({
          receiveSource: String(params.waybillReceiveSource),
          activityId: String(params.waybillActivityId || ''),
          couponCount: String(params.waybillCouponCount || ''),
        })
      }
      store.setCouponList(coupons)
      return
    }

    // 2. 已留资
    if (hasLeadCapture.value) {
      store.setResourceFlag(true)
      return
    }

  }

  return {
    fetchNewCustomerActivity,
  }
}
