<template>
  <List
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    v-model:finished="finished"
    :isFinished="finished"
    @refresh="onRefresh"
    :isEmpty="isEmpty"
    :isLoadFail="isLoadFail"
    :scrollViewProps="props?.scrollViewProps"
    ref="kyListRef"
    @scroll="onListScroll"
    @load="onLoad"
  >
    <!-- 空态 -->
    <view class="list-empty" v-if="isEmpty">
      <slot name="empty">
        <Empty type="search" description="暂无数据" image-size="100" />
      </slot>
    </view>

    <!-- 列表内容 -->
    <template v-else>
      <slot name="beforeContent"></slot>

      <!-- 虚拟列表容器 -->
      <view class="virtual-holder" :style="{ height: totalHeight + 'px', position: 'relative', overflow: 'hidden' }">
        <view :style="{ transform: `translateY(${offsetCache[startIndex]}px)` }">
          <template v-for="(item, i) in renderPool" :key="i">
            <view v-if="item" :id="`item-${startIndex + i}`" :data-index="startIndex + i" class="virtual-item">
              <slot :data="item" :index="startIndex + i"></slot>
            </view>
          </template>
        </view>
      </view>
    </template>

    <!-- 底部 -->
    <template #finished>
      <view id="list-finished">
        <slot name="finished"></slot>
      </view>
    </template>
  </List>
</template>

<script lang="ts" setup generic="T">
import { List, Empty } from '@ky-miniui-lib/ky-miniui-lib'
import { ref, computed, onMounted, nextTick, shallowRef, markRaw, watch, onBeforeUnmount } from 'vue'
import { ListVirtualProps } from './types'
import Taro from '@tarojs/taro'

const props = defineProps<ListVirtualProps<T>>()

/* ---------------- 状态 ---------------- */
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const kyListRef = ref<any>(null)

const items = shallowRef<T[]>([])
const page = ref(1)
const total = ref(0)

const isEmpty = ref(false)
const isLoadFail = ref(false)

/* ---------------- 虚拟列表逻辑 ---------------- */
const defaultItemHeight = ref(props.itemHeight || 88)
const itemHeights = ref<number[]>([])
const offsetCache = ref<number[]>([0])
const overscan = computed(() => props.overscan ?? 8)

const viewportHeight = ref(0)
const isInitialized = ref(false)
const isDestroyed = ref(false)

let scrollRaf: number | null = null
let measureTimer: any = null
const FAST_SCROLL_THRESHOLD = 500

onBeforeUnmount(() => {
  isDestroyed.value = true
  scrollRaf && cancelAnimationFrame(scrollRaf)
  clearTimeout(measureTimer)
})

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    if (isDestroyed.value) return
    viewportHeight.value = kyListRef.value?.getViewportHeight?.() || Taro.getSystemInfoSync().windowHeight
    measureFooter()
    isInitialized.value = true
    init()
  }, 100)
})

const scrollTop = ref(0)
const lastScrollTop = ref(0)
const lastScrollTime = ref(Date.now())
const scrollVelocity = ref(0)

/* 平均高度计算 */
const measuredHeights = computed(() => itemHeights.value.filter((h) => h > 0))
const averageHeight = computed(() => {
  if (!measuredHeights.value.length) return defaultItemHeight.value
  const sorted = [...measuredHeights.value].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
})

/* offsetCache 构建 */
function rebuildOffsetCache() {
  if (isDestroyed.value) return
  offsetCache.value = [0]
  for (let i = 0; i < items.value.length; i++) {
    const h = itemHeights.value[i] > 0 ? itemHeights.value[i] : averageHeight.value
    offsetCache.value[i + 1] = offsetCache.value[i] + h
  }
}

/* 渲染池大小：根据 viewport + overscan 动态决定 */
const startIndex = ref(0)
const FIXED_POOL_SIZE = computed(() => {
  const visibleCount = Math.ceil(viewportHeight.value / averageHeight.value)
  const res = visibleCount + overscan.value * 2
  console.log('🚀 ~ res: 根据 viewport + overscan 动态决定', res)
  return res
})
const renderPool = shallowRef<(T | null)[]>([])

