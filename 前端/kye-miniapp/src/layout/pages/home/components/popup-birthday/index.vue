<template>
  <view class="hbp">
    <view class="hbp__warpper">
      <view class="hbp__head">
        <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/birthday-head.png`" />
      </view>

      <view class="hbp__content">
        <view class="hbp__p1">尊敬的跨越用户 </view>
        <view class="hbp__p2">祝您生日快乐！</view>
        <view class="hbp__p3">
          <text>+</text>
          <text>{{ integral }}</text>
        </view>
        <view class="hbp__p4"> 感谢您的陪伴与支持，给您赠送{{ integral }}积分，希望跨越能陪您度过每一个生日！ </view>
        <view class="hbp__btn" @click="onConfirm">开心收下</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useHomeStore } from '../../store'
import './index.scss'

const homeStore = useHomeStore()

const { data, updateData } = toRefs(homeStore)

const integral = computed(() => data.value.birthdayPopupInfo.integral)

const onConfirm = () => {
  updateData.value({
    birthdayPopupInfo: {
      isNeedPopUp: false,
      integral: 0,
    },
  })
}
</script>
