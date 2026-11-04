<template>
  <view class="message-footer-fixed-wp">
    <view class="message-footer-fixed" v-if="showBtn">
      <view class="message-footer-fixed__left">
        <view class="message-footer-fixed__icon">
          <image src="https://ic-img.ky-express.com/netc/20251212_43292_!!1765524327389_48_48.png"></image>
        </view>
        <view class="message-footer-fixed__text">
          {{ descText }}
        </view>
      </view>
      <view class="message-footer-fixed__right">
        <ky-button type="primary" class="message-footer-fixed__btn" @click="onJumpPreference">
          {{ buttonText }}
        </ky-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './index.scss'
import * as API from '../../../apis'
import { useApplication } from '@/public/utils/application/useApplication'
import { compareVersion, getVersion, isAppAndroid, isAppiOS } from '../../../utils'
import { useHomeStore } from '@/layout/pages/home/store'
import Taro from '@tarojs/taro'
import { getBaseUrl } from '@/modules/waybill-build/constants/externalLink'
import { openURL } from '@/modules/webview/utils'

const { navigateApplicationExtra } = useApplication()
const homeStore = useHomeStore()

const showBtn = ref(false)
const descText = ref('')
const buttonText = ref('')

const getMsgPreferenceStatus = async () => {
  // TODO: 调用接口获取数据
  try {
    const res = await API.getMsgPreferenceStatus()
    console.log(res, 'res')
    if (res.data) {
      if (!res.data?.configStatus) {
        handlesBtn()
      } else {
        showBtn.value = false
      }
      descText.value = res.data.guideDesc
      buttonText.value = res.data.guideBtn
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取版本号 如果版本低于7.41.0 不需要显示
const handlesBtn = async () => {
  console.log(isAppAndroid, isAppiOS)
  if (isAppAndroid || isAppiOS) {
    let ver = getVersion()
    if (ver) {
      if (isAppAndroid) ver = String(ver).substr(1)
      const res = compareVersion(ver, '7.41.0')
      showBtn.value = res
    }
  } else {
    showBtn.value = true
  }
}

const onJumpPreference = () => {
  openURL(`${getBaseUrl()}/netc-h5-tools-optimize/preference-setting/index.html#/preference-message`, {
    needLogin: true,
  })
}

onMounted(() => {
  getMsgPreferenceStatus()
})
</script>