/* footer测量 */
const footerHeight = ref(60)
function measureFooter() {
  if (isDestroyed.value) return
  clearTimeout(measureTimer)
  measureTimer = setTimeout(() => {
    if (isDestroyed.value) return
    nextTick(() => {
      const query = Taro.createSelectorQuery()
      query
        .select('#list-finished')
        .boundingClientRect((rect) => {
          if (rect?.height && rect.height > 0) footerHeight.value = rect.height
          updateVisiblePool()
        })
        .exec()
    })
  }, 100)
}

/* 总高度 */
const totalHeight = computed(() => {
  if (!items.value.length) return Math.max(viewportHeight.value, props.itemHeight || 100)
  const contentHeight = offsetCache.value[items.value.length] || items.value.length * averageHeight.value
  return Math.max(contentHeight + footerHeight.value, viewportHeight.value)
})

/* 二分查找起始 index */
function binarySearchStartIndex(scrollTop: number) {
  if (!Number.isFinite(scrollTop) || scrollTop <= 0) return 0
  let left = 0
  let right = offsetCache.value.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (offsetCache.value[mid] <= scrollTop) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return Math.max(0, left - 1)
}

/* 渲染池更新（优化：方向感知 overscan + 动态池子） */
function updateVisiblePool() {
  if (!isInitialized.value || !items.value.length || isDestroyed.value) return
  const st = Math.max(0, scrollTop.value)
  let newStartIndex = binarySearchStartIndex(st)

  // ↑ 向上快速滚动时，扩大 overscan buffer
  const isScrollingUp = st < lastScrollTop.value
  const dynamicOverscan = isScrollingUp ? overscan.value * 2 : overscan.value

  newStartIndex = newStartIndex - dynamicOverscan
  const newStart = Math.max(0, newStartIndex)
  const poolSize = FIXED_POOL_SIZE.value
  const endIndex = Math.min(items.value.length, newStart + poolSize)

  startIndex.value = newStart

  // 填充渲染池
  renderPool.value = new Array(poolSize).fill(null)
  for (let i = 0; i < poolSize; i++) {
    const dataIndex = newStart + i
    renderPool.value[i] = dataIndex < items.value.length ? items.value[dataIndex] : null
  }

  // 延迟批量测量（高速滚动时加一点延迟）
  nextTick(() => {
    if (isDestroyed.value) return
    const delay = scrollVelocity.value > FAST_SCROLL_THRESHOLD ? 100 : 0
    setTimeout(() => batchMeasure(newStart, endIndex), delay)
  })
}

function batchMeasure(start: number, end: number) {
  if (isDestroyed.value || start >= end || start >= items.value.length) return
  const needMeasure: number[] = []
  for (let i = start; i < end; i++) {
    if (!itemHeights.value[i] || itemHeights.value[i] === averageHeight.value) needMeasure.push(i)
  }
  if (!needMeasure.length) return

  const query = Taro.createSelectorQuery()
  needMeasure.forEach((i) => query.select(`#item-${i}`).boundingClientRect())
  query.exec((res) => {
    if (!res || isDestroyed.value) return
    let hasUpdate = false
    res.forEach((rect, idx) => {
      const i = needMeasure[idx]
      if (rect?.height && rect.height > 0) {
        const newH = Math.min(1000, Math.max(20, rect.height))
        if (Math.abs(newH - (itemHeights.value[i] || 0)) > 2) {
          itemHeights.value[i] = newH
          hasUpdate = true
        }
      } else if (!itemHeights.value[i]) {
        // 兜底：用平均高度先撑开，避免空白
        itemHeights.value[i] = averageHeight.value
        hasUpdate = true
      }
    })
    if (hasUpdate) {
      rebuildOffsetCache()
      updateVisiblePool()
    }
  })
}

