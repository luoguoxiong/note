import * as Apis from '../../apis'
import { config } from '../../config'
import { CouponCategoryEnum } from '../../apis/types'
import type { CouponCard } from './coupon-card'

export type CouponVerifyResult = 'usable' | 'invalid' | 'error'

/**
 * 「立即寄件」二次校验：重调 task 接口，在最新 couponCardList 中匹配该卡是否仍可用。
 * 下单券按 couponBaseCode 匹配，免单券按 activityId 匹配。仅读取响应做匹配，
 * MUST NOT 写回 store（避免点击瞬间卡片重排）。
 */
export const verifyCouponUsable = async (card: CouponCard): Promise<CouponVerifyResult> => {
  if (card.kind === 'receive') return 'usable'
  try {
    const { data } = await Apis.getHomepageTask({ channel: config.channelCode })
    const list = data.couponCardList || []
    if (card.kind === 'order') {
      return list.some(
        (c) =>
          c.couponCategory === CouponCategoryEnum.Order &&
          c.couponBaseCode !== undefined &&
          c.couponBaseCode === card.couponBaseCode,
      )
        ? 'usable'
        : 'invalid'
    }
    return list.some((c) => c.couponCategory === CouponCategoryEnum.Free && c.activityId === card.activityId)
      ? 'usable'
      : 'invalid'
  } catch (error) {
    console.error('verifyCouponUsable', error)
    return 'error'
  }
}
