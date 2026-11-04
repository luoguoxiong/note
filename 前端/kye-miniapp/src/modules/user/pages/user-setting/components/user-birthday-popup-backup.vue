<template>
  <ky-popup
    v-model:show="show"
    :closeOnClickOverlay="false"
    @click="handleClose"
    :class="`${classPrefix} user-bottom-popup`"
    :style="{ maxHeight: '80%' }"
    safeAreaInsetBottom
    position="bottom"
  >
    <view :class="`${classPrefix}__content container`"> </view>
    <view :class="`${classPrefix}__footer`" @click="handleConfirm">
      <ky-button type="primary" size="large">确定</ky-button>
    </view>
  </ky-popup>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const classPrefix = 'user-birthday-popup'
const emit = defineEmits(['onCancel'])

const show = ref<boolean>(false)

/* 关闭popup */
const handleClose = () => {
  emit('onCancel')
}

const handleConfirm = () => {
  emit('onConfirm')
}
</script>
