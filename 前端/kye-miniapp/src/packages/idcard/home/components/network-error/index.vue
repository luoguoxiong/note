<template>
  <view class="idcard-NetworkError">
    <view class="idcard-nerwork-error">
      <view class="idcard-nerwork-error__warpper">
        <view>
          <image v-if="msgInfoImg" :src="msgInfoImg" />
          <image v-else :src="imgIcon" />
        </view>
        <view>
          {{ msgInfoText }}
        </view>
        <view v-if="showReload" class="reload-btn" @tap="reload">重新加载</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const imgIcon = 'https://ic-img.ky-express.com/default/20250813_35811_!!1755058348733_560_560.png'

interface MsgInfo {
  msg?: string
  img?: string
}

interface Props {
  weaknetwork?: boolean
  showReload?: boolean
}

const emits = defineEmits('reload')

const props = withDefaults(defineProps<Props>(), {
  weaknetwork: false,
  showReload: true,
})

const msgInfo: MsgInfo = ref({
  msg: '加载超时，请检查后重试',
  img: 'https://ic-img.ky-express.com/netc/20250514_51558405367_!!1747203145695_560_560.png',
})

const msgInfoImg = computed(() => msgInfo.value?.img)

// 旧代码的逻辑是这样的，但是这样永远无法走到 weaknetworkText，
const msgInfoText = computed(() => {
  let message = msgInfo.value?.msg || ''
  if (message) {
    return message || ''
  }

  // 先保留，这里永远都走不到
  let weaknetworkText = props.weaknetwork
  if (weaknetworkText) {
    return '网络不给力，请重新加载'
  } else {
    return '当前无网络，请检查后重试'
  }
})

const reload = () => emits('reload')
</script>

<style lang="scss">
@import './index.scss';
</style>
