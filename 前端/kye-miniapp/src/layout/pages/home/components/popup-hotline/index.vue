<template>
  <view class="hotline">
    {{ hotlinePopupInfo.rewardType }}
    <view class="hotline-warpper" v-if="type !== '3'">
      <view class="hotline-content">
        <view @click="onConfirm" v-if="type === '1'">
          <image class="hotline-bg" :src="`https://ic-h5.kye-erp.com/intro/miniprogram/bg_cash.png`" />
          <view class="hotline-num">
            <image
              v-for="(item, index) in reward.split('')"
              :key="index"
              class="integral_num"
              :src="filterImage(item)"
            />
            <image class="element" src="https://ic-img.ky-express.com/netc/20250708_51545_!!1751939555160_98_120.png" />
          </view>
          <view class="hotline-btn">
            <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/bg_btn.png`" />
            <text>立即查看</text>
          </view>
        </view>

        <view @click="onConfirm" v-if="type === '2'">
          <image class="hotline-bg" :src="`https://ic-h5.kye-erp.com/intro/miniprogram/bg_integral.png`" />
          <view class="hotline-num">
            <image
              v-for="(item, index) in reward.split('')"
              :key="index"
              class="integral_num"
              :src="filterImage(item)"
            />
            <image
              class="integral"
              src="https://ic-img.ky-express.com/netc/20230925_91921882377_!!1695651800584_196_120.png"
            />
          </view>
          <view class="hotline-btn">
            <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/bg_btn.png`" />
            <text>立即查看</text>
          </view>
        </view>
      </view>
      <view class="close">
        <image @tap="onCancel" src="https://ic-img.ky-express.com/netc/20250708_97743_!!1751939581511_148_144.png" />
      </view>
    </view>

    <view class="hotline-warpper" v-else>
      <view class="hotline-box" @click="onConfirm">
        <view class="hotline-barnner">
          <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/banne_reply.png`" />
        </view>
        <view class="reply_text">您收到{{ num }}条回复，请查看</view>
        <view class="reply_btn">
          <image src="https://ic-img.ky-express.com/netc/20250708_4090_!!1751939607826_510_84.png" />
          <text>立即查看</text>
        </view>
        <view class="reply_sm">可在"我的-总裁信箱"查看</view>
      </view>
      <view class="reply-close">
        <image @tap="onCancel" src="https://ic-img.ky-express.com/netc/20250708_97743_!!1751939581511_148_144.png" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import './index.scss'
import { useHomeStore } from '../../store'
import { openURL } from '@/modules/webview/utils'
import { urlContact } from '@/public/utils'

const homeStore = useHomeStore()

const { data, updateData } = toRefs(homeStore)

const hotlinePopupInfo = computed(() => data.value.hotlinePopupInfo)

const type = computed(() => {
  const rewardType = hotlinePopupInfo.value.rewardType
  return rewardType === '40' ? '1' : rewardType === '20' ? '2' : '3'
})
const reward = computed(() => hotlinePopupInfo.value.rewardAmount)
const num = computed(() => hotlinePopupInfo.value.count)

const filterImage = (item: string) => {
  return `https://ic-h5.kye-erp.com/intro/miniprogram/element_${item}.png`
}

const onConfirm = () => {
  openURL(
    urlContact(hotlinePopupInfo.value.url, {
      type: 'feedback',
    }),
    {
      needLogin: true,
    },
  )
  updateData.value({
    hotlinePopupInfo: {
      showHotline: false,
      fbId: '',
      rewardType: '1',
      rewardAmount: '0',
      count: 0,
      url: '',
    },
  })
}

const onCancel = () => {
  updateData.value({
    hotlinePopupInfo: {
      showHotline: false,
      fbId: '',
      rewardType: '1',
      rewardAmount: '0',
      count: 0,
      url: '',
    },
  })
}
</script>