/* 滚动事件（优化：高速滚动时直接同步更新） */
const onListScroll = (e: any) => {
  if (isDestroyed.value) return
  const now = Date.now()
  const top = Math.max(0, e?.detail?.scrollTop || 0)
  const dt = Math.max(now - lastScrollTime.value, 16)
  const dy = Math.abs(top - lastScrollTop.value)
  scrollVelocity.value = dy > 0 ? (dy / dt) * 1000 : 0
  lastScrollTop.value = top
  lastScrollTime.value = now
  scrollTop.value = top

  if (scrollVelocity.value > FAST_SCROLL_THRESHOLD) {
    // 高速滚动：立即更新
    updateVisiblePool()
    checkLoadMore(scrollTop.value)
    return
  }

  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = requestAnimationFrame(() => {
    updateVisiblePool()
    checkLoadMore(scrollTop.value)
  })
}

function checkLoadMore(currentScrollTop: number) {
  if (!loading.value && !finished.value && items.value.length && !isDestroyed.value) {
    const threshold = Math.max(0, totalHeight.value - viewportHeight.value - 200)
    if (currentScrollTop >= threshold) onLoad()
  }
}

/* 数据加载逻辑保持不变 */
const init = async () => {
  if (isDestroyed.value) return
  page.value = 1
  finished.value = false
  loading.value = true
  isEmpty.value = false
  isLoadFail.value = false

  items.value = []
  itemHeights.value = []
  offsetCache.value = [0]
  startIndex.value = 0
  scrollTop.value = 0
  renderPool.value = []

  try {
    const data = await props.fetch(page.value)
    if (isDestroyed.value) return
    if (!data?.data?.length) {
      isEmpty.value = true
      return
    }
    items.value = data.data.map((d) => markRaw(d as any))
    itemHeights.value = new Array(items.value.length).fill(0)
    total.value = data.total || items.value.length
    finished.value = items.value.length >= total.value

    rebuildOffsetCache()
    updateVisiblePool()

    nextTick(() => {
      setTimeout(() => {
        batchMeasure(0, Math.min(FIXED_POOL_SIZE.value, items.value.length))
        updateListHeight()
      }, 50)
    })
  } catch (err) {
    isLoadFail.value = true
  } finally {
    loading.value = false
    kyListRef.value?.scrollToTop?.()
  }
}

const onRefresh = async () => {
  if (isDestroyed.value) return
  refreshing.value = true
  try {
    await init()
  } finally {
    refreshing.value = false
  }
}

const onLoad = async () => {
  if (loading.value || finished.value || isDestroyed.value) return
  loading.value = true
  isLoadFail.value = false
  try {
    const nextPage = page.value + 1
    const data = await props.fetch(nextPage)
    if (!data?.data?.length) {
      finished.value = true
      return
    }
    const newItems = data.data.map((d) => markRaw(d as any))
    const prevLen = items.value.length
    items.value.push(...newItems)
    itemHeights.value.push(...new Array(newItems.length).fill(0))
    page.value = nextPage
    total.value = data.total || items.value.length
    finished.value = items.value.length >= total.value
    rebuildOffsetCache()
    nextTick(() => {
      updateVisiblePool()
      batchMeasure(prevLen, items.value.length)
    })
  } catch {
    isLoadFail.value = true
  } finally {
    loading.value = false
  }
}

watch([() => items.value.length, () => viewportHeight.value], () => {
  nextTick(() => updateVisiblePool())
})
watch(finished, (val) => val && measureFooter())

const updateListHeight = () => {
  if (isDestroyed.value) return
  const newHeight = kyListRef.value?.getViewportHeight?.() || Taro.getSystemInfoSync().windowHeight
  if (newHeight !== viewportHeight.value && newHeight > 0) {
    viewportHeight.value = newHeight
    nextTick(() => updateVisiblePool())
  }
}

defineExpose({ init, allData: items, total, updateListHeight, refreshing, updateVisiblePool })
</script>

<style scoped>
.virtual-item {
  box-sizing: border-box;
  transform: translateZ(0);
}
.virtual-holder {
  will-change: transform;
}
.skeleton-block {
  width: 100%;
  margin-bottom: 16px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #ffffff 37%,
    #f0f0f0 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
