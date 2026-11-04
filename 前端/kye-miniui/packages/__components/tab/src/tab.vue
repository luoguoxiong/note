<template>
  <scroll-view
    class="ky-tab"
    :id="tabWrapId"
    :scrollX="true"
    :enableFlex="true"
    :scrollLeft="targetScrollLeft"
    bounces
    enhanced
    @scroll="handleScroll"
    scroll-with-animation
    :show-scrollbar="false"
  >
    <!-- 胶囊样式 tab -->
    <view v-if="theme === 'capsule'" class="ky-tab-capsule">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :id="createTabId(index)"
        :class="{
          'ky-tab-capsule-item': true,
          'ky-tab-capsule-item-active': index === modelValue,
        }"
        @click="handleTabClick(index)"
      >
        {{ tab.label }}
        <slot :label="tab.label" name="label"></slot>
        <text
          class="ky-tab-capsule-item-badge"
          :id="createTabBagId(`${index}`)"
          v-show="tab.badgeCount && tab.badgeCount > 0"
        >
          <slot :label="tab.badgeCount" name="badge"></slot>
          {{ showBadge(tab.badgeCount) }}
        </text>
      </view>
    </view>

    <!-- 默认 tab 样式 -->
    <view
      v-else
      :class="[
        'ky-tab-container',
        { 'ky-tab-container-dark': theme === 'dark' },
        noAnimation && 'ky-tab-container-no-animation',
      ]"
      :style="{ width: distributeEvenly ? '100%' : 'auto' }"
    >
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :id="createTabId(index)"
        :class="{
          'ky-tab-item': true,
          'ky-tab-item-active': index === modelValue,
          'ky-tab-item-distribute': distributeEvenly,
        }"
        @click="handleTabClick(index)"
      >
        <view class="ky-tab-name"
          >{{ tab.label }}
          <!--   单独下划线  -->
          <view
            v-if="noAnimation"
            v-show="noAnimation && !moveing && index === modelValue"
            class="ky-tab-name-line"
            :style="{ width: `${underLineWidth}px` }"
          ></view>
        </view>
        <view class="ky-tab-badge" :id="createTabBagId(`${index}`)" v-show="tab.badgeCount && tab.badgeCount > 0">
          {{ showBadge(tab.badgeCount) }}
          <view class="ky-tab-badge-dot" v-if="tab.showBadgeDot"></view>
        </view>
      </view>

      <!-- 下划线 -->
      <view
        class="ky-tab-underline"
        v-show="showUnderline && !noAnimation"
        :style="{ left: `${underlineOffset}px`, width: underLineWidth + 'px' }"
      ></view>
    </view>
  </scroll-view>
</template>
<script lang="ts" setup>
import './index.scss'
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import { TabsProps, TabValue } from './types'
import { boundingClientRect, RectIn } from '@ky-miniui-lib/utils'
import { useDidShow, useDidHide } from '@tarojs/taro'
/* ================== 基础状态 ================== */

const underLineWidth = 20
const reacts = ref<RectIn[]>([])
const tabOffsetList = ref<number[]>([])
const tabWrapWidth = ref(0)

const scrollLeft = ref(0)
const targetScrollLeft = ref(0)
const underlineOffset = ref(0)

const moveing = ref(false)

/* ================== id ================== */

const tabId = Math.random().toString(36).slice(2, 8)
const tabWrapId = `tab-wrap-${tabId}`
const createTabId = (index: number | string) => `tab-${tabId}-${index}`
const createTabBagId = (index: number | string) => `tab-badge-${tabId}-${index}`

/* ================== props ================== */

const props = withDefaults(defineProps<TabsProps>(), {
  sticky: false,
  modelValue: -1,
  offsetTop: 0,
  distributeEvenly: true,
  underline: true,
  underlineFirstAnimation: false,
  maxBadgeCount: 99,
  showScrollbar: true,
  theme: 'default',
  noAnimation: false,
  dynamicTab: false,
  offsetLeft: 0,
  disableTabClick: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabValue): void
}>()

