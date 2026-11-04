<template>
  <view class="intergral-authorization__richText">
    <view class="content">
      <rich-text v-if="content" :nodes="content"></rich-text>
    </view>
    <view class="bottom-btns">
      <ky-button
        size="large"
        type="primary"
        :class="['btn', { 'btn-color': seconds <= 0 }]"
        :disabled="seconds > 0"
        @tap="onApply"
      >
        我已同意授权
        <text v-if="seconds > 0" class="btn-seconds"> ({{ seconds }}s) </text>
      </ky-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed, onMounted, ref } from 'vue'
import { useCountdown } from '@/public/hooks'
import { getHelp, getNewHelpAgreement } from './api/index'
import './index.scss'

defineOptions({ name: 'AuthAgreement' })

const isAgree = ref(false)
const content = ref('')
const isApply = ref(false)

const countDown = useCountdown(3)
const seconds = computed(() => countDown.seconds.value)

// 获取协议详情
const getDetail = async () => {
  // const { data } = await getHelp({ id: 201 })
  const { data } = await getNewHelpAgreement({ pageType: '5_1' })
  if (!data || !data.length) return

  content.value = data[0].agreementContent
    .replace('/\n/g', '<br>')
    .replace(/(\r\n|\n)/gm, '<br>')
    .replaceAll('<span></span><br></p><br>', '</p>')
    .replaceAll('<p class="MsoNormal"><span></span></p>', '<br/>')
    .replaceAll('<p class="MsoNormal"><br>	</p>', '<p class="MsoNormal">	</p>')
    .replaceAll('</p><br><p class="MsoNormal">', '</p><p class="MsoNormal">')
}

// 初始化
const init = () => {
  const isAgreeValue = getIsAgreeLocalStorage()
  if (!isAgreeValue) {
    countDown.start()
  }
}

// 设置本地是否同意授权转让须知
const setIsAgreeLocalStorage = (value) => {
  Taro.setStorageSync('isAuthAgreement', value)
}

// 获取本地是否同意授权转让须知
const getIsAgreeLocalStorage = () => {
  const isAgreeValue = Taro.getStorageSync('isAuthAgreement') || false
  return isAgreeValue === true
}

// 点击同意授权
const onApply = async () => {
  if (isApply.value) {
    return false
  }
  isApply.value = true
  isAgree.value = true
  setIsAgreeLocalStorage(true)

  Taro.navigateBack()
}

// 页面显示时的处理
onMounted(() => {
  init()
  getDetail()
})
</script>
