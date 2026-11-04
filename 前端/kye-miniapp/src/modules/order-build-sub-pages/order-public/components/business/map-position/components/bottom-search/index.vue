<template>
  <div class="map-position-bottom-search">
    <!-- 搜索 -->
    <div class="address-search">
      <ky-input
        ref="search"
        v-model="state.keyword"
        clearable
        placeholder="请输入地址搜索"
        :maxlength="50"
        :formatter="formatter"
        :show-action="state.isSearch"
        @clear="handleCancel(false)"
        @focus="state.isSearch = true"
        @update:model-value="onUpdate"
        :cursor-spacing="350"
      >
        <template #left>
          <SvgIcon name="search-icon" class="search-icon" />
        </template>
      </ky-input>
      <div v-if="state.isSearch" class="address-search__cancel" @click="handleCancel(true)">取消</div>
    </div>

    <!-- 搜索加载 -->
    <KyLoading v-if="!state.showSkeleton && state.searchLoading" text="加载中..." />

    <!-- 缺省状态 -->
    <Empty v-if="!listLength && !state.showSkeleton && !state.searchLoading" />

    <!-- 骨架屏 -->
    <!-- <Skeleton v-if="state.showSkeleton" /> -->

    <!-- 列表 -->
    <ListRefreshLoad
      v-if="!state.showSkeleton && !state.searchLoading && listLength"
      :refreshing="state.refreshing"
      :loading="state.loading"
      :finished="state.finished"
      :finishedText="finishedText"
      @onLoad="onLoad"
      @refresh="onRefresh"
    >
      <List
        v-for="(item, index) in state.list"
        :key="index"
        :item="item"
        :keyword="state.keyword"
        :isSelect="state.activeIndex === index"
        :activeIndex="state.activeIndex"
        @onSelect="onSelect(item, index)"
      />
    </ListRefreshLoad>

    <!-- 底部按钮 -->
    <div class="map-position-bottom-search-footer" v-if="state.list.length > 0">
      <ky-button class="map-position-bottom-search-footer-button" size="large" type="primary" @click="onConfirm"
        >确认</ky-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { debounce } from 'lodash-es'

// 组件
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import Empty from '@order-public-sub-public/components/business/map-position/components/empty/index.vue'
import List from '../list/index.vue'
// import Skeleton from '../skeleton/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { stopPullDownRefresh } from '@tarojs/taro'

// 方法
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
import { toBase64 } from '@order-public-sub-public/utils/string'
import { filterAllSpace, isEmptyText } from '@order-public-sub-public/utils'
import { getAddressFromMap, findPositionFromMap } from '@order-public-sub-public/apis/address'
// 类型
import { ItemSelect, ReactiveType, OnloadParams } from '../../types'

import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const state = reactive<ReactiveType>({
  show: true,
  keyword: '', // 关键词
  activeIndex: 0,
  showSkeleton: false,
  searchLoading: false,
  isSearch: false,
  refreshing: false,
  loading: false,
  finished: false,
  list: [],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
  result: {}, // 选中的值
  region: '',
  lng: '',
  lat: '',
})

const emit = defineEmits(['select', 'set-position', 'onConfirm', 'update:keyword'])

const onUpdate = () => {
  state.isSearch = true
  emit('update:keyword', state.keyword)
  onSearch()
}

/**
 * 搜索
 */
const onSearch = debounce(async function (lng?: string, lat?: string, cb?: () => {}) {
  console.log('onSearch lng:', lng, ',lat:', lat)
  state.searchLoading = true
  state.page = 0
  state.list = []
  onLoad(lng, lat, cb)
}, 300)

/**
 * 选中
 * @param item
 * @param index
 */
const onSelect = (item: ItemSelect, index: number) => {
  state.activeIndex = index
  state.result = item
  emit('select', item)
}

/**
 * 确定
 */
const onConfirm = () => {
  emit('onConfirm', state.result)
}

/**
 * 下拉刷新
 * @param
 */
const onLoad = debounce(async (lng?: string, lat?: string | undefined, cb?: () => {}) => {
  console.log('onLoad lng:', lng, ',lat:', lat)
  state.page += 1
  if (state.loading) return
  state.loading = true
  state.lng = lng || state.lng
  state.lat = lat || state.lat
  const params: OnloadParams = {
    policy: '1',
    radius: '500',
    lng: toBase64(state.lng),
    lat: toBase64(state.lat),
    pageSize: state.pageSize,
  }
  try {
    // 搜索状态，且有输入内容时再出发过滤api
    const isSearchFlag = state.isSearch && !isEmptyText(state.keyword)
    // 非搜索
    if (!isSearchFlag) {
      params.page = state.page
      params.address = state.keyword
    } else {
      // 搜索
      params.message = state.keyword
      params.pageIndex = state.page
    }

    const { data } = await (isSearchFlag ? findPositionFromMap(params) : getAddressFromMap(params))
    console.log('定位数据===>', data)

    const list = isSearchFlag ? data?.list || [] : data?.addressList || []

    if (isSearchFlag) {
      //  地址联想
      umpOtherReport('OTHER', {
        eventCode: 'other_express_sender_position_associate_perception_v1',
      })
    }

    if (state.refreshing) {
      state.list = []
    }

    state.list = state.page === 1 ? list : [...state.list, ...(list || [])]
    state.pageTotal = data?.count
    state.finished = state.pageSize >= state.pageTotal
    state.region = data?.city || ''

    state.result = state.list[state.activeIndex]
  } catch (error) {
    state.page -= 1
    state.finished = true
  } finally {
    state.refreshing = false
    state.loading = false
    state.showSkeleton = false
    state.searchLoading = false
    stopPullDownRefresh()
    cb && cb()
  }
}, 200)
/**
 * 上拉加载
 */
const onRefresh = () => {
  state.page = 0
  state.refreshing = true
  onLoad()
}

// 列表数组长度
const listLength = computed(() => state.list?.length)

// 没有更多文案
const finishedText = computed(() => (listLength.value > 6 ? '没有更多了' : ''))

// 格式化
const formatter = (value: string) => filterAllSpace(value.replace(filterEmojis, ''))

const resetKeyword = () => {
  state.keyword = ''
}

const search = ref()
const handleCancel = (isCancel) => {
  state.keyword = ''
  state.isSearch = false
  if (isCancel) {
    search.value?.blur()
    onSearch()
  }
}

onMounted(async () => {
  state.showSkeleton = true
})

// keyword 需用方法才能暴露给外部
defineExpose({ onSearch, onLoad, getKeyword: () => state.keyword, resetKeyword })
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
