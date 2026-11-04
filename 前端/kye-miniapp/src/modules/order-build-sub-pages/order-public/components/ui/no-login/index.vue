<template>
  <view class="no-login">
    <KyImage name="mine/mine-no-login.png" />
    <view class="no-login-desc">{{ desc }}</view>
    <button class="to-login" @tap="handleClick">{{ btnName }}</button>
  </view>
</template>

<script lang="ts" setup>
import KyImage from '@order-public-sub-public/components/base/ky-image/index.vue'

const emit = defineEmits(['tap'])

defineProps({
  desc: {
    type: String,
    default: '未登录，将无法享受查件服务哦~',
  },
  btnName: {
    type: String,
    default: '去登录',
  },
})

const handleClick = () => {
  emit('tap')
}
</script>
