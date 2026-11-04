<template>
  <div
    class="notice-bar-custom"
    :class="[`notice-bar-custom--${type}`, { 'notice-bar-custom--scrollable': scrollable }]"
    v-show="show"
  >
    <div class="notice-bar-custom__left-icon" v-if="leftIcon || $slots.leftIcon">
      <SvgIcon v-if="leftIcon" name="icon-tips" />
      <slot v-else-if="$slots.leftIcon" name="leftIcon"> </slot>
    </div>

    <div class="notice-bar-custom__content" ref="content">
      <div class="notice-bar-custom__text text-content" :style="scrollStyle" ref="text">
        <slot>{{ text }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import SvgIcon from '../../ui/svg-icon/index.vue'

const props = defineProps({
  text: String,
  mode: {
    type: String,
    validator: (value) => ['', 'closeable', 'link'].includes(value),
  },
  color: String,
  background: String,
  delay: {
    type: [String, Number],
    default: 1,
  },
  // 设为 false 的话可以自动换行撑高
  scrollable: {
    type: Boolean,
    default: true,
  },
  speed: {
    type: Number,
    default: 50,
  },
  leftIcon: Boolean,
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value),
  },
})

const emit = defineEmits(['close', 'click'])

const show = ref(true)
const content = ref(null)
const text = ref(null)
const scrollStyle = ref({})
const duration = ref(0)

const closeable = computed(() => props.mode === 'closeable')

let timer = null
let animationFrameId = null

const startScroll = () => {
  if (!props.scrollable || !content.value || !text.value) return

  const contentWidth = content.value.offsetWidth
  const textWidth = text.value.offsetWidth

  if (textWidth > contentWidth) {
    duration.value = textWidth / props.speed
    scrollStyle.value = {
      paddingLeft: `${contentWidth}px`,
      transitionDuration: `${duration.value}s`,
      transform: `translateX(-${textWidth}px)`,
    }

    // 循环滚动
    timer = setTimeout(
      () => {
        scrollStyle.value = {
          paddingLeft: `${contentWidth}px`,
          transitionDuration: '0s',
          transform: 'translateX(0)',
        }

        animationFrameId = requestAnimationFrame(() => {
          scrollStyle.value = {
            paddingLeft: `${contentWidth}px`,
            transitionDuration: `${duration.value}s`,
            transform: `translateX(-${textWidth}px)`,
          }
          startScroll()
        })
      },
      duration.value * 1000 + props.delay * 1000,
    )
  }
}

const stopScroll = () => {
  clearTimeout(timer)
  cancelAnimationFrame(animationFrameId)
}

onMounted(() => {
  startScroll()
})

onBeforeUnmount(() => {
  stopScroll()
})

watch(
  () => props.text,
  () => {
    stopScroll()
    startScroll()
  },
)
</script>

<style lang="scss">
@import '../../../styles/index.scss';
.notice-bar-custom {
  display: flex;
  // height: 64px;
  box-sizing: border-box;
  padding: 16px 32px;
  font-size: 24px;
  line-height: 34px;
  position: relative;
  background-color: #fff3e5;
  color: #ff9300;
}

.notice-bar-custom--default {
  background-color: #fff3e5;
  color: #ff9300;
}

.notice-bar-custom--success {
  background-color: #f0f9eb;
  color: #07c160;
}

.notice-bar-custom--warning {
  background-color: #fff3e5;
  color: #ff9300;
}

.notice-bar-custom--danger {
  background-color: #fef0f0;
  color: #ee0a24;
}

.notice-bar-custom__left-icon {
  margin-right: 8px;
  font-size: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  .svg-icon {
    width: 24px;
    height: 24px;
    margin-top: -2px;
    flex-shrink: 0;
  }
}

.notice-bar-custom__content {
  flex: 1;
  position: relative;
  // height: 24px;
  .text-content {
    // padding-left: 8px;
    font-size: 24px;
    color: $warning;
    font-weight: $font-normal;
    letter-spacing: 0;
  }
}

.notice-bar-custom--scrollable {
  // .notice-bar-custom__content {
  // overflow: hidden;
  // }
  .notice-bar-custom__text {
    position: absolute;
    transition-timing-function: linear;
    white-space: nowrap;
    animation: none;
    transition-property: transform;
    line-height: 24px;
  }
}
</style>
