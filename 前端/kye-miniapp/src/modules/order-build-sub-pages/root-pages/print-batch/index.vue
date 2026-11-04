<template>
  <div class="print-batch">
    <div class="print-batch-tab">
      <SearchTab
        :showScrollBar="isDesktopMiniprogramFlag"
        :tab="tab"
        :activeId="SearchTabActiveId"
        @selectTab="handleSelectTab"
      />
      <div class="print-batch-tab-screen" :class="{ 'screen-active': showOverlay }" @click="handleToFilter">
        <SvgIcon v-if="!showOverlay" class="screen-icon" name="screen-icon" />
        <SvgIcon v-else class="screen-icon-light" name="screen-icon-light" />
        <span>筛选</span>
      </div>
    </div>

    <div class="print-batch-quick-tab-wrap">
      <span class="label">快速筛选:</span>
      <template v-for="item in quickPrintTabArr" :key="item.id">
        <span
          @click="() => changeQuickTab(item)"
          class="print-batch-quick-tab-item"
          :class="{ 'print-batch-quick-tab-item-active': item.id === printTabActiveId }"
          >{{ item.name }}</span
        >
      </template>
    </div>

    <div class="print-batch-selected" v-if="selectedList.length">
      <span class="label">已选：</span>
      <div
        class="print-batch-selected__list"
        :class="`print-batch-selected__list ${isDesktopMiniprogramFlag ? 'print-batch-selected-scroll-bar' : ''}`"
      >
        <div
          class="item"
          :class="[!['creationStartDate', 'waybillCustomerSource'].includes(item.key) && 'selected-ellipsis']"
          v-for="item in selectedList"
          :key="item"
        >
          {{ item.value }}
        </div>
      </div>
    </div>

    <div class="loading" v-if="state.initLoading">
      <img src="https://ic-img.ky-express.com/netc/20250619_81944_!!1750300622497_400_200.png" alt="" />
    </div>

    <div class="print-batch-list" v-else>
      <div class="switch-loading loading" v-if="state.switchLoading">
        <img src="https://ic-img.ky-express.com/netc/20250619_81944_!!1750300622497_400_200.png" alt="" />
        <div>努力加载中...</div>
      </div>
      <ListRefreshLoad
        v-if="!state.switchLoading"
        :refreshing="state.refreshing"
        :loading="state.loading"
        :finished="state.finished"
        :finishedText="finishedText"
        @onLoad="onLoad"
        @onRefresh="onRefresh"
      >
        <kyEmpty
          :type="EmptyTypeEnum.CUSTOM"
          :custom-config="{
            description: state.keyword,
            image: 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png',
          }"
          v-if="!state.list.length && !state.loading"
          :keyword="state.keyword"
        />
        <SearchCard
          v-for="item in state.list"
          :key="item.waybillNumber"
          :item="item"
          :searchTabActiveId="SearchTabActiveId"
        >
          <template #icon>
            <div @click="triggerCheck(item)">
              <SvgIcon name="check-icon" v-if="showIcon(item)" />
              <SvgIcon name="no-check-icon" v-else />
            </div>
          </template>
        </SearchCard>
      </ListRefreshLoad>
    </div>
    <div class="print-batch-footer" v-if="state.list.length">
      <SearchFooter
        :checkState="checkState"
        :loading="printLoading"
        :checkedLength="isCheckedCardList.length"
        :isCheckAll="isCheckAll"
        @selectHandler="selectHandler"
        @toPrint="toPrint"
      />
    </div>
    <!-- 筛选弹窗 -->
    <!-- 这个筛选弹窗不使用了， 已经换成页面， https://zentao.ky-tech.com.cn/story-view-406521.html -->
    <!-- <SearchOverlay
      :screenData="screenData"
      :departmentFilterNameList="state.departmentFilterNameList"
      :oneYearWaybillPermission="oneYearWaybillPermission"
      :boundCustomCode="boundCustomCode"
      @screenParams="screenParams"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, onBeforeUnmount } from 'vue'
import SearchTab from './components/search-tab/index.vue'
import SearchCard from './components/search-card/index.vue'
import SearchFooter from './components/search-footer/index.vue'
// import SearchOverlay from './components/search-overlay/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import kyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'

import { EmptyTypeEnum } from '@order-public-sub-public/constants'

import { showOverlay } from '@order-public-sub-root-pages/print-batch/hooks/useData'
import {
  ListReactiveType,
  screenDataType,
  screenOtherDataType,
} from '@order-public-sub-root-pages/print-batch/hooks/type'

