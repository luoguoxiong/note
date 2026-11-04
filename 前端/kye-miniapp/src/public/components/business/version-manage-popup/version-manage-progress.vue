<template>
  <view class="ky-progress" role="progressbar" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="display">
    <view class="ky-progress__track" :style="trackStyle">
      <view
        class="ky-progress__bar"
        :class="{ 'is-striped': striped, 'is-animated': animated && striped }"
        :style="barStyle"
      >
        <text v-if="showLabel" class="ky-progress__label">{{ display }}%</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  /** 进度，0-100；支持 v-model */
  modelValue: { type: Number, default: 0 },
  /** 高度（rpx/px），默认 16rpx */
  height: { type: [Number, String], default: 16 },
  /** 圆角（rpx/px） */
  radius: { type: [Number, String], default: 16 },
  /** 进度颜色 */
  color: { type: String, default: '#8365F6' },
  /** 轨道背景色 */
  bgColor: { type: String, default: '#DDD0FF' },
  /** 斜纹条纹效果 */
  striped: { type: Boolean, default: false },
  /** 条纹动画（仅 striped=true 时生效） */
  animated: { type: Boolean, default: true },
  /** 是否在条内显示百分比文本 */
  showLabel: { type: Boolean, default: false },
  /** 宽度过渡时长（ms） */
  duration: { type: Number, default: 300 },
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
  (e: 'change', v: number): void
  (e: 'finish', v: number): void
}>()

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v || 0)))
const internal = ref(clamp(props.modelValue))

watch(
  () => props.modelValue,
  (v) => {
    const nv = clamp(v as number)
    if (nv !== internal.value) {
      internal.value = nv
      emit('change', nv)
      if (nv === 100) emit('finish', nv)
    }
  },
)

const display = computed(() => internal.value)

const addUnit = (v: number | string) => (typeof v === 'number' ? `${v}rpx` : v)

const trackStyle = computed(() => ({
  height: addUnit(props.height),
  borderRadius: addUnit(props.radius),
  background: props.bgColor,
}))

const barStyle = computed(() => ({
  width: `${display.value}%`,
  height: '100%',
  borderRadius: addUnit(props.radius),
  background: props.color,
  transition: `width ${props.duration}ms linear`,
}))
</script>

<style scoped>
.ky-progress {
  width: 100%;
}
.ky-progress__track {
  overflow: hidden;
  position: relative;
}
.ky-progress__bar {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ky-progress__label {
  font-size: 22rpx;
  color: #ffffff;
}

/* 条纹与动画（兼容小程序的纯 CSS） */
.is-striped {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.25) 0,
    rgba(255, 255, 255, 0.25) 10rpx,
    transparent 10rpx,
    transparent 20rpx
  );
  background-size: 40rpx 40rpx;
}

.is-animated.is-striped {
  animation: ky-progress-stripes 1s linear infinite;
}
@keyframes ky-progress-stripes {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 40rpx 0;
  }
}
</style>
