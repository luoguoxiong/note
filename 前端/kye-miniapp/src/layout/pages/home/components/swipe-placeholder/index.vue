<template>
  <!-- 使用支付宝小程序的 view 组件 -->
  <view class="home-page-search-notice">
    <!-- 使用支付宝小程序的 swiper 组件替代 van-swipe -->
    <ky-swiper
      :isPreventDefault="isH5 ? false : true"
      :direction="'vertical'"
      class="notice-swipe"
      :auto-play="autoPlay ? 2000 : 0"
      :init-page="0"
      :key="currentKey"
      @change="handleChange"
    >
      <view v-for="(item, index) in noticeItems" :key="item.text" @tap.stop="handleClick(item.text)">
        <ky-swiper-item :key="index">
          <view class="notice-item">
            <view class="text">{{ item.text }}</view>
            <view class="icon">{{ item.iconText }}</view>
          </view>
        </ky-swiper-item>
      </view>
    </ky-swiper>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import './index.scss'

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB

const emit = defineEmits(['click'])

const autoPlay = ref(true)
const currentKey = ref(Date.now())
const currentIndex = ref(0)

const noticeItems = [
  {
    text: '输入单号, 秒查物流轨迹',
    iconText: '极速查',
  },
  {
    text: '试试搜: 查询网点、时效运费',
    iconText: '帮您找',
  },
  {
    text: '试试搜: 帮我查到北京的快件',
    iconText: '秒懂您',
  },
]

const handleClick = (text: string) => {
  emit('click', text)
}

const handleChange = (index: number) => {
  currentIndex.value = index
}

const handleTosearch = () => {
  handleClick(noticeItems[currentIndex.value].text)
}

onMounted(() => {
  autoPlay.value = true
})

useDidShow(() => {
  currentKey.value = Date.now()
  autoPlay.value = true
})

useDidHide(() => {
  autoPlay.value = false
})

defineExpose({
  handleTosearch,
})
</script>
