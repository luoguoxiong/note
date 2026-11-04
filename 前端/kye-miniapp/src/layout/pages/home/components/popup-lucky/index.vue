<template>
  <view className="lpp">
    <view className="lpp__warpper">
      <view className="lpp__box">
        <view className="lpp__head"> <image src="https://ic-h5.kye-erp.com/intro/miniprogram/lucky-head.png" /></view>
        <view className="lpp__content">
          <view className="lpp__p2">
            <text>+</text>
            <text>{{ integralAmount }}</text>
          </view>
          <view className="lpp__p3">
            恭喜您！使用小程序发货，首单奖励{{ integralAmount }}积分！每人限领1次！先寄先得！
          </view>
          <view className="lpp__btn" @click="onConfirm">马上寄件</view>
          <view className="lpp__sm">*活动最终解释权归跨越速运集团所有</view>
        </view>
      </view>
      <view className="lpp__close">
        <image
          @tap="onCancel"
          src="https://ic-img.ky-express.com/netc/20250708_97743_!!1751939581511_148_144.png"
        ></image>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import './index.scss'
import { computed, toRefs } from 'vue'
import { useHomeStore } from '../../store'
import kyeNavigate from '@/public/utils/native/navigate'

const homeStore = useHomeStore()

const { data, updateData } = toRefs(homeStore)

const luckyPopup = computed(() => data.value.luckyPopup)

const integralAmount = computed(() => luckyPopup.value.integralAmount)

const onCancel = () => {
  updateData.value({
    luckyPopup: {
      show: false,
      integralAmount: 0,
    },
  })
}

const onConfirm = () => {
  updateData.value({
    luckyPopup: {
      show: false,
      integralAmount: 0,
    },
  })
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/order-build/pages/order/index',
  })
}
</script>
