<template>
  <div class="detail-address">
    <BottomPopup
      v-model:show="state.showPopup"
      title="详细地址"
      :showFooter="false"
      @onClose="close"
      @closed="closed"
      class="detail-address-popup"
    >
      <!-- 输入框 -->
      <div class="detail-address-header-container">
        <div class="detail-address-header-container__textarea">
          <!--  v-show用于解决popup组件渲染不全异常   -->
          <KyTextarea
            v-show="true"
            ref="searchRef"
            v-model="state.message"
            clearable
            placeholder="详细地址(例如**街**号**)，选择列表地址更精准"
            :maxlength="80"
            @input="updateMessage"
            @formatter="formatter"
            @clear="onClear"
            :showWordLimit="false"
            @paste="pasteHandle"
            :always-system="true"
            :rows="1"
          ></KyTextarea>
          <KyButton
            text="确定"
            :loading="state.loading"
            loading-text="确定"
            size="mini"
            @click="onConfirmDetailAddress"
          />
        </div>
        <div v-show="listLength" class="detail-address-header-container__tips">
          <SvgIcon class="icon" name="tips" />
          <span>{{ listTips }}</span>
        </div>
      </div>

      <!-- 搜索加载 -->
      <!-- <div class="width-100"  v-if="state.allLoading">
        <KyLoading class="detail-address-header-container__loading" text="加载中..." />
      </div> -->

      <!-- 列表 -->
      <ListRefreshLoad
        :refreshing="state.refreshing"
        :loading="false"
        :finished="state.finished"
        :finishedText="finishedText"
        @onLoad="onLoad"
        @refresh="onRefresh"
        :class="['list-refresh-wrap', !!listLength && 'other-height']"
      >
        <div class="list-wrap">
          <List
            v-for="item in state.list"
            :key="item.id"
            :suggest-item="item"
            :keyword="state.message"
            @click="onSelect(item)"
          />
        </div>
      </ListRefreshLoad>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { stopPullDownRefresh } from '@tarojs/taro'
// 组件
import KyTextarea from '@order-public-sub-public/components/base/ky-textarea/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import List from '@order-public-sub-public/components/business/detail-address/components/list/index.vue'

import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// 方法
import { findSuggest, aiAddrAnalysis } from '@order-public-sub-public/apis/address'
import { FindSuggestItem, AiAddrAnalysisRes } from '@order-public-sub-public/apis/address/types'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
// 类型
import { Address } from '@order-public-sub-public/constants'
import { DetailAddressState } from './types'
import { useOriginalAddress, updateCommonDisabledScroll } from '@order-public-sub-public/hooks/address/useCommon'

import { getDetailAddressSceneType } from '@order-public-sub-public/utils/waybillInfo'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import {
  detailPopupClosedReport,
  pasteReport,
} from '@order-public-sub-public/components/business/detail-address/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface PropsType {
  addressType: string
  area: string[]
  waybillNumber?: string
}

const props = withDefaults(defineProps<PropsType>(), {
  addressType: '',
  area: () => [],
  waybillNumber: '',
})

const state = reactive<DetailAddressState>({
  showPopup: false,
  headerLoading: false,
  message: '',
  allLoading: false,
  refreshing: false,
  loading: false,
  finished: false,
  list: [],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
})

const emit = defineEmits(['onConfirmDetailAddress', 'onSelect', 'getResolutionData', 'close'])

// 处理滑动，收起软键盘
const searchRef = ref<InstanceType<any> | null>()
const addressPromise = ref<Promise<unknown> | null>(null)
const collapseTheKeyboard = () => {
  if (searchRef.value) {
    // searchRef.value.$el?.querySelector('textarea')?.blur()
  }
}
const onTouchstart = () => {
  collapseTheKeyboard()
}

const open = (value: string) => {
  state.showPopup = true
  state.message = value
  state.page = 0
  if (value) {
    state.allLoading = true
    onLoad(true)
    // setTimeout(() => {
    //   if (searchRef.value?.textAreaRef) {
    //     searchRef.value?.textAreaRef?.focus()
    //   }
    // }, 20)
  } else {
    state.finished = true
  }
  // 寄件
  if (props.addressType === Address.SENDER) {
    nextTick(() => {
      reportPerception('other_express_sender_address_perception_v1')
    })
  }
}

/**
 * @description 关闭弹窗后清除列表
 */
const close = () => {
  state.showPopup = false
  state.list = []
  emit('close')
  updateCommonDisabledScroll()
}

const closed = () => {
  detailPopupClosedReport(props.addressType)
}

// 选中每项
const onSelect = (item: FindSuggestItem) => {
  state.showPopup = false
  emit('onSelect', {
    province: getValueOrEmpty(item.province),
    city: getValueOrEmpty(item.city),
    county: getValueOrEmpty(item.county) || getValueOrEmpty(item.district),
    detailAddress: `${getValueOrEmpty(item.address)}${getValueOrEmpty(item.title)}`,
  })
  emit('getResolutionData')
}

