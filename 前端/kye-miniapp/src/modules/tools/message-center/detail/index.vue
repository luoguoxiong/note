<template>
  <view class="message-center" v-if="getDetail">
    <view class="message-center__banner">
      <image
        class="message-center__banner--img"
        src="https://ic-img.ky-express.com/netc/20251230_95816_!!1767086331770_1500_386.png"
      ></image>
    </view>
    <view class="message-center__wrapper">
      <view class="message-center__title">{{ getDetail.messageTitle }}</view>
      <view class="message-center__content">
        <view style="white-space: pre-wrap">{{ filterMessageContent(getDetail.messageContent) }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRouter } from '@tarojs/taro'
import { onMounted, ref } from 'vue'
import * as API from '../apis'
import './index.scss'
import { getReportSorce } from '@/public/components/business/advertise-center/utils'

const router = useRouter()
const { messageSerialNumber, messagePushTime, messageType } = router.params

const getDetail = ref()

const getUserMessageDetail = async () => {
  const { operatePort, operatorSystem } = getReportSorce()
  try {
    let res = await API.getUserMessageDetail({
      messageSerialNumber,
      messagePushTime,
      messageType,
      operatePort,
      operatorSystem
      // operatePort: isAppBrowse ? 'APP' : 'MINIPROGRAM',
      // operatorSystem: isIphone ? 'ios' : 'android',
    })
    getDetail.value = res.data
  } catch (error) {
    console.log(error)
  }
}

const filterMessageContent = (text: string) => {
  const hasHTMLTag = /<\/?\w+[^<>/]*\/?>/.test(text)
  if (hasHTMLTag) {
    return text.split(/<\/?\w+[^<>/]*\/?>/).map(t => t.trim()).filter(Boolean).join('; ')
  }
  return text
}

onMounted(() => {
  getUserMessageDetail()
})
</script>