import { cloneDeep } from 'lodash-es'
import { getBaseUrl } from '@order-public-sub-public/utils/env'
import { openURL } from '@/modules/webview/utils'
import {
  defaultDateRange,
  roleArr,
  printStatusArr,
  quickPrintTabArr,
} from '@order-public-sub-root-pages/print-batch/constants'

import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { localStorage } from '@order-public-sub-public/utils/storage'

import {
  waybillSearchWeb,
  waybillSearchStatistics,
  getUserInfoByPhoneNew,
  getPermission,
  getDepartmentFilterName,
  createPrintingWaybillQueue,
  getPrintTraceToken,
} from '@order-public-sub-public/apis/print'

import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'

import dayjs from 'dayjs'
import DBFactory from '@order-public-sub-public/utils/db/dbFactory'

import { useRoute } from '@order-public-sub-public/vue-router/index'
// import { useRouter } from '@order-public-sub-public/vue-router/index'

const route = useRoute()
// const router = useRouter()

let tab = ref([
  { name: '待通知取货', id: 10, count: 0 },
  { name: '待揽件', id: 20, count: 0 },
  { name: '待签收', id: 30, count: 0 },
  { name: '已签收', id: 40, count: 0 },
  { name: '全部', id: 50, count: 0 },
])

const finishedText = ref('')
const checkState = ref(false) // 全选开关

const state = reactive<ListReactiveType>({
  refreshing: false,
  switchLoading: false,
  initLoading: false,
  loading: false,
  finished: false,
  list: [],
  keyword: '暂无数据',
  page: 0,
  pageSize: 20,
  pageTotal: 0,
  departmentFilterNameList: [], // 获取收、寄件人部门placeholder type
})

const initTime = dayjs().subtract(defaultDateRange, 'day')
const screenData = ref<screenDataType>({
  waybillCustomerSource: 10,
  creationStartDate: initTime.format('YYYY/MM/DD'),
  creationEndDate: dayjs().format('YYYY/MM/DD'),
  printStatus: 20,
  pickupPerson: '',
  pickupMobile: '',
  pickupCustomerName: '',
  pickupAddress: '',
  pickupCity: '',
  pickupDepartmentId: {
    name: '',
    id: -1,
  },
  deliveryPerson: '',
  deliveryMobile: '',
  deliveryCustomerName: '',
  deliveryDepartmentId: {
    name: '',
    id: -1,
  },
  deliveryAddress: '',
  deliveryCity: '',
  orderMobile: '',
  orderDepartmentId: {
    name: '',
    id: -1,
  },
  goodsType: '',
  customValue: {
    name: '',
    id: -1,
  },
})

// 查询条件-tab
const SearchTabActiveId = ref(20)

// 打印状态-tab
const printTabActiveId = ref(20)

const isCheckedCardList = ref<string[]>([])

// 一年运单权限
const oneYearWaybillPermission = ref(false)

// 是否绑码
const boundCustomCode = ref(false)

// 定义数量统计入参
const getParams = () => {
  const generalQuery: screenOtherDataType = cloneDeep(screenData.value)
  generalQuery.creationStartDate = dayjs(generalQuery.creationStartDate).format('YYYY-MM-DD') + ' 00:00:00'
  generalQuery.creationEndDate = dayjs(generalQuery.creationEndDate).format('YYYY-MM-DD') + ' 23:59:59'
  generalQuery.printStatus = printTabActiveId.value
  delete generalQuery.waybillCustomerSource
  // generalQuery.creationRecentDays = '60'

  if (generalQuery.deliveryDepartmentId?.id < 0) {
    generalQuery.deliveryDepartmentId = undefined
  } else {
    generalQuery.deliveryDepartmentId = [generalQuery.deliveryDepartmentId.id]
  }
  if (generalQuery.pickupDepartmentId?.id < 0) {
    generalQuery.pickupDepartmentId = undefined
  } else {
    generalQuery.pickupDepartmentId = [generalQuery.pickupDepartmentId.id]
  }
  if (generalQuery.orderDepartmentId?.id < 0) {
    generalQuery.orderDepartmentId = undefined
  } else {
    generalQuery.orderDepartmentId = [generalQuery.orderDepartmentId.id]
  }
  if (generalQuery.customValue?.id < 0) {
    generalQuery.customerWaybillNumber = undefined
    delete generalQuery.customValue
  } else {
    generalQuery.customerWaybillNumber = generalQuery.customValue?.name
    delete generalQuery.customValue
  }

  let waybillStatus = [SearchTabActiveId.value]
  if (SearchTabActiveId.value === 50) {
    waybillStatus = [10, 20, 30, 40]
  }
  console.log(screenData, 'screenData')

  let waybillCustomerSource = [screenData.value.waybillCustomerSource + '']
  if (screenData.value.waybillCustomerSource === 50) {
    waybillCustomerSource = ['10', '20', '30']
  }
  return {
    page: 1,
    pageSize: 10,
    queryMode: 10, // 查询方式 10：筛选 20：搜索 30：默认查询，不使用通用查询与小查询
    // smallQuery,
    mobileType: 30, // 移动端列表类型  10 查件列表    20 待通知司机取货列表     30 批量打印列表
    // {
    //   conditionInput: [''],
    //   conditionType: 30, // 搜索类型：10-运单号 20-订单号 30-手机号 40-自定义编码、30-其他（用户手动输入，都可默认为该类型）
    // },

    waybillCustomerSource, // 角色 10寄件的 20收件的 30付款公司
    waybillStatus, // 10 待通知取货 20 待揽件 30 待签收 40 已签收 50 已取消
    clientType: 80, // 10 客户端 20 移动端
    generalQuery, // 筛选参数
  }
}

