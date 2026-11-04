<template>
  <view v-if="cards.length" class="coupon-package-wrapper">
    <view
      class="coupon-area"
      id="coupon-package-ex"
    >
      <scroll-view
        class="coupon-area__scroll"
        :scroll-x="true"
        enhanced
        :show-scrollbar="false"
        enable-flex
        style="white-space: nowrap"
      >
        <CouponCardItem
          v-for="(card, index) in cards"
          :id="`coupon-card-ex-${index}`"
          :key="card.key"
          :card="card"
          :single="cards.length === 1"
          :receive-data="card.kind === 'receive' ? card.receive : undefined"
          :receive-loading="loading"
          @receive="handleReceive"
          @ship="handleShip"
        />
      </scroll-view>
      <!-- 查看更多：跳我的-优惠券 -->
      <view class="coupon-area__more" @tap="goMyCoupon">
        <text class="coupon-area__more-text">查看全部</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useHomeStore } from '../../store'
import { showDialog } from '@kye-netc/kye-miniui'
import CouponCardItem from './coupon-card-item.vue'
import { getCardTypeName, mapCouponCards } from './coupon-card'
import type { CouponCard } from './coupon-card'
import { verifyCouponUsable } from './verify'
import * as Apis from '../../apis'
import './index.scss'
import Taro from '@tarojs/taro'
import { navigateWithParams } from '../../hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { getEnvConfig } from '@/public/config'

import kyeNavigate from '@/public/utils/native/navigate'
import { reportCouponClick } from '../../report'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { useCardExposure } from './use-card-exposure'

defineOptions({ name: 'coupon-package' })

useExposureReport(['coupon-package-ex'])

const homeStore = useHomeStore()
const loading = ref(false)
const shipLoading = ref(false)

/** 统一卡片列表：接口已排序/合并/截断，领券卡叠加本地领取/失效状态 */
const cards = computed(() => mapCouponCards(homeStore.data.couponCardList, homeStore.data.couponLocalStatus))

/** 领券卡（同一区域至多一张） */
const receiveCard = computed(() => cards.value.find((c) => c.kind === 'receive'))

/** 单卡曝光：露出即上报 */
useCardExposure(cards)

// 查看更多：跳我的-优惠券
const goMyCoupon = () => {
  reportCouponClick('查看全部')
  navigateWithParams(ApplicationCodeMap['首页-优惠券'])
}

// 立即寄件：二次校验后跳快速寄件（不写回 store）
const handleShip = async (card: CouponCard) => {
  reportCouponClick('立即寄件', getCardTypeName(card))
  if (shipLoading.value) return
  shipLoading.value = true
  try {
    const result = await verifyCouponUsable(card)
    if (result === 'usable') {
      kyeNavigate.navigateBefore('navigateTo', {
        url: '/modules/order-build/pages/order/index',
      })
      return
    }
    Taro.showToast({
      icon: 'none',
      title: result === 'invalid' ? '该优惠券已失效' : '网络异常，请稍后重试',
    })
  } finally {
    shipLoading.value = false
  }
}

// 领券：现有领取逻辑，卡片状态以本地覆盖为准
const handleReceive = async () => {
  const card = receiveCard.value
  if (!card || card.kind !== 'receive') return
  const { id, receive } = card
  reportCouponClick(receive.isGet ? '立即寄件' : '立即领取', getCardTypeName(card))
  if (receive.invalidated) {
    return
  }
  if (receive.isGet) {
    kyeNavigate.navigateBefore('navigateTo', {
      url: '/modules/order-build/pages/order/index',
    })
    return
  }
  try {
    loading.value = true
    await Apis.receiveHomepageCoupon(
      {
        activityId: id,
        from: getEnvConfig().isApp ? 1 : 2,
      },
      { hideToast: true },
    )
    homeStore.updateLocalCouponStatus(id, { isGet: true })
    Taro.showToast({ title: '领取成功', icon: 'none' })
  } catch (e: any) {
    if (+e.code === 38009) {
      await showDialog({
        parentClassName: 'home-page', // 就近的根节点class
        title: '温馨提示',
        message: '领取失败，该优惠券已失效',
        confirmButtonText: '我知道了',
        showCancelButton: false,
        showConfirmButton: true,
      })

      homeStore.updateLocalCouponStatus(id, { invalidated: true })
    } else {
      if (+e.code === 38010) {
        homeStore.updateLocalCouponStatus(id, { isGet: true })
      }
      Taro.showToast({ icon: 'none', title: e.message })
    }
    homeStore.getCouponAndSign()
  } finally {
    loading.value = false
  }
}
</script>
