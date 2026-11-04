<template>
  <view class="share" :style="{ background: pageBgColor }">
    <view class="share-image">
      <!-- 背景图 -->
      <image :src="bgSrc" />
    </view>
    <view
      class="share__footer"
      :class="{ 'share__footer--lingxin': isTransterToLingxin }"
    >
      <view
        class="share__btn"
        :class="{ 'share__btn--lingxin': isTransterToLingxin }"
        @tap="handleGoHome"
      >
        {{ params.buttonName || '进入小程序' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useRouter } from '@tarojs/taro'
import { computed } from 'vue'
import './index.scss'

const { params } = useRouter() as any
console.log('share页面：params==', params)

const LINGXIN_TRANSFER_BG_URL = 'https://dre-erp-fe-1257092428.cos.ap-guangzhou.myqcloud.com/crm/integral-center-new/background-images/lingxian-transfer-page.png'
const DEFAULT_BG_URL = 'https://ic-img.ky-express.com/netc/20250523_3758405346_!!1747971338481_1500_2896.png'
const DEFAULT_PAGE_BG = '#c299f1' //  默认背景色
const LINGXIN_PAGE_BG = '#ffc2c5' // 跨领鲜中转页背景色
// 跳转跨越领鲜中转页标识，传参与接收统一为 '1'
const IS_TRANSFER_TO_LINGXIN = '1'

const isTransterToLingxin = computed(() => params?.isTransterToLingxin === IS_TRANSFER_TO_LINGXIN)
const bgSrc = computed(() => {
  return isTransterToLingxin.value ? LINGXIN_TRANSFER_BG_URL : DEFAULT_BG_URL
})
const pageBgColor = computed(() =>
  isTransterToLingxin.value ? LINGXIN_PAGE_BG : DEFAULT_PAGE_BG
)


const initData = () => {
  const token = Taro.getStorageSync('wxToken')

  let path = decodeURIComponent(params?.path)

  if (params.appId === 'wxb1503f29025cc7aa' && token) {
    if (path.indexOf('?') > 0) {
      path = path + '&fromId=114&token=' + token
    } else {
      path = path + '?fromId=114&token=' + token
    }
  }

  Taro.navigateToMiniProgram({
    appId: params.appId,
    path,
    envVersion: process.env.NODE_ENV === 'production' ? 'release' : 'trial',
  })
}

const handleGoHome = () => {
  initData()
}
</script>
