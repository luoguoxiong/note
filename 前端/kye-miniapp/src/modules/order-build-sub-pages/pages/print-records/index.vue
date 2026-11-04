<template>
  <view class="print-management">
    <!-- <ky-navbar v-if="isWxMiniApp" :leftArrow="true" title="打印记录"></ky-navbar> -->
    <view class="print-management-search">
      <view style="position: relative; width: 100%">
        <KySearch
          class="print-management-search__input"
          placeholder="请输入运单号"
          clearable
          readonly
          v-model="state.keyword"
          @click="state.inputFocusShow = true"
        />
        <image
          v-if="state.keyword"
          class="print-management-search-close-img"
          @tap="onSearchClear"
          src="https://ic-img.ky-express.com/netc/20250826_39579_!!1756209954762_56_56.png"
        ></Image>
      </view>
      <view class="screen" @click="onScreen">
        <view>
          <SvgIcon class="screen-icon" :name="showCalendar ? 'screen-check-icon' : 'screen-icon'" />
          <view class="label" :class="showCalendar ? 'active' : ''">筛选</view>
        </view>
      </view>
    </view>
    <!-- 骨架屏 -->
    <Skeleton v-if="state.showSkeleton" />

    <view class="date-selected" v-if="!state.showSkeleton && !showCalendar && !submitDisabled">
      <view class="date-selected__name">已选 :</view>
      <view class="date-selected__date">
        <span>{{ state.startTime }}</span>
        <span class="date-selected__dash">-</span>
        <span>{{ state.endTime }}</span>
        <!-- <SvgIcon class="date-selected__svg" name="clear-icon" @click="onSearchClear" /> -->
      </view>
      <view class="date-select-query-delete" @click="onSearchClear">
        <image
          class="query-delete-icon"
          src="https://ic-img.ky-express.com/netc/20250719_76068_!!1752898011988_64_66.png"
        />
      </view>
    </view>

    <!-- 加 载中 -->
    <ListRefreshLoad
      class="print-management-list"
      :class="{ 'print-management-list-empty': isShowListEmptyStatus }"
      v-if="!state.showSkeleton"
      :refreshing="state.refreshing"
      :loading="state.loading"
      :finished="state.finished"
      :finishedText="finishedText"
      :isFinished="!isShowListEmptyStatus"
      @onLoad="onLoad"
      @refresh="onRefresh"
    >
      <view v-if="isShowListEmptyStatus" class="print-management-list__empty-warp">
        <Empty class="print-management-list__empty-ctx" :key="state.keyword" :keyword="state.keyword" />
      </view>
      <template v-else>
        <view v-for="item in state.list" :key="item.waybillNumber" class="item">
          <view class="left-connect">
            <view class="title">{{ item.waybillNumber }}</view>
            <view class="describe" v-if="item.operationCount">{{ itemCount(item.operationCount) }}</view>
          </view>
          <KyButton class="right-btn" plain text="重新打单" @click="goPintFaceSheet(item.waybillNumber)" />
        </view>
      </template>
    </ListRefreshLoad>
    <view class="print-management-calendar">
      <ky-calendar
        class="calendar calendar-box"
        v-model:show="showCalendar"
        type="range"
        :startDate="startDate"
        :endDate="endDate"
        :default-date="defaultDate"
        :popupable="true"
        :is-auto-back-fill="false"
        :safeAreaInsetBottom="true"
        :hideOptions="true"
        :allowSameDay="true"
        :options="timeOptions"
        @confirm="onConfirmDate"
      >
        <!-- <template #footer>
        <view class="footer-tip">*仅支持查询7天内运单打单记录</view>
      </template> -->
        <template #footer-tips>
          <view class="footer-tips-text">*仅支持查询7天内运单打单记录</view>
        </template>
      </ky-calendar>
    </view>

    <view v-if="state.inputFocusShow">
      <SearchPopup :show="true" :noPadding="true" @onClose="onClose" @onClear="onClear" @onConfirm="onConfirm" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { isWxMiniApp } from '@/public/utils'
import KySearch from '@order-public-sub-public/components/base/ky-search/index.vue'
// import { debounce } from 'lodash-es'
import dayjs from 'dayjs'
import KyCalendarRange from '@order-public-sub-public/components/base/ky-calendar-range/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// import KyInput from '@order-public-sub-public/components/base/ky-input'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// import CalendarRange from '@order-public-sub-public/components/ui/calendar-range/index.vue'
import SearchPopup from './components/search-popup/index.vue'
import Empty from './components/empty/index.vue'
import Skeleton from './components/skeleton/index.vue'
import { getPrintRecordsList, getPrintTraceToken } from '@order-public-sub-public/apis/print'
import { printRecordsData } from '@order-public-sub-public/apis/print/types'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { isWechat } from '@order-public-sub-public/utils/device'
import { openURL } from '@/modules/webview/utils'
import { getBaseUrl } from '@order-public-sub-public/utils/env'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { stopPullDownRefresh, useDidShow } from '@tarojs/taro'
import { debounce } from '@order-public-sub-public/utils'