// 解析地址
const getAddressType = (addressType: string) => {
  return addressType.includes('SENDER') || addressType.toString() === '10' ? 10 : 20
}

// 手动输入详细地址 点击弹窗确认按钮
// 确定
const onConfirmDetailAddress = async () => {
  if (!state.message) {
    const text = props.addressType === Address.SENDER ? '请输入寄件详细地址' : '请输入收件详细地址'
    showToast(text)
    return false
  }

  let keyword = `${props.area?.filter((i) => i)?.join('') || ''}${state.message}`

  state.headerLoading = true

  try {
    const { data }: { data?: AiAddrAnalysisRes } = await aiAddrAnalysis({
      text: keyword,
      fillTownToDetails: 10,
      businessId: props?.waybillNumber || piniaStore.order.waybillNumber,
      sceneType: getDetailAddressSceneType(getAddressType(props.addressType)),
    })
    const res = data?.addressInfos?.[0] || {}
    useOriginalAddress.value = data.originalAddress || ''
    const addressInfo = {
      province: getValueOrEmpty(res.province),
      city: getValueOrEmpty(res.city),
      county: getValueOrEmpty(res.county) || getValueOrEmpty(res.district),
      detailAddress: `${getValueOrEmpty(res.address)}`,
      companyName: getValueOrEmpty(res.company),
    }

    emit('onSelect', addressInfo, data?.addressInfos)
    state.showPopup = false
    emit('getResolutionData')
  } catch (error) {
    console.log('error', error)
  } finally {
    state.headerLoading = false
  }
}
const onClear = () => {
  clearData()
  setTimeout(async () => {
    // 解决onInput 使用debounce 清空后又出现list内容
    if (addressPromise.value) {
      await addressPromise.value
      clearData()
    }
  }, 310)
}
const pasteHandle = debounce(() => {
  pasteReport(state.message, props.addressType)
}, 100)
const clearData = () => {
  state.message = ''
  state.page = 0
  state.list = []
  collapseTheKeyboard()
}

const updateMessage = debounce(() => {
  state.page = 0
  state.list = []
  if (state.message) {
    state.allLoading = true
    onLoad(true)
  } else {
    state.finished = true
  }
}, 800)

/**
 * 下拉刷新
 * @param isRefresh 判断是刷新还是加载更多
 */
const onLoad = async (isRefresh: boolean) => {
  try {
    addressPromise.value = setPromise(isRefresh)
    await addressPromise
  } catch (error) {
  } finally {
    stopPullDownRefresh()
  }
}

const setPromise = (isRefresh: boolean) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    state.page += 1
    state.loading = !state.refreshing && !isRefresh
    // 获取详细地址数据
    try {
      // city 字段的定义不仅仅是城市名，还可以接收区域名，优先取后一个
      let cityValue = ''
      if (props?.area?.length > 0) {
        let index = props?.area?.length - 1
        cityValue = props?.area[index]
      }
      const res = await findSuggest({
        keyword: state.message,
        city: cityValue,
        page_index: state.page,
        page_size: state.pageSize,
      })

      // props.addressType === Address.SENDER
      console.log('res?.data?.data?.length  >>> ', res?.data?.data)
      if (window.location.href.indexOf('receive') > -1 && res?.data?.data?.length > 0) {
        // 说明在收件页面
        reportPerception('other_express_receiver_position_address_perception_v1')
      }

      console.log('地址联想 >>> ', res)
      // 重组数据解构
      let data = {
        rows: res.data?.data,
        pageTotal: res.data?.count || 0,
      }
      if (state.refreshing) {
        state.list = []
        state.refreshing = false
      }

      state.list = state.page === 1 ? data?.rows : [...state.list, ...data?.rows]
      state.refreshing = false
      state.pageTotal = data.pageTotal
      state.finished = state.pageSize > state.pageTotal
      state.loading = false
      state.allLoading = false
      resolve(res)
    } catch (error) {
      state.page -= 1
      state.refreshing = false
      state.finished = true
      state.loading = false
      state.allLoading = false
      reject(error)
    }
  })
}

/**
 * 上拉加载
 */
const onRefresh = () => {
  state.page = 0
  state.refreshing = true
  onLoad(false)
}

const listLength = computed(() => state.list?.length || 0)

// 没有更多文案
const finishedText = computed(() => (listLength.value > 6 ? '没有更多了' : ''))
const formatter = (value: string): string => value.replace(filterEmojis, '').trim()

/**
 * @description: 显示文案
 */
const listTips = computed(() => {
  const str = props.addressType === Address.SENDER ? '取货' : '派送'
  return `建议选择列表推荐地址，司机${str}更精确`
})

const toFocus = () => {
  setTimeout(() => {
    searchRef.value?.textAreaRef?.focus()
  }, 1000)
}

defineExpose({ open, toFocus })
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
