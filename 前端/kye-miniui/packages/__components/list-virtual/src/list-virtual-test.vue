<template>
  <List
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    v-model:finished="finished"
    :isFinished="finished"
    :isEmpty="isEmpty"
    :isLoadFail="isLoadFail"
    :disabledRefresh="props?.disabledRefresh"
    :scrollViewProps="props?.scrollViewProps"
    ref="kyListRef"
    @refresh="onRefresh"
    @scroll="onListScroll"
    @dragStart="onListDragStart"
    @dragging="onListDragging"
    @dragEnd="onListDragEnd"
    @load="onLoad"
  >
    <view class="list-empty" v-if="isEmpty">
      <slot name="empty">
        <Empty type="search" description="暂无数据" image-size="100" />
      </slot>
    </view>

    <template v-else>
      <slot name="beforeContent"></slot>

      <view class="virtual-holder" :style="{ position: 'relative', overflow: 'hidden' }">
        <template v-for="(item, index) in items" :key="index">
          <view
            :id="item._vId"
            class="virtual-item"
            :class="item._vClass"
            :style="{
              height: item.height && isVirtual ? `${item.height}px` : 'auto',
              marginTop: index > 0 ? itemSpace + 'px' : '',
            }"
          >
            <template v-if="(index >= startIndex && index < endIndex) || !item.height || !isVirtual">
              <slot :data="{ ...item, index }" />
            </template>
            <template v-else>
              <div class="ky-card-skeleton" :style="{ height: `${item.height}px` }">
                <slot name="skeleton">
                  <!-- <div class="ky-skeleton-animation"></div> -->
                  <image
                    class="ky-skeleton-animation-image"
                    src="https://ic-img.ky-express.com/netc/20251230_80230_!!1767089127001_1404_800.png"
                    mode="widthFix"
                  />
                </slot>
              </div>
            </template>
          </view>
        </template>
      </view>
    </template>

    <template #finished>
      <view id="list-finished">
        <slot name="finished"></slot>
      </view>
    </template>
  </List>
</template>

<script lang="ts" setup generic="T">
import { List, Empty } from '@ky-miniui-lib/ky-miniui-lib'
import { ref, shallowRef, triggerRef, markRaw, onMounted, nextTick, watch } from 'vue'
import { ListVirtualProps } from './types'
import Taro from '@tarojs/taro'

const props = defineProps<ListVirtualProps<T>>()

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const kyListRef = ref<any>(null)

const items = shallowRef<T[]>([])
const page = ref(1)
const total = ref(0)

const isEmpty = ref(false)
const isLoadFail = ref(false)

/* 虚拟列表逻辑 */
const isVirtual = ref<boolean>(true)
const overscan = props.overscan || 2
const itemSpace = props.itemSpace || 8
const viewportHeight = ref(0)

const startIndex = ref(0)
const endIndex = ref(0)

const cumulativeHeights = ref<number[]>([])

/* 重新计算累积高度 */
const recalculateCumulativeHeights = (newItems: T[]) => {
  let lastSum = 0
  const result = newItems.map((item) => {
    const h = (item.height || 0) + props.itemSpace
    lastSum += h
    return lastSum
  })
  cumulativeHeights.value = result
}

/* 更新可见区 */
const scrollTop = ref(0)
const updateVisibleIndex = () => {
  const scroll = scrollTop.value
  const viewportH = viewportHeight.value

  const heights = cumulativeHeights.value
  const totalItems = items.value.length

  // 辅助：找到第一个大于 value 的索引
  const findFirstGreater = (array: number[], value: number) => {
    let left = 0
    let right = array.length - 1
    let res = array.length
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (array[mid] > value) {
        res = mid
        right = mid - 1
      } else {
        left = mid + 1
      }
    }
    return res
  }

  // 计算 startIndex
  const start = findFirstGreater(heights, scroll)
  startIndex.value = Math.max(0, start - overscan)

  // 计算 endIndex
  const end = findFirstGreater(heights, scroll + viewportH)
  endIndex.value = Math.min(totalItems, end + overscan)

  console.log('updateVisibleIndex', startIndex.value, endIndex.value, start, end)
}

/* 滚动事件 */
let scrollTimer: any
const SCROLL_STOP_DELAY = 60
const onListScroll = (e: any) => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
  scrollTimer = setTimeout(() => {
    scrollTop.value = e.detail.scrollTop
    console.log('实际落点', e.detail.scrollTop)
    updateVisibleIndex()
    scrollTimer = null
  }, SCROLL_STOP_DELAY)
}

/**
 * 离散仿真：按帧（每16ms）模拟 scroll-view 惯性衰减
 * 和真实 scroll inertial 更接近
 */
