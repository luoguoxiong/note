<template>
  <div
    v-if="show"
    class="limit-remind-bar"
    :class="isPaLou ? 'paLou' : `limit-remind-bar--${restrictData.limitReason}`"
  >
    <div class="paLouDes" v-if="isPaLou">
      <SvgIcon class="mr-8" name="error-tip" :style="{ verticalAlign: 'bottom' }" />
      <span v-html="restrictData.customerPlainTips"></span>
    </div>
    <div
      v-else
      class="limit-remind-bar__message"
      v-html="restrictData.customerPlainTips"
      :class="{ 'padding-style': !restrictData.showClose }"
    ></div>
    <div v-if="restrictData.showClose" class="limit-remind-bar__close" @click.stop="onClose"></div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { ref, computed } from 'vue'

interface RestrictData {
  show?: boolean
  showClose?: boolean
  limitReason?: number
  customerPlainTips?: string
}

interface PropsType {
  limitReason?: string
  restrictData: RestrictData
}

const props = withDefaults(defineProps<PropsType>(), {
  showClose: false,
  limitReason: '',
  customerPlainTips: '',
})

const show = ref(true)
const emit = defineEmits(['onClose', 'onClick'])

const onClose = () => {
  show.value = false
  emit('onClose')
}
// 爬楼费提示特写样式
const isPaLou = computed(() => props.restrictData.customerPlainTips?.includes('爬楼'))
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
