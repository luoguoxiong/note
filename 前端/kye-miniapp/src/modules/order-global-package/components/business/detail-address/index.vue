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
            :formatter="formatter"
            @clear="onClear"
            :showWordLimit="false"
            @paste="pasteHandle"
            :always-system="true"
            :rows="1"
            :shouldFocus="true"
            :adjustPosition="false"
            :enableWxNative="true"
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
            @onClick="onSelect"
          />
        </div>
      </ListRefreshLoad>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, nextTick, watch } from 'vue'
import { debounce } from 'lodash-es'
import { showToast } from '../../../hooks/useShowToast'
import { stopPullDownRefresh } from '@tarojs/taro'
// 组件 — 迁移后路径
import KyTextarea from '../../base/ky-textarea/index.vue'
import BottomPopup from '../../ui/bottom-popup-ui/index.vue'
import ListRefreshLoad from '../../ui/list-refresh-load/index.vue'
import List from './components/list/index.vue'

import SvgIcon from '../../ui/svg-icon/index.vue'
import KyButton from '../../base/ky-button/index.vue'
// 方法
import { findSuggest, aiAddrAnalysis } from '../../../apis/address'
import { FindSuggestItem, AiAddrAnalysisRes } from '../../../apis/address/types'
import { getValueOrEmpty } from '../../../utils'
// 类型
import { DetailAddressState } from './types'
import './index.scss'

// === 内联解耦依赖 ===

/** Address 常量内联 */
const Address = {
  SENDER: 'SENDER',
  RECEIVE: 'RECEIVE',
} as const

/** filterEmojis 内联（原 @order-public/utils/pattern） */
const filterEmojis =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{2753}-\u{2755}\u{2776}-\u{277F}\u{2B50}-\u{2B55}\u{DC00}-\u{DFFF}\u{D83C}-\u{DBFF}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}]*/gu

/** getDetailAddressSceneType 内联（原 @order-public/utils/waybillInfo） */
const getDetailAddressSceneType = (type: number) => (type === 10 ? 'sender' : 'receive')

/** useOriginalAddress 替代：内部 ref */
const originalAddress = ref('')

/** updateCommonDisabledScroll 内联 */
const updateCommonDisabledScroll = () => {
  // eslint-disable-next-line no-restricted-globals
  if (process.env.TARO_ENV === 'weapp') wx?.pageScrollTo({ scrollTop: 0, duration: 0 })
}

/** setFooterZIndex — 从 global-package types 引入 */
// @ts-ignore
import { setFooterZIndex } from '../../../types/footer'

/** 埋点函数 — 从 global-package/report 引入 */
import { detailPopupClosedReport as reportDetailPopupClosed, pasteReport as reportPaste } from '../../../report/index'

interface PropsType {
  addressType: string
  area: string[]
  waybillNumber?: string
  sceneType?: string
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

watch(
  () => state.showPopup,
  (val) => {
    setFooterZIndex(val)
    if (!val) {
      reportDetailPopupClosed(props.addressType)
    }
  },
)

const emit = defineEmits([
  'onConfirmDetailAddress',
  'onSelect',
  'getResolutionData',
  'close',
  'originalAddress',
  'onClickConfirm',
])

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
  state.message = value?.slice(0, 80)
  state.page = 0
  if (value) {
    state.allLoading = true
    onLoad(true)
    setTimeout(() => {
      if (searchRef.value?.textAreaRef) {
        searchRef.value?.textAreaRef?.focus()
      }
    }, 20)
  } else {
    state.finished = true
  }
  // 寄件曝光上报（注释）
  // if (props.addressType === Address.SENDER) {
  //   umpOtherReport(...)
  // }
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
  reportDetailPopupClosed(props.addressType)
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
const onConfirmDetailAddress = debounce(
  async () => {
    emit('onClickConfirm', state.message)
    if (!state.message) {
      const text = props.addressType === Address.SENDER ? '请输入寄件详细地址' : '请输入收件详细地址'
      showToast(text)
      return false
    }
    // 已有任意一级行政区域 → 不触发智能识别，保留原始输入
    if (props.area?.some((i) => i)) {
      emit('onSelect', {
        province: props.area?.[0] || '',
        city: props.area?.[1] || '',
        county: props.area?.[2] || '',
        detailAddress: state.message,
      })
      state.showPopup = false
      emit('getResolutionData')
      updateCommonDisabledScroll()
      return
    }

    let keyword = `${props.area?.filter((i) => i)?.join('') || ''}${state.message}`

    state.headerLoading = true

    try {
      const { data }: { data?: AiAddrAnalysisRes } = await aiAddrAnalysis({
        text: keyword,
        fillTownToDetails: 10,
        businessId: props?.waybillNumber || '', // 移除 piniaStore 依赖，使用 props.waybillNumber
        sceneType: getDetailAddressSceneType(getAddressType(props.addressType)),
      })
      const res = data?.addressInfos?.[0] || {}
      originalAddress.value = data.originalAddress || ''
      emit('originalAddress', originalAddress.value)
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
      updateCommonDisabledScroll()
    } catch (error) {
      console.log('error', error)
    } finally {
      state.headerLoading = false
    }
  },
  800,
  {
    leading: true,
  },
)

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
  reportPaste(state.message, props.addressType)
}, 100)
const clearData = () => {
  state.message = ''
  state.page = 0
  state.list = []
  collapseTheKeyboard()
}

const updateMessage = debounce(() => {
  state.message = state.message.replace(filterEmojis, '')
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
        source: props.sceneType === 'freightTime' ? '10' : '',
      })

      // 收件页曝光上报（注释）
      // if (window.location.href.indexOf('receive') > -1 && res?.data?.data?.length > 0) {
      //   umpOtherReport(...)
      // }

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
