<template>
  <div class="update-goods-time-list">
    <!-- 缺省页 -->
    <Empty
      v-if="!listLength && !state.showSkeleton && !state.loading"
      :errorText="state.errorText || '暂无数据'"
      @goOrder="goOrder"
      @reload="initPage"
    />
    <ListRefreshLoad
      v-if="!state.showSkeleton && listLength > 0"
      :refreshing="state.refreshing"
      :loading="state.loading"
      :finished="state.finished"
      :finishedText="finishedText"
      :offset="100"
      @onLoad="onLoad"
      @onRefresh="onRefresh"
    >
      <Card
        v-for="(item, index) in state.list"
        @checkChange="onCheckChange"
        :key="index"
        :info="item"
        :isChecked="getIsChecked(item)"
      />
    </ListRefreshLoad>
  </div>
</template>
<script setup lang="ts">
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import Card from '../card/index.vue'
import Empty from '../empty/index.vue'
import { computed, onMounted } from 'vue'
import { debounce } from 'lodash-es'

import { getGoodsTimeWaybill } from '@order-public-sub-public/apis/update-goods-time'
import { allCheckedStatus, checkedList, loadingToast, MAX_SELECT_NUMBER, state } from '../../hooks/state'
import { getIsChecked, setChecked } from '../../hooks/updateState'
import { GoodsTimeWaybillItem } from '@order-public-sub-public/apis/update-goods-time/type'
import { getOrderConfigUrl } from '@order-public-sub-public/configs'
import { Channel } from '@order-public-sub-public/constants'
import { openURL } from '@/modules/webview/utils'
import router from '@order-public-sub-public/router'
import { showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'

// 没有更多文案
const finishedText = computed(() => (listLength.value > 8 ? '没有更多了' : ''))

// 列表数据长度
const listLength = computed(() => state.value.list?.length)

const onLoad = async (isRefresh: boolean) => {
  state.value.page += 1
  state.value.loading = !state.value.refreshing && !isRefresh
  try {
    const params = {
      page: state.value.page,
      pageSize: state.value.pageSize,
    }
    const { data } = await getGoodsTimeWaybill(params)

    if (state.value.refreshing) {
      state.value.list = []
      state.value.refreshing = false
    }

    state.value.list = state.value.page === 1 ? data?.rows : [...state.value.list, ...data?.rows]

    // 如果是全选状态,达到最大值之前
    if (data?.rows && allCheckedStatus.value && checkedList.value.length < MAX_SELECT_NUMBER) {
      const newResponseList = data?.rows

      // 计算还可以添加多少项而不超过100的限制
      const remainingSpace = MAX_SELECT_NUMBER - checkedList.value.length

      // 如果newResponseList的数量小于等于剩余空间，则全部添加
      if (newResponseList.length <= remainingSpace) {
        checkedList.value.push(...newResponseList)
      } else {
        // 否则只添加需要的部分以达到100的限制
        checkedList.value.push(...newResponseList.slice(0, remainingSpace))
      }
    }
    state.value.refreshing = false
    state.value.pageTotal = data?.pageTotal
    state.value.finished = state.value.page >= state.value.pageTotal

    if (!listLength.value) {
      state.value.errorText = '暂无运单数据'
    }
  } catch (error) {
    state.value.page -= 1
    state.value.refreshing = false
    state.value.finished = true
    state.value.errorStatus = true
    if ((error as any).code === 'ERR_NETWORK') {
      state.value.errorText = '当前无网络，请检查后重试'
    } else {
      state.value.errorText = (error as any).message || (error as any).msg
    }
  } finally {
    state.value.loading = false
    state.value.showSkeleton = false
    state.value.initLoading = true
    loadingToast.value?.close()
  }
}

/**
 * 上拉加载
 */
const onRefresh = () => {
  state.value.page = 0
  state.value.refreshing = true
  state.value.errorStatus = false
  checkedList.value = []
  return onLoad(false)
}

defineExpose({
  onRefresh: onRefresh,
})

/**
 * 重新加载
 */
const onReLoad = debounce(() => {
  state.value.loading = true
  onRefresh()
}, 300)

const onCheckChange = (info: GoodsTimeWaybillItem) => {
  setChecked(info)
}

/**
 * @description 去寄件,重开一个页面
 * @param channel
 */
const goOrder = () => {
  const url = getOrderConfigUrl({
    channel: Channel.快速寄件,
  }).replace('update-goods-time', 'order')
  console.log('url', url)
  if (location.hostname === 'localhost') {
    router.push({
      path: '/order',
    })
  } else {
    openURL(url, {
      type: 'redirectTo',
      needLogin: true,
    })
  }
}

const initPage = () => {
  const paramsLoading = {
    message: '加载中',
    duration: 0,
    forbidClick: true,
  }
  loadingToast.value = showLoadingToast(paramsLoading)
  onReLoad()
}

onMounted(() => {
  initPage()
})
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