const isDesktopMiniprogramFlag = isDesktopMiniprogram()

onMounted(() => {
  // 列表加载
  state.initLoading = true
  onLoad(true)
  // 获取tab数量
  getCount()
  // 查询是否绑码
  getUserInfoByPhoneNewFn()
  // 一年运单权限查询
  getPermissionFn()
  // 获取收、寄件人部门placeholder
  getDepartmentFilterNameFn()

  if (isDesktopMiniprogram()) {
    // 兼容pc小程序
    window.addEventListener('storage', deskTopMiniProgramFilter)
  } else {
    document.addEventListener('visibilitychange', mobileFilter)
  }
  const PrintBatchFilterDB = new DBFactory('order-config-100', 'print-batch-filter')
  PrintBatchFilterDB.removeItem('print_batch_filter_params')
  PrintBatchFilterDB.removeItem('sync_print_batch_params')
})

onBeforeUnmount(() => {
  if (isDesktopMiniprogram()) {
    window.removeEventListener('storage', deskTopMiniProgramFilter)
  } else {
    document.removeEventListener('visibilitychange', mobileFilter)
  }
})

const deskTopMiniProgramFilter = () => {
  const listener = JSON.parse(localStorage?.getItem('print_batch_filter_listener') || '{}')
  if (listener?.search) {
    screenParams()
  }
  localStorage?.setItem('print_batch_filter_listener', JSON.stringify({ search: false }))
}

const mobileFilter = () => {
  if (document.visibilityState === 'visible') {
    screenParams()
  }
}

const handleSelectTab = (id: number) => {
  if (SearchTabActiveId.value !== id) {
    SearchTabActiveId.value = id
    isCheckedCardList.value = []
    checkState.value = false
    console.log(id, 'ididid')
    // showOverlay.value = false
    state.list = []
    state.page = 0
    state.switchLoading = true
    onLoad(false)
    getCount()
  }
}

const changeQuickTab = (item: { id: number; name: string }) => {
  const { id, name } = item
  if (printTabActiveId.value !== id) {
    printTabActiveId.value = id
    isCheckedCardList.value = []
    checkState.value = false
    console.log(id, 'ididid')
    state.list = []
    state.page = 0
    state.switchLoading = true
    onLoad(false)
    getCount()
  }
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_Batch _printing_printstatus_button_v1',
    },
    {
      print_status: name,
    },
  )
}

const onLoad = (isRefresh: boolean) => {
  state.page += 1
  state.loading = !state.refreshing && !isRefresh
  console.log(state.loading, 'state.loading')

  const requestParams = {
    ...getParams(),
    page: state.page,
  }
  waybillSearchWeb(requestParams)
    .then((res) => {
      const { data } = res

      if (state.refreshing) {
        state.list = []
        state.refreshing = false
      }

      let isAllChecked = false
      if (state.list.length === isCheckedCardList.value.length) {
        isAllChecked = true
      }

      state.list = state.page === 1 ? data?.rows : [...state.list, ...data?.rows]
      state.refreshing = false
      state.pageTotal = data.pageTotal
      state.finished = state.page >= state.pageTotal

      // 如果选择了全选 需要将卡片选中
      if (isAllChecked) {
        checkAll(checkState.value)
      }
    })
    .catch(() => {
      state.page -= 1
      state.refreshing = false
      state.finished = true
    })
    .finally(() => {
      state.loading = false
      state.switchLoading = false
      state.initLoading = false
    })
}
const onRefresh = () => {
  state.page = 0
  state.refreshing = true
  checkState.value = false
  isCheckedCardList.value = []
  getCount()
  // 列表加载
  onLoad(true)
}

