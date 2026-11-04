<template>
  <view class="scanLoginContainer">
    <view class="scanLoginContent">
      <view class="scanResult">
        <image
          class="scan-result-img"
          src="https://ic-img.ky-express.com/netc/20221102_74621882340_!!1667376687733_384_394.png"
        />
        <text class="text">{{ resultText }}</text>
        <view v-if="params.pageType === '10'" class="scan-result-desc">已默认绑定微信手机号</view>
        <view className="scan-result-info" v-if="params.pageType === '20'">
          <view className="scan-result-info__phone" v-if="loginPhone">登录手机号：{{ loginPhone }}</view>
          <ky-button className="scan-result-info__enter-btn" @click="onClickEnter">进入跨越寄件小程序</ky-button>
        </view>
        <view class="offline-container" :style="{ display: !isSubscribe ? 'block' : 'none' }">
          <OfficialAccount />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserInfo } from '@/public/hooks'
import { OfficialAccount } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { computed } from 'vue'

defineOptions({ name: 'scanLoginResult' })

const router = useRouter()
const params = computed(() => router.params || {})

const resultTextMapping = {
  10: '已确认登录跨越速运电脑端',
  20: '跨越寄件小程序已登录客户端手机号',
}

const resultText = computed(() => {
  return params.value.pageType ? resultTextMapping[params.value.pageType] || '' : ''
})

const filterMobliePhone = (val: string) => {
  if (!val) return ''
  const pat = /(\d{3})\d*(\d{4})/
  val = val.replace(/\s/g, '')
  return val.replace(pat, '$1****$2')
}

const { userInfo } = useUserInfo()

// 登录手机号
const loginPhone = computed(() => {
  const phone = params.value.loginPhone || userInfo.value.phone || ''
  return filterMobliePhone(phone)
})

const isSubscribe = computed(() => {
  return params.value.subscribe === '1'
})

const onClickEnter = () => {
  Taro.switchTab({
    url: '/layout/pages/home/index',
  })
}
</script>

<style lang="scss">
$theme-color: #8365f6;

.scanLoginContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}

.scanLoginContent {
  text-align: center;
  margin: 252px auto 0;

  .text {
    font-weight: bold;
    color: #03050d;
    font-size: 36px;
  }

  .scan-result-img {
    width: 192px;
    height: 197px;
    margin: 0 auto 142px;
    display: block;
  }
  .scan-result-desc {
    padding-top: 24px;
    font-size: 24px;
    color: #6e6d72;
  }
}

.scanResult {
  max-width: 100%;
}

.offline-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: left;
}

.scan-result-info {
  margin-top: 24px;
  text-align: center;
  &__phone {
    color: #6e6d72;
    font-size: 24px;
    margin-bottom: 50px;
  }
  &__enter-btn {
    border-radius: 16px;
    box-sizing: border-box;
    border: 2px solid #8365f6;
    padding: 0px 32px;
    width: 452px;
    height: 88px;
    font-size: 32px;
    font-weight: 600;
    color: #8365f6;
    text-align: center;
    line-height: 88px;
    background: #ffffff;
  }
}
</style>