/* ================== underline 显示 ================== */

const showUnderline = computed(() => {
  return props.underline && (props.underlineFirstAnimation ? underlineOffset.value >= 0 : underlineOffset.value > 0)
})

/* ================== scroll ================== */

const handleScroll = (e: any) => {
  scrollLeft.value = e.target.scrollLeft
}

/* ================== badge 宽度估算（关键优化） ================== */

const getBadgeOffset = (count?: number) => {
  if (!count) return 0
  if (count < 10) return 6
  if (count < 100) return 10
  return 12
}

const getWidth = (width: unknown): number => {
  if (typeof width === 'number') {
    return Number.isFinite(width) ? width : 0
  }

  if (typeof width === 'string') {
    return Number.parseFloat(width) || 0
  }

  return 0
}

/* ================== offset 列表 ================== */

const buildOffsetList = () => {
  let sum = 0

  tabOffsetList.value = reacts.value.map((r) => {
    const cur = sum
    sum += getWidth(r?.width)
    return cur
  })
}

/* ================== underline 计算 ================== */

const caculateCenterHandler = (activeIndex: number) => {
  const rect = reacts.value[activeIndex]
  if (!rect) return

  const badgeOffset = getBadgeOffset(props.tabs[activeIndex]?.badgeCount)

  const offsetLeft = tabOffsetList.value[activeIndex]
  const tabCenter = offsetLeft + rect.width / 2 - badgeOffset
  const wrapCenter = tabWrapWidth.value / 2

  targetScrollLeft.value = tabCenter - wrapCenter
  underlineOffset.value = tabCenter - underLineWidth / 2 + props.offsetLeft
}

const updateUnderline = (activeIndex: TabValue) => {
  if (!props.underline || props.theme === 'capsule') return
  if (!reacts.value.length) return

  if (!props.noAnimation || !props.dynamicTab) {
    moveing.value = true
    requestAnimationFrame(() => {
      caculateCenterHandler(Number(activeIndex))
      setTimeout(() => (moveing.value = false), 100)
    })
  } else {
    caculateCenterHandler(Number(activeIndex))
  }
}

/* ================== rect 计算 ================== */

const caculateAllReact = async () => {
  const tasks = props.tabs.map((_, i) => boundingClientRect(createTabId(i)))
  reacts.value = await Promise.all(tasks)
  buildOffsetList()
}

/* ================== tab click ================== */

const handleTabClick = (index: TabValue) => {
  if (props.disableTabClick) return
  if (index !== props.modelValue) {
    emit('update:modelValue', index)
  }
}

/* ================== 生命周期 ================== */

let isPageActive = false
let pageMounted = false

const tabInitial = (force = false) => {
  if (!pageMounted || !isPageActive) return

  setTimeout(async () => {
    if (force || reacts.value.length !== props.tabs.length) {
      const react = await boundingClientRect(tabWrapId)
      tabWrapWidth.value = getWidth(react?.width)
      await caculateAllReact()
    }

    updateUnderline(props.modelValue)
  }, 50)
}

watch(
  () => props.tabs.length,
  () => tabInitial(true),
)

watch(
  () => props.modelValue,
  (val) => {
    if (props.dynamicTab) {
      setTimeout(async () => {
        await caculateAllReact()
        updateUnderline(val)
      }, 50)
    } else {
      updateUnderline(val)
    }
  },
  { immediate: true },
)

useDidShow(() => {
  isPageActive = true
  if (pageMounted) tabInitial()
})

useDidHide(() => {
  isPageActive = false
})

onMounted(() => {
  nextTick(() => {
    pageMounted = true
    isPageActive = true
    tabInitial(true)
  })
})

defineExpose({ updateUnderline })

/* ================== badge 显示 ================== */

const showBadge = (count?: number) => {
  if (!count) return ''
  return count > props.maxBadgeCount ? `${props.maxBadgeCount}+` : `${count}`
}
</script>