function predictFinal(pts, currentY) {
  if (!pts || pts.length < 2) return currentY

  // -------------------------
  // 1. 计算最近 50ms 的速度
  // -------------------------
  const end = pts[pts.length - 1].time
  const recent = pts.filter((p) => end - p.time <= 50)
  const first = recent[0] ?? pts[0]
  const last = recent[recent.length - 1]

  const dy = last.y - first.y
  const dt = last.time - first.time || 1
  const v = dy / dt // px / ms

  // 无速度则直接返回
  if (Math.abs(v) < 0.02) return currentY

  // -------------------------
  // 2. 基于真实数据拟合：线性模型 Δy ≈ v * 2700
  // -------------------------
  const K = 2700
  let delta = v * K

  // -------------------------
  // 3. 极端速度下做轻微压缩（避免极高速过冲）
  // -------------------------
  const speed = Math.abs(v)
  if (speed > 2.0) {
    const factor = 1 / (1 + (speed - 2) * 0.35)
    delta *= factor
  }

  // -------------------------
  // 4. 限制最大惯性位移（防止某些机型突然爆炸）
  // -------------------------
  const MAX_DELTA = 4500
  if (Math.abs(delta) > MAX_DELTA) {
    delta = Math.sign(delta) * MAX_DELTA
  }

  return currentY + delta
}

function predictFinalDiscrete(pts, currentY) {
  if (!pts || pts.length < 2) return currentY

  // ========== ① 计算离手瞬时速度 ==========
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]

  const dt = last.time - prev.time || 1
  const v_exit = (last.y - prev.y) / dt // px/ms (离手瞬时速度)

  if (Math.abs(v_exit) < 0.02) return currentY

  // ========== ② 计算最后 60ms 平均加速度，补偿 v_exit ==========
  const end = last.time
  const recent = pts.filter((p) => end - p.time <= 60)

  let v0 = v_exit
  if (recent.length >= 3) {
    // 用 v = Δy / Δt 得到更平滑速度
    const dy = recent[recent.length - 1].y - recent[0].y
    const dt2 = recent[recent.length - 1].time - recent[0].time || 1
    const v_avg = dy / dt2

    // 混合，避免震荡
    v0 = v_exit * 0.55 + v_avg * 0.45
  }

  // ========== ③ 指数衰减（scroll-view 的真实物理） ==========
  // 速度衰减：v(t + dt) = v(t) * e^(-k dt)
  // 根据你的样本拟合得 k≈0.0035（误差很小）
  const k = 0.0035
  const dtSim = 1 // 1ms 精度
  let v = v0
  let pos = 0

  // ========== ④ 离散仿真 ==========
  while (Math.abs(v) > 0.02) {
    pos += v * dtSim
    v = v * Math.exp(-k * dtSim)

    if (Math.abs(pos) > 20000) break // 防爆
  }

  // ========== ⑤ 安全限制 ==========
  const limit = 6000
  if (Math.abs(pos) > limit) pos = Math.sign(pos) * limit

  return currentY + pos
}

// ====== 模型参数（可持久化/分设备存储） ======
const inertiaModel = {
  baseK: 0.0055, // 阻尼基准（越大越快停），初始经验值
  gamma: 0.35, // 速度依赖项强度（越大，高速时阻尼下降越明显）
  minK: 0.0006, // k 的最小值保护
  maxSteps: 3000, // 仿真最大步数（ms）
  dt: 1, // 仿真步长，1 ms 精度
  velThreshold: 0.02, // 速度停止阈值 px/ms
  bias: 0, // 校准偏置（px），长期修正预测偏差
  learnRate: 0.04, // 校准学习率（小）
}

// ====== 主预测函数（输入：初速度 px/ms，当前 scrollTop） ======
function predictFromVelocity(v0, currentY) {
  if (!v0 || Math.abs(v0) < 0.02) return currentY

  // 参数解构（方便后续改）
  const { baseK, gamma, minK, maxSteps, dt, velThreshold, bias } = inertiaModel

  // 离散仿真：每 ms 更新速度并累加位移
  // 速度衰减模型：k(v) = baseK / (1 + gamma * |v|)
  // 这是经验式：速度越大，k 越小（阻尼减弱）
  // 使用 v(t+dt) = v(t) * exp(-k(v) * dt)
  let v = v0 // px/ms
  let pos = 0
  let steps = 0

  while (Math.abs(v) > velThreshold && steps < maxSteps) {
    // 动态计算当前阻尼 k
    const kv = baseK / (1 + gamma * Math.abs(v))
    const decay = Math.exp(-kv * dt) // 每 ms 的衰减乘子
    // 积分：位移 += v * dt
    pos += v * dt
    // 速度衰减
    v = v * decay
    steps += dt
    // 安全保护：防止数值爆炸
    if (Math.abs(pos) > 20000) break
  }

  // 应用 bias（校准得到）
  const predicted = currentY + pos + (bias || 0)

  return predicted
}

