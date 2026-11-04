<template>
  <div
    class="batch-fee-card"
    v-if="show"
    v-exposure-report="{
      eventCode: 'exp_express_cost_bubble_v1',
      regionCode: 'fare',
    }"
    v-click-report="{
      eventCode: 'clk_express_cost_bubble_v1',
      regionCode: 'fare',
    }"
  >
    <div class="batch-fee-card-content">
      <!-- 屏蔽popover箭头样式 -->
      <div class="batch-fee-card-content-div">
        <SvgIcon name="dollar-reminder-line" class="warn" />
        <span class="text">{{ content }}</span>
        <!-- 屏蔽关闭功能 -->
        <!-- <div @click="handlerHidden">
          <SvgIcon name="weight-close" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})
const show = ref(true)
// const showPopover = ref(false)
const emit = defineEmits(['cardTips'])

watch(
  () => props.content,
  () => {
    show.value = true
  },
)

const handlerHidden = () => {
  show.value = false
  emit('cardTips')
}

const handlerOpen = () => {
  show.value = true
}

defineExpose({
  handlerHidden,
  handlerOpen,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import 'index.scss';
</style>
