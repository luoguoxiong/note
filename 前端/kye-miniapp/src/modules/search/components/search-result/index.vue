<template>
  <view class="search-result-list" id="search-result-list-page">
    <ky-tab v-model="context.state.activeTab" :tabs="tabs" />

    <ky-list
      class="search-result-list__content"
      :class="{ 'search-result-list__content-1': isQWWaybill, 'search-result-list__content-2': isResult2 }"
      :isFinished="activeTab === 1 ? !context.waybillHasMore : true"
      v-model:refreshing="refreshing"
      v-model:loading="state.loading"
      :isEmpty="true"
      @refresh="onRefresh"
      @load="onLoad"
      ref="kyListRef"
    >
      <!-- && state.waybill.total > 1 -->
      <ky-empty
        class="search-result-list__empty"
        type="https://ic-img.ky-express.com/netc/20250716_60274_!!1752632086265_560_560.png"
        description="搜索无结果"
        v-if="isEmpty"
      />
      <template v-if="activeTab === 0">
        <ResultWrapper
          v-if="state.search.waybill?.length"
          @load-more="context.updateTab(1)"
          type-text="运单"
          :total="state.waybill.total || 0"
        >
          <WaybillList @refresh="cancelOrd" />
        </ResultWrapper>
        <ResultWrapper
          v-if="state.search.application?.length"
          @load-more="context.updateTab(2)"
          type-text="应用"
          :total="state.search.application?.length || 0"
          isApplicationList
        >
          <ApplicationList />
        </ResultWrapper>
      </template>
      <WaybillList v-else-if="activeTab === 1" @refresh="cancelOrd" />
      <ApplicationList v-else-if="activeTab === 2" />
    </ky-list>
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useSearchContext } from '../../context'

import WaybillList from './waybill-list.vue'
import ApplicationList from './application-list.vue'
import ResultWrapper from '../result-wrapper/index.vue'
import './index.scss'

// defineOptions({ name: 'search-result-list' })

const context = useSearchContext()
const state = context.state

const activeTab = computed(() => {
  return context.state.activeTab
})

const tabs = computed(() => [
  { label: '全部', badgeCount: 0, id: 'all' },
  { label: '运单', badgeCount: 0, id: 'waybill' },
  { label: '应用', badgeCount: 0, id: 'application' },
])

const refreshing = ref(false)

const kyListRef = ref()
onMounted(() => {
  kyListRef.value?.scrollToTop?.()
})

const cancelOrd = (orderNumber: string) => {
  context.cancelOrd(orderNumber)
}

const onRefresh = () => {
  refreshing.value = true

  context.onSearch(false, undefined, false).finally(() => {
    refreshing.value = false
  })
}

const isEmpty = computed(() => {
  if (state.loading) return false

  if (activeTab.value === 1) {
    return !state.search.waybill?.length
  } else if (activeTab.value === 2) {
    return !state.search.application?.length
  }

  return !state.search.waybill?.length && !state.search.application?.length
})

const isQWWaybill = computed(() => {
  return activeTab.value === 1 && state.waybill.total > 1
})

const isResult2 = computed(() => {
  return activeTab.value === 2
})

const onLoad = () => {
  if (activeTab.value === 1) {
    context.onLoadMore()
  }
}
</script>
