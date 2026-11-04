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
            :style="{ width: `${singleTabLineWidth}px` }"
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
        :style="{ left: `${underlineOffset}px`, width: underLineWidth + 'rpx' }"
      ></view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import './index.scss'
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import { TabsProps, TabValue } from './types'
import { boundingClientRect, rpxToPx, RectIn } from '@ky-miniui-lib/utils'
import { useDidShow, useDidHide } from '@tarojs/taro'

const underLineWidth = 40
const reacts = ref<RectIn[]>([])
const badgeReacts = ref<RectIn[]>([])
const scrollLeft = ref(0)
const targetScrollLeft = ref(0)
const underlineOffset = ref(0)
const tabWrapWidth = ref(0)

const tabId = Math.random().toString(36).slice(2, 8)
const tabWrapId = `tab-wrap-${tabId}`
const createTabId = (index: number | string) => `tab-${tabId}-${index}`
const createTabBagId = (index: number | string) => `tab-badge-${tabId}-${index}`

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
// 页面是否激活
const isPageActive = ref<Boolean>(false)
// 页面是否加载过
const pageMounted = ref<Boolean>(false)

/**
 * 是否展示下划线
 * underlineFirstAnimation 首次动画开启
 * @type {ComputedRef<boolean>}
 */
const showUnderline = computed(() => {
  return props.underline && (props.underlineFirstAnimation ? underlineOffset.value >= 0 : underlineOffset.value > 0)
})

const singleTabLineWidth = computed(() => {
  return underLineWidth / 2
})

const handleScroll = (e: any) => {
  scrollLeft.value = e.target.scrollLeft
}

const moveing = ref(false)
const caculateCenter = async (activeIndex: number) => {
  if (!reacts.value.length || !reacts.value[activeIndex]) return
  // 默认underline动画模式
  if (!props.noAnimation || !props.dynamicTab) {
    // 存在动画
    moveing.value = true
    setTimeout(() => {
      caculateCenterHandler(activeIndex)
      setTimeout(() => {
        moveing.value = false
      }, 100)
    }, 0)
  }
}

const caculateCenterHandler = (activeIndex: number) => {
  const tabBadgeSpace = Math.round(badgeReacts.value[activeIndex].width / 2 || 0)
  // 第一个tab 左侧多了10px的padding
  const offsetLeft = reacts.value.slice(0, activeIndex).reduce((acc, cur) => acc + cur.width, 0)
  const tabCenter = Math.round(offsetLeft + reacts.value[activeIndex].width / 2 - tabBadgeSpace)
  const wrapCenter = tabWrapWidth.value / 2
  targetScrollLeft.value = tabCenter - wrapCenter
  underlineOffset.value = tabCenter - rpxToPx(underLineWidth) / 2 + props.offsetLeft
}

const updateUnderline = async (activeIndex: TabValue) => {
  if (!props.underline || props.theme === 'capsule') return
  caculateCenter(Number(activeIndex))
}

const handleTabClick = (index: TabValue) => {
  if (props.disableTabClick) {
    return
  }
  if (index !== props.modelValue) {
    emit('update:modelValue', index)
  }
}

const caculateReact = async () => {
  try {
    const tasks = props.tabs.map((_, i) => boundingClientRect(createTabId(i)))
    reacts.value = await Promise.all(tasks)
    const badgeTasks = props.tabs.map((_, i) => boundingClientRect(createTabBagId(i)))
    badgeReacts.value = await Promise.all(badgeTasks)
  } catch (err) {
    console.warn('tab rect 获取失败，重试中...')
    setTimeout(caculateReact, 100)
  }
}

const tabInitial = async () => {
  const { width } = await boundingClientRect(tabWrapId)
  tabWrapWidth.value = width
  await caculateReact()
  updateUnderline(props.modelValue)
}

watch(
  () => props.modelValue,
  () => {
    updateUnderline(props.modelValue)
  },
  { immediate: true },
)

watch(
  () => props.tabs,
  () => {
    console.log('>>>tab change')
    // 仅在页面激活态触发
    if (isPageActive.value) {
      tabInitial()
    }
  },
  { immediate: true },
)

useDidShow(() => {
  isPageActive.value = true
  // 已加载过(tab)-二次激活需重初始化
  if (pageMounted.value) {
    tabInitial()
  }
})

useDidHide(() => {
  isPageActive.value = false
})

onMounted(() => {
  nextTick(async () => {
    pageMounted.value = true
    tabInitial()
  })
})

defineExpose({ updateUnderline })

const showBadge = (count?: number) => {
  if (!count) return ''
  return count > props.maxBadgeCount ? `${props.maxBadgeCount}+` : `${count}`
}
</script>
