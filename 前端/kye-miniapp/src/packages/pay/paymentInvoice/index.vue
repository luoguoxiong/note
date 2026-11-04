<template>
  <view class="payment-invoice-wrapper">
    <image class="left" :src="fileIconConfig[suffix]" />
    <view class="right">
      <view class="title">{{ params.title }}</view>
      <view class="info">
        <text class="time">{{ params.time }}</text>
        <text v-if="params.size" class="size">{{ params.size }}MB</text>
      </view>
    </view>
    <view class="footer-bottom">
      <view class="footer-bottom__buttons">
        <button class="button button-primary" @tap="handleTranferFile">文件转发</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import './index.scss'

defineOptions({ name: 'PaymentInvoice' })

const fileIconConfig = {
  xlsx: 'https://ic-img.ky-express.com/netc/20230926_97721882326_!!1695696185551_104_104.png',
  pdf: 'https://ic-img.ky-express.com/netc/20231026_54905448828_!!1698300764909_104_104.png',
}

const { params } = useRouter()
const suffix = ref('')

useDidShow(() => {
  suffix.value = (params && params.type) || 'xlsx'
})

function handleTranferFile() {
  Taro.downloadFile({
    url: decodeURIComponent(params.url),
    success: (res) => {
      Taro.shareFileMessage({
        filePath: res.tempFilePath,
        fileName: params.title + '.' + suffix.value,
        success: (ret) => {
          console.log(ret, 'ret')
        },
        fail: (err) => {
          console.log('分享失败', err)
        },
      })
    },
  })
}
</script>
