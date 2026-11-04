import { nextTick, useDidHide, useDidShow } from '@tarojs/taro'
import { onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import { createObserve } from '@/public/createObserve'
import { reportCouponCardExposure } from '../../report'
import { getCardTypeName } from './coupon-card'
import type { CouponCard } from './coupon-card'

/**
 * 单卡曝光：每张卡建立独立 observer，露出即上报。
 * 卡片列表变化（接口刷新）后按新顺序重建观测，本次页面展示内同一张卡只报一次。
 */
export const useCardExposure = (cards: Ref<CouponCard[]>) => {
  /** 本次页面展示中已上报过曝光的卡片 key */
  const reportedCardKeys = new Set<string>()
  let closes: Array<() => void> = []

  const stopObserve = () => {
    closes.forEach((close) => close?.())
    closes = []
  }

  const observeCards = () => {
    stopObserve()
    closes = cards.value.map((card, index) => {
      let close: (() => void) | undefined
      close = createObserve(`coupon-card-ex-${index}`, () => {
        // createObserve 原生端触发后不会自动断开，需手动关闭
        close?.()
        if (reportedCardKeys.has(card.key)) return
        reportedCardKeys.add(card.key)
        reportCouponCardExposure(getCardTypeName(card))
      })
      return () => close?.()
    })
  }

  onMounted(() => nextTick(observeCards))
  // 券列表刷新（领取失败后重查 task 接口）后重建观测
  watch(
    () => cards.value.map((card) => card.key).join('|'),
    () => nextTick(observeCards),
  )
  useDidShow(() => nextTick(observeCards))
  useDidHide(() => {
    stopObserve()
    reportedCardKeys.clear()
  })
  onUnmounted(stopObserve)
}