// ====== 校准函数：当你拿到真实落点后调用 ======
// predicted: 上面 predictFromVelocity 返回的值
// real: 从 scrollend / 检测到的真实最终 scrollTop
function calibrate(predicted, real) {
  if (!isFinite(predicted) || !isFinite(real)) return

  const error = real - predicted // 正表示预测偏小，需要增大位移或减小阻尼
  // EMA 更新 bias（快速修正稳定偏差）
  const alphaBias = 0.08
  inertiaModel.bias = (1 - alphaBias) * (inertiaModel.bias || 0) + alphaBias * error

  // 微调 baseK（按误差方向轻微调整）
  // 如果预测偏小（error>0），说明仿真太保守（阻尼太大），应稍微减小 baseK
  // 如果预测偏大（error<0），应略微增大 baseK
  const lr = inertiaModel.learnRate
  const adjust = 1 - lr * Math.sign(error) * Math.min(0.12, Math.abs(error) / Math.max(200, Math.abs(predicted)))
  inertiaModel.baseK = Math.max(inertiaModel.minK, inertiaModel.baseK * adjust)

  // 另外微调 gamma（让速度依赖项自适应）
  // 若高速误差较大（|error|/|predicted| > 0.1），调整 gamma
  const relErr = Math.abs(error) / Math.max(1, Math.abs(predicted))
  if (relErr > 0.08) {
    inertiaModel.gamma = Math.max(0, inertiaModel.gamma * (1 - lr * Math.sign(error) * 0.5))
    // clamp gamma to reasonable range
    inertiaModel.gamma = Math.max(0, Math.min(1.2, inertiaModel.gamma))
  }
}

// 预测落点功能
let lastPositions: { time: number; y: number }[] = []
const onListDragStart = (e: any) => {
  lastPositions = [
    {
      time: Date.now(),
      y: e.detail.scrollTop,
    },
  ]
}

const onListDragging = (e: any) => {
  lastPositions.push({
    time: Date.now(),
    y: e.detail.scrollTop,
  })
}

const onListDragEnd = (e: any) => {
  if (lastPositions.length < 2) return
  // console.log('lastPositions', lastPositions)
  // const first = lastPositions[0]
  // const last = lastPositions[lastPositions.length - 1]

  // const deltaY = last.y - first.y
  // const deltaT = last.time - first.time

  // const velocity = deltaY / deltaT
  // const friction = 0.004
  // const inertia = velocity / friction

  // const predictedEnd = e.detail.scrollTop + inertia
  console.log('lastPositions', lastPositions, e.detail.scrollTop, e.detail)
  // const predicted = predictFinal(lastPositions, e.detail.scrollTop)
  const predicted = predictFinalDiscrete(lastPositions, e.detail.scrollTop)
  // const predicted = predictFromVelocity(e.detail.velocity.y, e.detail.scrollTop)

  console.log('预测最终落点:', predicted)

  // scrollTop.value = predicted
  // updateVisibleIndex()
}

/* 初始化数据 */
const init = async (needloading: boolean = true) => {
  page.value = 1
  finished.value = false
  if (needloading) {
    loading.value = true
  }
  isEmpty.value = false
  isLoadFail.value = false
  // items.value = []
  isVirtual.value = true

  try {
    const data = await props.fetch(page.value)
    if (!data?.data?.length) {
      isEmpty.value = true
      items.value = []
      return
    }
    const _vClass = `virtual-${Date.now()}`
    items.value = data.data.map((d, i) => markRaw({ ...d, _vClass, _vId: `${_vClass}-${i}` } as any))
    total.value = data.total || items.value.length
    finished.value = items.value.length >= total.value
    scrollToTop()

    measureHeights(_vClass)
  } catch {
    isLoadFail.value = true
  } finally {
    if (needloading) {
      loading.value = false
    }
  }
}

const triggerList = async (currItem?: T) => {
  recalculateCumulativeHeights(items.value)
  if (currItem?._vId) {
    const index = items.value.findIndex((v) => v._vId === currItem?._vId)
    if (index === -1) {
      return
    }
    const item = items.value[index]
    delete item.height
    console.log('item', item)
    triggerRef(items)
    await measureHeightById(currItem?._vId)
  }
  triggerRef(items)
  nextTick(() => updateVisibleIndex())
}

const onRefresh = async () => {
  refreshing.value = true
  try {
    await init(false)
  } finally {
    refreshing.value = false
  }
}

