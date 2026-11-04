<template>
  <ky-overlay :show="visible" @click="hide">
    <div class="flex flex-column items-center w-full h-full">
      <div class="qrcode-container flex-column items-center">
        <img @touchstart.prevent="onTouchStart" @touchend="onTouchEnd" class="w-full h-full" :src="src" />
      </div>
      <SvgIcon @click="hide" class="qr-code-icon-close mt-48" name="icon-close-overlay"></SvgIcon>
    </div>
  </ky-overlay>
</template>
<script setup lang="ts">
import { ref, useModel } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { downloadImage } from '@order-public-sub-public/utils/file'

const props = defineProps<{ visible: boolean; src: string }>()

const visible = useModel(props, 'visible')
const emits = defineEmits<{ (event: 'update:visible', visible: boolean): void }>()

const hide = () => emits('update:visible', false)

const timer = ref<number>()

const onTouchStart = () => {
  timer.value = setTimeout(function () {
    downloadImage(props.src)
  }, 300)
}

const onTouchEnd = () => {
  clearTimeout(timer.value)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