const getCount = () => {
  const params = {
    ...getParams(),
    waybillStatus: [10, 20, 30, 40],
  }
  waybillSearchStatistics(params).then((res) => {
    const { data } = res
    tab.value = [
      { name: '待通知取货', id: 10, count: data.stayInformedCount },
      { name: '待揽件', id: 20, count: data.stayTookCount },
      { name: '待签收', id: 30, count: data.staySignCount },
      { name: '已签收', id: 40, count: data.signCount },
      { name: '全部', id: 50, count: data.allCount },
    ]
  })
}

const getUserInfoByPhoneNewFn = () => {
  getUserInfoByPhoneNew({ from: 6 }).then((res) => {
    console.log('1', res)
    const { customCode } = res?.data || {}
    boundCustomCode.value = !!customCode
  })
}

const getPermissionFn = () => {
  getPermission({}).then((res) => {
    if (Array.isArray(res.data)) {
      oneYearWaybillPermission.value = res.data.map((i) => i.code).includes('oneYearWaybill')
    }
  })
}

const getDepartmentFilterNameFn = () => {
  getDepartmentFilterName({}).then((res) => {
    const { data } = res
    state.departmentFilterNameList = data
  })
}

const selectHandler = (v: boolean) => {
  checkState.value = v
  checkAll(v)

  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_Batch _printing_checkall_button_v1',
    },
    {
      tab_name: tab.value.find((i) => i.id === SearchTabActiveId.value)?.name,
    },
  )
}

// 全选、取消全选
const checkAll = (v: boolean) => {
  if (v) {
    state.list.forEach((i) => {
      if (!isCheckedCardList.value.includes(i.waybillNumber)) {
        isCheckedCardList.value.push(i.waybillNumber)
      }
    })
  } else {
    isCheckedCardList.value = []
  }
}

const isCheckAll = computed(() => {
  return !!(state.list.length === isCheckedCardList.value.length && state.list.length)
})

// 卡片选择icon显示隐藏
const showIcon = (item: any) => {
  return isCheckedCardList.value.includes(item.waybillNumber as string)
}

// 卡片选择开关事件
const triggerCheck = (item: any) => {
  if (showIcon(item)) {
    isCheckedCardList.value = isCheckedCardList.value.filter((i) => i !== item.waybillNumber)
  } else {
    isCheckedCardList.value.push(item.waybillNumber)
  }

  checkState.value = !!isCheckedCardList.value.length
}

// 已选条件
const selectedList = computed(() => {
  const dataMap = {
    waybillCustomerSource: '角色',
    creationStartDate: '寄件时间',
    // 打印状态放出来了， 不需要在已选里面展示了
    // printStatus: '打印状态',
    pickupPerson: '收件人',
    pickupMobile: '收件人手机号',
    pickupCustomerName: '收件公司',
    pickupDepartmentId: '收件人部门',
    pickupCity: '收件城市',
    pickupAddress: '收件地址',
    deliveryPerson: '寄件人',
    deliveryMobile: '寄件人手机号',
    deliveryCustomerName: '寄件公司',
    deliveryDepartmentId: '寄件人部门',
    deliveryCity: '寄件城市',
    deliveryAddress: '寄件地址',
    orderMobile: '下单人手机号',
    orderDepartmentId: '下单人部门',
    goodsType: '托寄物',
    customValue: '自定义编码',
  } as Record<string, any>

  const params = screenData.value as Record<string, any>

  const associateList = ['pickupDepartmentId', 'deliveryDepartmentId', 'orderDepartmentId', 'customValue']
  let list: any = []
  Object.keys(dataMap).forEach((i) => {
    console.log(params[i], 'screenData.value[i]', dataMap[i])
    if (i === 'waybillCustomerSource') {
      const value = roleArr.find((j) => j.id === params[i])?.name
      list.push({ key: i, value })
    } else if (i === 'creationStartDate') {
      const creationStartDate = params.creationStartDate
      const creationEndDate = params.creationEndDate
      if (creationStartDate && creationEndDate) {
        const value =
          creationStartDate === creationEndDate
            ? `寄件日期(${creationStartDate})`
            : `寄件日期(${creationStartDate}-${creationEndDate})`
        list.push({ key: i, value })
      }
    } else if (i === 'printStatus') {
      const value = printStatusArr.find((j) => j.id === params[i])?.name
      list.push({ key: i, value })
    } else if (associateList.includes(i)) {
      if (params[i]?.id > 0) {
        const value = `${dataMap[i]}(${params[i].name})`
        list.push({ key: i, value })
      }
    } else {
      if (params[i]) {
        const value = `${dataMap[i]}(${params[i]})`
        list.push({ key: i, value })
      }
    }
  })
  return list.filter((item: any) => item.value && item.value !== '全部')
})