const onLoad = async () => {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const nextPage = page.value + 1
    const data = await props.fetch(nextPage)
    if (!data?.data?.length) {
      finished.value = true
      return
    }
    const _vClass = `virtual-${Date.now()}`
    const curLength = items.value.length
    const newItems = data.data.map((d, i) => markRaw({ ...d, _vClass, _vId: `${_vClass}-${i + curLength}` } as any))
    items.value.push(...newItems)
    page.value = nextPage
    total.value = data.total || items.value.length
    finished.value = items.value.length >= total.value

    measureHeights(_vClass)
  } finally {
    loading.value = false
  }
}

const measureHeights = (_vClass, retryCount = 10, delay = 300) => {
  if (!isVirtual.value) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const execQuery = (left: number) => {
      const query = Taro.createSelectorQuery()

      query
        .selectAll(`.${_vClass}`)
        .boundingClientRect()
        .exec(([rects]) => {
          console.log('measureHeights', rects)
          // rects 为空：可能是节点还没渲染出来，需要重试
          if (!rects || rects.length === 0) {
            if (left > 0) {
              setTimeout(() => execQuery(left - 1), delay)
            } else {
              // 虚拟列表降级成普通列表
              isVirtual.value = false
              console.warn(`measureHeights: 超过最大重试次数，依然未获得 rects`)
              resolve()
            }
            return
          }

          // 找到第一个对应_vClass 的 index
          const findIndex = items.value.findIndex((v) => v._vClass === _vClass)
          console.log('findIndex', findIndex)

          if (findIndex > -1) {
            rects.forEach((rect, idx) => {
              const item = items.value[idx + findIndex]
              if (!item) return

              if (rect.height && rect.height !== item.height) {
                item.height = rect.height
              }
            })
          }

          // 更新虚拟列表
          triggerList()
          resolve()
        })
    }

    execQuery(retryCount)
  })
}

const measureHeightById = (_vId, retryCount = 10, delay = 100) => {
  if (!isVirtual.value) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const execQuery = (left: number) => {
      const query = Taro.createSelectorQuery()

      query
        .select(`#${_vId}`)
        .boundingClientRect()
        .exec(([rect]) => {
          // rect 为空，说明节点还没渲染出来
          if (!rect || !rect.height) {
            if (left > 0) {
              setTimeout(() => execQuery(left - 1), delay)
            } else {
              // 虚拟列表降级成普通列表
              isVirtual.value = false
              console.warn(`measureHeightById: 超过最大重试次数，未找到 rect: ${_vId}`)
              resolve()
            }
            return
          }

          // 找到对应 item
          const index = items.value.findIndex((v) => v._vId === _vId)
          if (index === -1) {
            console.warn(`measureHeightById: items 中未找到 _vId = ${_vId}`)
            resolve()
            return
          }

          const item = items.value[index]

          // 更新高度
          if (rect.height !== item.height) {
            item.height = rect.height
          }

          resolve()
        })
    }

    execQuery(retryCount)
  })
}

/** 用于把当前列表恢复为虚拟列表的方法 */
const recoverVirtual = () => {
  if (isVirtual.value) return

  isVirtual.value = true

  const _vClass = `virtual-${Date.now()}`
  items.value = items.value.map((d, i) => markRaw({ ...d, _vClass } as any))

  measureHeights(_vClass, 20)
}

const updateListHeight = () => {
  kyListRef.value?.updateListHeight()
}

const setScrollY = (val: number) => {
  kyListRef.value?.setScrollY(val)
}

const scrollToTop = () => {
  kyListRef.value?.scrollToTop?.()
}

onMounted(async () => {
  viewportHeight.value = kyListRef.value?.getViewportHeight?.() || Taro.getSystemInfoSync().windowHeight
  init()
})

defineExpose({
  init,
  allData: items,
  total,
  refreshing,
  updateListHeight,
  setScrollY,
  scrollToTop,
  triggerList,
  recoverVirtual,
})
</script>

<style lang="scss">
.ky-card-skeleton {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 16px;
  background-color: #fff;
  border: 1px solid #eee;
  width: calc(100% - 48px);
  box-sizing: border-box;
  overflow: hidden;
  margin: auto;

  /* 动效层 */
  .ky-skeleton-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: linear-gradient(
      90deg,
      rgba(239, 239, 239, 0) 0%,
      rgba(220, 220, 220, 0.6) 50%,
      rgba(239, 239, 239, 0) 100%
    );
    background-repeat: no-repeat;
    animation: backpos 2s ease-in-out infinite;
  }

  .ky-skeleton-animation-image {
    width: 100%;
    margin: auto;
    flex-shrink: 0;
  }

  @keyframes backpos {
    0% {
      background-position-x: -500px;
    }
    100% {
      background-position-x: calc(500px + 100%);
    }
  }
}
</style>
