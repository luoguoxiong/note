<template>
  <BottomPopup
    class="audio_popup_co"
    title="语音识别"
    :show="showAudio"
    :footer-text="audioText"
    @onConfirm="confirm"
    @onClose="close"
  >
    <view class="audio_container">
      <view class="audio_tip" v-if="audioStatus === AudioStatus.未开始"
        >支持 60 秒内<text class="audio_warn">单条</text>识别</view
      >
      <view class="audio_tip" v-if="audioStatus === AudioStatus.录音中">
        <text v-if="audioCountdown < 6"
          >录音将于 <text class="audio_warn">{{ audioCountdown }}秒</text> 后结束</text
        >
        <text v-else>正在转文字</text>
      </view>
      <view class="audio_img_container">
        <img
          v-if="audioStatus === AudioStatus.未开始"
          class="audio_img"
          src="https://ic-img.ky-express.com/netc/20251113_25282_!!1763006260722_608_124.png"
        />
        <img
          v-else
          class="audio_img"
          src="https://ic-img.ky-express.com/netc/20251113_76199_!!1763006201728_608_124.gif"
        />
      </view>
      <view class="audio_word">
        <view class="audio_tip">请确保环境安静</view>
        <view class="audio_tip">依次说出姓名、电话、详细地址</view>
      </view>
    </view>
  </BottomPopup>
</template>
<script setup lang="ts">
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { startRecording, stopRecording } from '@order-public-sub-public/components/ui/ocr/utils'
import { computed } from 'vue'
import { useAudio } from '@order-public-sub-public/components/ui/ocr/components/audio/useAudio'
import { AudioStatus } from '@order-public-sub-public/constants'
import Taro, { useDidShow } from '@tarojs/taro'

const { audioStatus, setAudioStatus, audioCountdown, showAudio } = useAudio()

useDidShow(() => {
  Taro.onAppHide(() => {
    if (audioStatus.value === AudioStatus.录音中) {
      stopRecording()
    }
  })
})
//确认
const confirm = async () => {
  if (audioStatus.value === AudioStatus.未开始) {
    await startRecording()
    setAudioStatus(AudioStatus.录音中)
    return
  }
  stopRecording()
  setAudioStatus(AudioStatus.未开始)
}

//底部按钮文案
const audioText = computed(() => {
  let text = audioStatus.value === AudioStatus.未开始 ? '开始录音' : '结束录音'
  if (audioStatus.value === AudioStatus.录音中 && audioCountdown.value < 6) {
    text = `结束录音（${audioCountdown.value}s）`
  }
  return text
})

//关闭
const close = () => {
  stopRecording()
}
</script>

<style lang="scss">
.audio_container {
  font-size: 28px;
  color: #686b75;
}
.audio_tip {
  text-align: center;
  font-size: 28px;
  color: #686b75;
}
.audio_warn {
  color: #ff706d;
}
.audio_img_container {
  padding: 80px 0;
  text-align: center;
}
.audio_img {
  width: 304px;
  height: 62px;
  margin: 0 auto;
}
.audio_popup_co {
  background: rgba(0, 0, 0, 0);
  .content__title {
    margin: 0 auto;
  }
  .ky-popup-content {
    box-shadow:
      0px -8px 16px 0px rgba(0, 0, 0, 0.03),
      0px -2px 10px 0px rgba(0, 0, 0, 0.05);
  }
}
</style>
