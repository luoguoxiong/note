<template>
  <List
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    v-model:finished="finished"
    :isFinished="finished"
    :disabledRefresh="props?.disabledRefresh"
    @refresh="onRefresh"
    @load="onLoad"
    :isEmpty="isEmpty"
    :isLoadFail="isLoadFail"
    :noData="noData"
    :scrollViewProps="props?.scrollViewProps"
    :showLoading="props?.showLoading"
    ref="kyListRef"
  >
    <view class="list-empty" v-if="isEmpty">
      <slot name="empty">
        <Empty type="search" description="暂无数据" image-size="100" />
      </slot>
    </view>

    <template v-else>
      <slot v-if="!(noData && isLoadFail)" name="beforeContent"></slot>

      <template v-for="(item, index) in items" :key="index">
        <slot :data="item"></slot>
      </template>
    </template>

    <template #finished>
      <slot name="finished"></slot>
    </template>

    <template #load-fail>
      <slot name="load-fail">
        <view v-if="noData && isLoadFail" class="list-load-fail">
          <Empty type="network" description="网络异常，请重试" image-size="100">
            <KyButton type="primary" @click.stop="init" class="load-fail-btn"> 点击重试 </KyButton>
          </Empty>
        </view>
      </slot>
    </template>
  </List>
</template>

<script lang="ts" setup generic="T">
import './index.scss'
import { List, Empty, Button as KyButton } from '@ky-miniui-lib/ky-miniui-lib'
import { ref, shallowRef, triggerRef, computed } from 'vue'

/** ===== 类型定义 ===== */
type FetchResult<T> = {
  data: T[]
  total: number
}

type FetchFn<T> = (page: number) => Promise<FetchResult<T>>

export interface ListStandardProps<T> {
  fetch: FetchFn<T>
  shallowRef?: boolean
  /** 是否禁用下拉刷新 */
  disabledRefresh?: boolean
  scrollViewProps?: any
  showLoading?: boolean
}

/** ===== Props ===== */
const props = defineProps<ListStandardProps<T>>()

/** ===== 状态 ===== */
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const kyListRef = ref<any>(null)

// 关键：泛型数组
const items = props.shallowRef ? shallowRef<T[]>([]) : ref<T[]>([])

const page = ref(1)
const total = ref(0)

const noData = computed(() => items.value.length === 0)
const isEmpty = ref(false)
const isLoadFail = ref(false)

/** ===== 初始化 ===== */
const init = async () => {
  try {
    page.value = 1
    finished.value = false
    loading.value = true
    isEmpty.value = false
    isLoadFail.value = false

    const data = await props.fetch(page.value)

    items.value = data.data || []
    total.value = data.total

    finished.value = items.value.length >= data.total
    isEmpty.value = items.value.length === 0

    scrollToTop()
  } catch (error) {
    isLoadFail.value = true
  } finally {
    loading.value = false
  }
}

/** ===== 滚动到顶部 ===== */
const scrollToTop = () => {
  kyListRef.value?.scrollToTop?.()
}

/** ===== 下拉刷新 ===== */
const onRefresh = async () => {
  try {
    refreshing.value = true
    page.value = 1
    finished.value = false
    isLoadFail.value = false

    const data = await props.fetch(page.value)

    items.value = data.data || []
    total.value = data.total

    finished.value = items.value.length >= data.total
    isEmpty.value = items.value.length === 0
  } catch (error) {
    isLoadFail.value = true
  } finally {
    refreshing.value = false
  }
}

/** ===== 上拉加载 ===== */
const onLoad = async () => {
  if (loading.value || finished.value) return

  try {
    loading.value = true
    isLoadFail.value = false

    page.value++

    const data = await props.fetch(page.value)

    items.value.push(...data.data)
    total.value = data.total

    finished.value = items.value.length >= data.total
  } catch (error) {
    page.value-- // 回滚页码
    isLoadFail.value = true
  } finally {
    loading.value = false
  }
}

/** ===== 工具方法 ===== */
const updateListHeight = () => {
  kyListRef.value?.updateListHeight?.()
}

const setScrollY = (val: number) => {
  kyListRef.value?.setScrollY?.(val)
}

// shallowRef 强制更新
const triggerList = () => {
  if (!props.shallowRef) return
  triggerRef(items)
}

// ✅ 修复：这里必须是 T[]
const updateListData = (list: T[]) => {
  items.value = list
}

/** ===== 初始化执行 ===== */
init()

/** ===== 暴露方法 ===== */
defineExpose({
  init,
  allData: items,
  total,
  refreshing,
  updateListHeight,
  setScrollY,
  scrollToTop,
  triggerList,
  updateListData,
})
</script>