const router = useRouter()
defineOptions({
  name: 'print-records',
})
interface printRecords {
  showPopup: boolean // 弹窗
  showSkeleton: boolean // 是否显示骨架屏
  searchLoading: boolean // 搜索加载
  keyword: string // 搜索关键词
  refreshing: boolean
  loading: boolean
  finished: boolean
  list: printRecordsData[]
  page: number
  pageSize: number
  pageTotal: number
  longitude?: number | string
  latitude?: number | string
  activeItem?: number | string
  addressId?: number | string
  inputFocusShow?: boolean
  startTime: number | string
  endTime: number | string
}
const state = reactive<printRecords>({
  showPopup: false, // 弹窗
  showSkeleton: false, // 是否显示骨架屏
  searchLoading: false, // 搜索加载
  activeItem: 0, // 选中id
  keyword: '', // 搜索关键词
  refreshing: false,
  loading: false,
  finished: false,
  list: [],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
  longitude: '',
  latitude: '',
  inputFocusShow: false,
  startTime: '',
  endTime: '',
})
const submitDisabled = computed(() => !state.startTime || !state.endTime)
const itemCount = (count: number) => {
  if (count > 99) {
    return `已打印99+次`
  } else {
    return `已打印${count}次`
  }
}

const isShowListEmptyStatus = computed(() => !listLength.value && !state.showSkeleton && !state.searchLoading)

const onClose = () => {
  state.inputFocusShow = false
}
// 默认近7天的数据
const toDay = new Date()
toDay.setDate(toDay.getDate() - 6)
const endDate = new Date()
const startDate = toDay
const defaultDate = ref([startDate, endDate])
const showCalendar = ref(false)
const onScreen = () => {
  if (state.startTime && state.endTime) {
    defaultDate.value = [new Date(state.startTime), new Date(state.endTime)]
  } else {
    defaultDate.value = [startDate, endDate]
  }
  showCalendar.value = true
}

const onConfirm = (value: string) => {
  setKeyWord(value)
  setTime('', '')
  state.inputFocusShow = false
  getData()
}

const onConfirmDate = (date: any) => {
  const [startDate, endDate] = date
  setTime(dayjs(startDate).format('YYYY/MM/DD'), dayjs(endDate).format('YYYY/MM/DD'))
  onCloseDate()
  setKeyWord('')
  getData()
}
const onCloseDate = () => {
  showCalendar.value = false
}

const onClear = () => {
  setKeyWord('')
}
const setKeyWord = (value: string) => {
  state.keyword = value
}
const onSearchClear = () => {
  setKeyWord('')
  setTime('', '')
  getData()
}
const getData = () => {
  state.page = 0
  state.showSkeleton = true
  onLoad(true)
}
const listLength = computed(() => state.list?.length || 0)
// 没有更多了文案
const finishedText = computed(() => (listLength.value > 20 ? '没有更多了' : ''))
/**
 * 下拉刷新
 * @param isRefresh 判断是刷新还是加载更多
 */
const onLoad = async (isRefresh: boolean) => {
  state.page += 1
  state.loading = !state.refreshing && !isRefresh

  const params = {
    waybillNumbers: state.keyword ? [state.keyword] : [],
    page: state.page,
    pageSize: state.pageSize,
    startTime: state.startTime ? dayjs(state.startTime).valueOf() : '',
    endTime: state.endTime ? dayjs(`${dayjs(state.endTime).format('YYYY-MM-DD')} 23:59:59`).valueOf() : '', // 拼接时分秒
    clientType: '20',
    clientSearchType: '10',
  }

  try {
    const { data } = await getPrintRecordsList(params)
    if (state.refreshing) {
      state.list = []
      state.refreshing = false
    }

    state.list = state.page === 1 ? data?.rows : [...state.list, ...data?.rows]
    state.refreshing = false
    state.pageTotal = data.pageTotal
    state.finished = state.page >= state.pageTotal
  } catch (error) {
    state.page -= 1
    state.refreshing = false
    state.finished = true
  } finally {
    state.loading = false
    state.searchLoading = false
    state.showSkeleton = false
    stopPullDownRefresh()
  }
}

/**
 * 上拉加载
 */
const onRefresh = () => {
  state.page = 0
  state.refreshing = true
  onLoad(false)
}

/**
 * @description 跳转打印面单
 */
const goPintFaceSheet = debounce(async (waybillNumber: string) => {
  showLoadingToast({ message: '加载中', forbidClick: true })
  try {
    // const isOpen = await printCheckBluetooth()
    // if (!isOpen) {
    //   return
    // }
    const res = await getPrintTraceToken({
      clientType: '20',
      waybillNumberList: [waybillNumber],
    })
    if (!res || !res.data) {
      return
    }
    router.push({
      path: '/print',
      query: {
        printTraceId: res.data,
        waybillNumber: waybillNumber,
      },
    })
    // app 从打印记录跳转到打印面单 点返回需回到打印记录，需要使用router.push, 小程序直接跳转openWebview
    // if (isWechat) {
    //   closeToast()
    //   const url = `${getBaseUrl(false)}#/print?printTraceId=${res.data}&waybillNumber=${waybillNumber}`
    //   openURL(url, { needLogin: true, blueMethod: 'getBluetoothDevice' })
    // } else {
    //
    // }
  } catch (e) {
    console.log('aaaa', e)
  } finally {
    closeToast()
  }
}, 300)
const setTime = (start: number | string, end: number | string) => {
  state.startTime = start
  state.endTime = end
}

const initData = () => {
  state.showSkeleton = true
  state.inputFocusShow = false
  onRefresh()
}

function getDateRange(days) {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days + 1)

  return [startDate.getTime(), endDate.getTime()]
}

const timeOptions = [
  { label: '近7天', value: getDateRange(7), key: 'last7' },
  { label: '近30天', value: getDateRange(30), key: 'last30' },
  { label: '近60天', value: getDateRange(60), key: 'last60' },
  { label: '近180天', value: getDateRange(180), key: 'last180' },
  { label: '近1年', value: getDateRange(366), key: 'last365' },
]

useDidShow(() => {
  initData()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';

.calendar {
  .ky-popup-body {
    height: 60vh !important;
  }
}
</style>
