<template>
  <view
    :class="['ky-float-pagination', { 'ky-float-pagination--right': placement === 'right' }]"
    :style="{ opacity: isInit ? 1 : 0 }"
    v-show="isExpand"
    @tap="onToggle"
  >
    <view class="ky-float-pagination__inner">
      <view class="ky-float-pagination__button" @click.stop="onPrev">
        <!-- 可点击 -->
        <image v-if="!isMin" class="ky-float-pagination__arrow-up-img" :src="canClick_upImg" />
        <!-- 不可点击 -->
        <image v-else :src="canNotClick_upImg" class="ky-float-pagination__arrow-up-img" />
        <view class="ky-float-pagination__button-text">{{ prevText }}</view>
      </view>
      <view class="ky-float-pagination__center">
        <view class="ky-float-pagination__num">
          <view class="ky-float-pagination__num-top">{{ modelValue }}</view>
          <view class="ky-float-pagination__num-bottom">{{ max }}</view>
        </view>
        <image
          class="ky-float-pagination__expand"
          src="https://ic-img.ky-express.com/netc/20250605_70572831148_!!1749095044680_56_56.png"
        />
      </view>
      <view class="ky-float-pagination__button" @click.stop="onNext">
        <view class="ky-float-pagination__button-text">{{ nextText }}</view>
        <!-- 可点击 -->
        <image v-if="!isMax" class="ky-float-pagination__arrow-down-img" :src="canClick_downImg" />
        <!-- 不可点击 -->
        <image v-else :src="canNotClick_downImg" class="ky-float-pagination__arrow-down-img" />
      </view>
    </view>
  </view>
  <view
    :class="['ky-float-pagination__collapse', { 'ky-float-pagination__collapse--right': placement === 'right' }]"
    :style="{ opacity: isInit ? 1 : 0 }"
    v-show="!isExpand"
    @tap="onToggle"
  >
    <image
      class="ky-float-pagination__collapse-img"
      src="https://ic-img.ky-express.com/netc/20250721_8453_!!1753085330939_272_472.png"
    />
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed, onMounted } from 'vue'
import { FloatPaginationProps } from '@packages/__components/float-pagination/src/types'

const canClick_upImg = 'https://ic-img.ky-express.com/default/20250806_20292_!!1754447580778_24_25.svg+xml'
const canNotClick_upImg = 'https://ic-img.ky-express.com/default/20250806_1941_!!1754447580775_24_25.svg+xml'

const canClick_downImg = 'https://ic-img.ky-express.com/default/20250806_27228_!!1754447580780_24_25.svg+xml'
const canNotClick_downImg = 'https://ic-img.ky-express.com/default/20250806_40661_!!1754447580779_24_25.svg+xml'

const props = withDefaults(defineProps<FloatPaginationProps>(), {
  modelValue: 1,
  min: 1,
  max: 1,
  prevText: '上一票',
  nextText: '下一票',
  disabled: false,
  placement: 'left',
})

const emit = defineEmits(['update:modelValue', 'change', 'prev', 'next', 'open', 'close'])

const isMin = computed(() => props.modelValue <= props.min)
const isMax = computed(() => props.modelValue >= props.max)

const isExpand = ref(true)

const onPrev = () => {
  if (props.disabled || isMin.value) return
  const val = props.modelValue - 1
  emit('update:modelValue', val)
  emit('change', val)
  emit('prev', val)
}

const onNext = () => {
  if (props.disabled || isMax.value) return
  const val = props.modelValue + 1
  emit('update:modelValue', val)
  emit('change', val)
  emit('next', val)
}

const onToggle = () => {
  isExpand.value = !isExpand.value
  emit(isExpand.value ? 'open' : 'close')
}

const isInit = ref(false)

onMounted(() => {
  setTimeout(() => {
    isInit.value = true
  }, 300)
})
</script>
