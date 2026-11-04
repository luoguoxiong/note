<template>
  <div id="todo-card">
    <div class="card-content">
      <div class="card-title">
        <span class="card-title-text">
          <span class="card-name">{{ title }}</span>
          <span class="card-count" v-show="!isPayment">（{{ todoCount }}条待审批）</span>
        </span>
        <More :to-more="toMore"></More>
      </div>
      <div class="card-box" ref="refElement">
        <div
          v-for="(item, index) in data"
          :class="{
            'card-item': true,
            [`card-item--${item.locateToType}`]: true,
            'card-item-animate': isRun,
            active: index === current,
          }"
          :style="getStyle(current, index)"
          :key="index"
        >
          <div
            :style="{
              opacity: current === index && index !== maxLength ? 0 : 0.3,
              zIndex: current === index && index !== maxLength ? -1 : 10,
            }"
            :class="{ 'over-model-animate': isRun }"
            class="over-model"
          >
            <div class="over-info" v-show="index === maxLength">点击查看更多，可前往列表</div>
            <KButton
              type="default"
              id="home-btn"
              plain
              @click.stop="toMore"
              v-show="index === maxLength"
              style="width: 76px"
              >查看更多</KButton
            >
          </div>
          <slot :data="{ ...item, isActive: current === index }"></slot>
        </div>
        <div
          class="circle left"
          @click="current > 0 && changeCurrent(false)"
          :style="`left:${arrowInset}px;opacity:${current > 0 ? 0.6 : 0};cursor: ${
            current > 0 ? 'pointer' : 'default'
          };`"
        >
          <img
            src="https://ic-img.ky-express.com/netc/20240430_11770395137_!!1714457651179_12_12.png"
            alt=""
            srcset=""
          />
        </div>
        <div
          class="circle right"
          @click="current < data.length - 1 && changeCurrent(true)"
          :style="`right:${arrowInset}px;opacity:${current < data.length - 1 ? 0.6 : 0};cursor: ${
            current < data.length - 1 ? 'pointer' : 'default'
          };`"
        >
          <img src="https://ic-img.ky-express.com/netc/20240430_5277039518_!!1714457445964_12_12.png" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import More from '@/views/home/components/more/index.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'
import { debounce } from 'lodash-es'
import * as homeTypes from '@/apis/home/types'
import { KButton } from '@netc-design-pc/ui'

const maxLength = 10
const cardWidth = 578
const sideCardOffset = ref(96)
interface CardProps {
  data: homeTypes.PayAuthListVO[] &
    homeTypes.HomePagePaymentVO[] &
    homeTypes.AuthApprovalListVO[] &
    homeTypes.WayBillApprovalListVO[]
  title: string
  todoCount: number
  current: number
  isPayment: boolean
}

const isRun = ref(false)

const props = defineProps<CardProps>()

const emit = defineEmits(['change', 'toMore'])

const toMore = () => {
  emit('toMore')
}

const refElement = ref<HTMLDivElement>()

const activeStyle = ref(0)
const arrowInset = computed(() => Math.max(8, activeStyle.value - sideCardOffset.value - 16))

const resizeObserverRef = ref<ResizeObserver>()

// 过渡动画仅在手动翻页点击的瞬间短暂启用：
// 从其他页面切回首页/数据静默刷新时，即使鼠标悬停在卡片上，位移与遮罩变化也直接生效，不播放动画
let animateTimer: ReturnType<typeof setTimeout> | undefined

const changeCurrent = (isPlus: boolean) => {
  isRun.value = true
  clearTimeout(animateTimer)
  animateTimer = setTimeout(() => {
    isRun.value = false
  }, 500)
  emit('change', props.current + (isPlus ? 1 : -1))
}

const getStyle = (current: number, index: number) => {
  if (current === index) {
    return {
      transform: `translateX(${activeStyle.value}px)  scale(1)`,
      zIndex: props.data.length + maxLength,
      opacity: 1,
    }
  } else if (current < index) {
    return {
      // 仅显示紧邻的下一页；更远卡片隐藏，避免多层透明度叠加。
      transform: `translateX(${activeStyle.value + sideCardOffset.value}px)`,
      zIndex: props.data.length - index,
      opacity: index === current + 1 ? 0.2 : 0,
    }
  } else {
    return {
      // 仅显示紧邻的上一页，两侧各露出 96px 的虚影区域。
      transform: `translateX(${activeStyle.value - sideCardOffset.value}px)`,
      zIndex: index,
      opacity: index === current - 1 ? 0.2 : 0,
    }
  }
}

const computedTranslate = () => {
  if (props.data.length > 0 && refElement.value) {
    const width = refElement.value.offsetWidth
    activeStyle.value = (width - cardWidth) / 2
    sideCardOffset.value = Math.min(96, Math.max(0, activeStyle.value - 24))
  }
}
onMounted(() => {
  computedTranslate()
})

watch([refElement], ([element]) => {
  if (element !== undefined) {
    resizeObserverRef.value?.disconnect()
    resizeObserverRef.value = new ResizeObserver(
      debounce(() => {
        computedTranslate()
      })
    )
    resizeObserverRef.value.observe(element)
  }
})

onUnmounted(() => {
  clearTimeout(animateTimer)
  resizeObserverRef.value?.disconnect()
})
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