// 筛选确定回调
const screenParams = async () => {
  const PrintBatchFilterDB = new DBFactory('order-config-100', 'print-batch-filter')
  const printBatchFilterParams = await PrintBatchFilterDB.getItem('print_batch_filter_params')
  const syncPrintBatchParams = await PrintBatchFilterDB.getItem('sync_print_batch_params')
  if (!printBatchFilterParams) {
    return
  }
  const { isOperation, ...rest } = printBatchFilterParams
  if (!isOperation) {
    return
  }
  screenData.value = rest
  printTabActiveId.value = syncPrintBatchParams?.printStatus || 20
  state.list = []
  state.page = 0
  state.initLoading = true
  isCheckedCardList.value = []
  checkState.value = false
  getCount()
  // await PrintBatchFilterDB.removeItem('print_batch_filter_params')
  // await PrintBatchFilterDB.removeItem('sync_print_batch_params')
  await PrintBatchFilterDB.removeItem('print_batch_filter_options')
  onLoad(true)
}

const createPrintingWaybillQueueFn = () => {
  return new Promise((resolve, reject) => {
    createPrintingWaybillQueue({ waybillNumbers: isCheckedCardList.value })
      .then((res) => {
        resolve(res.data.queueId)
      })
      .catch(() => {
        reject()
      })
  })
}

const printLoading = ref(false)

// 跳转去打印页面
const toPrint = async () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_Batch _printing_pringbutton_v1',
    },
    {
      tab_name: tab.value.find((i) => i.id === SearchTabActiveId.value)?.name,
    },
  )
  if (!isCheckedCardList.value.length) {
    return showToast('请勾选运单')
  }
  printLoading.value = true
  try {
    const res = await getPrintTraceToken({
      clientType: '20',
      waybillNumberList: isCheckedCardList.value,
    })
    console.log(isCheckedCardList.value.length, 'isCheckedCardList.value.length')

    let printSource = 'batch-print'
    if (route.query?.printSource) {
      printSource = route.query.printSource as string
    }

    if (isCheckedCardList.value.length === 1) {
      // router.push({
      //   path: '/print',
      //   query: {
      //     waybillNumber: isCheckedCardList.value.join(),
      //   },
      // })
      const waybillNumberList = isCheckedCardList.value.join()
      const url = `${getBaseUrl(false)}#/print?waybillNumber=${waybillNumberList}&printTraceId=${
        res.data
      }&printSource=${printSource}`
      openURL(url, { needLogin: true, blueMethod: 'getBluetoothDevice' })
    } else {
      let queueId = (await createPrintingWaybillQueueFn()) as string

      // 判断是否批量混合多个客户编码
      const deliveryCustomerCode: any = []

      state.list.forEach((i) => {
        if (isCheckedCardList.value.includes(i.waybillNumber)) {
          if (!deliveryCustomerCode.includes(i.deliveryCustomerCode)) {
            deliveryCustomerCode.push(i.deliveryCustomerCode)
          }
        }
      })

      // 批量混合多个客户编码多个面单类型，不显示件数
      const showNumber = deliveryCustomerCode.length === 1 ? 'show' : 'hidden'
      console.log(showNumber, 'showNumber')
      const baseUrl = getBaseUrl(false)
      const url = `${baseUrl}#/print?type=print-batch&showNumber=${showNumber}&queueId=${queueId}&printTraceId=${res.data}&printSource=${printSource}`
      openURL(url, { needLogin: true, blueMethod: 'getBluetoothDevice' })
    }
  } finally {
    printLoading.value = false
  }
}

const handleToFilter = async () => {
  const PrintBatchFilterDB = new DBFactory('order-config-100', 'print-batch-filter')
  // showOverlay.value = !showOverlay.value
  const baseUrl = getBaseUrl(false)
  const url = `${baseUrl}#/print-batch-filter`
  await PrintBatchFilterDB?.setItem(
    'sync_print_batch_params',
    cloneDeep({
      printStatus: printTabActiveId.value,
    }),
  )
  await PrintBatchFilterDB?.setItem(
    'print_batch_filter_options',
    cloneDeep({
      departmentFilterNameList: state.departmentFilterNameList,
      oneYearWaybillPermission: oneYearWaybillPermission.value,
      boundCustomCode: boundCustomCode.value,
    }),
  )
  openURL(url, { needLogin: true })
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
