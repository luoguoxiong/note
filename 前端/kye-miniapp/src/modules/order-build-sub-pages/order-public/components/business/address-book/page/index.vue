<template>
  <view class="dialog_root_address_book_list addr-l" @click="handleOutClick">
    <!-- 未登录异常状态展示 -->
    <KyEmpty v-if="!isTokenAlive" :type="EmptyTypeEnum.CUSTOM" :custom-config="customConfig">
      <KyButton @click="handleUnLoginHandler(true)" size="small" class="login-btn" text="登录"></KyButton>
    </KyEmpty>
    <view class="addr-b-p" v-if="isTokenAlive">
      <!-- <ky-navbar v-if="isWxMiniApp" :leftArrow="true" :title="getTitle()"></ky-navbar> -->

      <view class="addr-b-p__container">
        <ky-tab
          :modelValue="state.active"
          color="#8365F6"
          title-inactive-color="#55596C"
          title-active-color="#8365F6"
          @update:modelValue="changeTabs"
          :tabs="tabs"
          :no-animation="true"
        >
        </ky-tab>
        <!-- 搜索 -->
        <Search
          ref="searchRef"
          v-model:keyword="state.keyword"
          :shareAddressAuth="shareAddressAuth"
          :addressType="addressType"
          @update:keyword="onSearch"
          v-if="showSearch"
        />
        <!-- 副Tab选择 -->
        <SubTab
          v-if="visibleComp"
          :value="state.shareAddressPermission"
          @update:value="onChangeTab"
          :list="addressLabelList"
          @add-label="addOrEditLabel"
          :class="{ 'pd-top-16': !showSearch }"
        />

        <!-- 缺省页 -->
        <template v-if="!listLength && !state.showSkeleton && !state.switchLoading">
          <Empty
            v-if="
              !state.keyword ||
              state.errorText === '当前无网络，请检查后重试' ||
              state.errorText === '您的请求太过频繁,请稍后重试！'
            "
            :errorText="state.errorText || '暂无地址信息'"
            @onReLoad="onReLoad"
          />
          <div v-else class="n-s-r-t">
            <span> 未找到“ </span>
            <span class="key-word">{{ state.keyword }}</span>
            <span>”得相关结果</span>
          </div>
        </template>

        <!-- 加载中 -->
        <div class="address-book-loading-box width-100 mt-48" v-if="state.switchLoading">
          <ky-loading>{{ loadingText }}</ky-loading>
        </div>

        <!-- 列表 loading当finished的时候会消失 -->
        <div v-if="!state.showSkeleton && listLength > 0" class="tab-wrap">
          <ListRefreshLoad
            :refreshing="state.refreshing"
            :loading="true"
            :finished="state.finished"
            :finishedText="finishedText"
            @onLoad="onLoad"
            @refresh="onRefresh"
            ref="listLoadRef"
            @handleScroll="handleScroll"
          >
            <ky-swipe-group lock>
              <List
                v-for="(item, index) in state.list"
                :key="item.id"
                :item="item"
                :batchSelectList="batchSelectList"
                :keyword="state.keyword"
                :shareAddressAuth="shareAddressAuth"
                :showManage="state.showManage"
                :justAddedFlagId="justAddedFlagId"
                :showSaveAddressBookBtn="showSaveAddressBookBtn"
                :batchCanSelect="state.batchCanSelect"
                :addressType="addressType"
                :isOperationLabel="isOperationLabel"
                :shareAddressPermission="state.shareAddressPermission"
                :disabledSelectItem="isInitAddressFlag && !isFromFreightTime"
                @onSelectItem="onSelectItem(item)"
                @onSelectRadio="onSelectRadio(index)"
                @onDefault="onDefault(index)"
                @onDelete="onDelete([item.id])"
                @onEdit="onEdit(item)"
                @touchstart.passive="onTouchstart"
              />
            </ky-swipe-group>
          </ListRefreshLoad>
        </div>
      </view>

      <!-- 底部 -->
      <view v-if="showFooter" class="addr-b-p__footer" id="isElementShow" catchMove>
        <Footer
          :shareAddressPermission="state.shareAddressPermission"
          catchMove
          ref="footerRef"
          :disabled="isSelect && state.showManage"
          :listLength="listLength"
          :showBtnOne="state.showBtnOne"
          :showManage="state.showManage"
          :batchSender="false"
          :batchSelectList="batchSelectList"
          :selectItemLength="showSelectItemNumber"
          :selectAll="selectAll"
          :addressType="addressType"
          :isOperationLabel="isOperationLabel"
          @setOperationType="setOperationType"
          @onManage="onManage"
          @batchConfirm="batchConfirm"
          @onAddOrDeleteAll="onAddOrDeleteAll"
          @selectAllRadio="onSelectAllRadio"
          @toClearAddr="toShowClearAddrPop"
          @clickOut="handleOutClick"
          :isShowClearAddrBar="
            clearAddrInfo.hasCleanAddressAuth === EAddressPermission.有权限 &&
            state.shareAddressPermission !== EAddressPermissionTab.共享地址
          "
        />
      </view>
    </view>
    <ClearAddrPopup
      v-if="visibleComp"
      v-model:visible="isShowClearAddrPop"
      v-model:cleanAddressType="cleanAddressType"
      :addressInfoList="clearAddrInfo.addressInfoList"
      :addressShowType="state.shareAddressPermission || EAddressPermissionTab.全部地址"
      :addressType="addressType"
      :authFlag="clearAddrInfo.authFlag"
      @toJumpClearAddrList="toJumpClearAddrList"
      @toClearAddr="toClearAddr"
    />
    <EditAddressLabel
      v-if="visibleComp"
      ref="editAddressLabelRef"
      :list="addressLabelList"
      @delete="delLabel"
      @add="addLabel"
      @update="updateLabel"
      @add-address-to-address-label="addAddressToAddressLabelAjax"
      :recognition-type="recognitionTypeTitle"
    />
    <AddAddressLabel
      v-if="visibleComp"
      ref="addAddressLabelRef"
      @save="saveLabel"
      @edit="editLabel"
      :recognition-type="recognitionTypeTitle"
    />
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch, nextTick, onBeforeMount } from 'vue'
import '@order-public-sub-public/validate/effect/effectBubble'
/* eslint-disable max-lines */
import Taro, { useDidShow, useDidHide, useLoad, useUnload, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { clickOneCleanRequestReport } from '../report'
import {
  clk_express_book_address_tab_v1,
  clk_express_single_send_address_book_label_v1,
  other_express_single_address_book_select_v1,
  other_express_single_address_book_v1,
  recognition_type_init,
  reportTabShow,
} from './report/index'
import { closeToast, showLoadingToast, showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { debounce } from 'lodash-es'
import { useRouter } from '@order-public-sub-public/vue-router/index'

// 组件
import Footer from '../components/footer/index.vue'
import Search from '../components/search/index.vue'
import List from '../components/list/index.vue'
import Empty from '../components/empty/index.vue'
import SubTab from '../components/tab/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import ClearAddrPopup from '../components/clear-addr-popup/index.vue'

// 方法
import {
  getAddressBookList,
  switchDefaultAddress,
  batchDeleteAddress,
  getIsCanClearAddr,
  cleanAddressConfirm,
  getCleanResult,
  navigationbarQuery,
  addressLabelSave,
  addressLabelDelete,
  addressLabelUpdate,
  addAddressToAddressLabel,
  getAddressResultByTaskNo,
} from '@order-public-sub-public/apis/address'
import { $native, getValueOrEmpty, filterFiledSpace } from '@order-public-sub-public/utils'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { telephoneFn, getEditableFields } from './hooks/useCommon'
import { routerBackIsHidePop } from '@public/hooks/order'
import { scrollTop, setSelectStatus, checkSameAddress, toastSameAddress } from './hooks/utils'

// 类型
import { Address } from '@order-public-sub-public/constants/address'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { MaxClearAddrNum } from '../constants'
import {
  ListItem,
  ListReactiveType,
  detailedAddress,
  EAddressPermission,
  EAddressPermissionTab,
  tabDataType,
  AddressScene,
  CleanAddressTypeMap,
  cleanAddrType,
  RequestSource,
} from '../types'
// import { remoteBatchCheck } from '@pages/order-batch/hooks/useBatchProcess'
// import { batchLoading } from './hooks/useBatchLoading'
import { AddressBook, IsCanClearAddrResponse, AddressLabel } from '@order-public-sub-public/apis/address/types'
import { BatchOrderInfo } from '@order-public-sub-public/apis/types'
import { showRealNameGuide } from '@order-public-sub-public/components/ui/person-name-guide/hooks/useState'
import {
  addressGlobalVariable,
  isInitAddressFlag,
  isNetworkQueryAddress,
  setSelectAddressBookJumpData,
} from '@order-public-sub-public/hooks/useGlobalVariable'
import { isWxApplet } from '@order-global-package-order-sub/utils/device'
import { setAddressInfo } from '@order-public-sub-public/utils/native'
// import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { batchSelectList } from './hooks/useState'
import { reqPollingFunction } from '@order-public-sub-public/utils/index'
import { getQueryObject } from '@order-public-sub-public/utils'
// import { isWxMiniApp } from '@/public/utils'
import { useStore } from '@order-public-sub-public/store'
import {
  addressListPageScrollTopHistory,
  setAddressListDefaultScrollTop,
  addressListPageScrollTop,
} from '@pages/order-single/hooks/useScrollTop'
import { handleUnLoginHandler } from '@/public/utils/request/useLogOutTip/openLogin'
import { showDialog } from '@order-global-package-order-sub/hooks/useShowToast'

import AddAddressLabel from '../components/add-address-label/index.vue'
import EditAddressLabel from '../components/edit-address-label/index.vue'
import { commonSetPolling, commonStopPolling } from '@order-public-sub-public/hooks/usePolling'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isH5FSEnv, urlContact } from '@/public/utils'
import { globalEventBus } from '@/public/hooks/useEventBus'
const piniaStore = useStore()
defineOptions({
  name: 'address-book',
})

const SENDER = '/modules/order-build-sub-pages/order-public/components/business/address-book/sender/index'
const RECEIVE = '/modules/order-build-sub-pages/order-public/components/business/address-book/receive/index'

usePullDownRefresh(async () => {
  onRefresh()
})

const router = useRouter()

const routeQuery = getQueryObject()
const { pageSource = '' } = routeQuery || {}

const isFromFreightTime = pageSource === 'freight-time' // 来源是运费时效

// 判断路由中是否携带 缓存 机制的字段
const cacheStrategy = computed(() => {
  if (routeQuery?.cacheStrategy) {
    return +routeQuery.cacheStrategy
  }
  return null
})

const showSearch = ref(false)

const isShowClearAddrPop = ref(false)
const listLoadRef = ref()

const loadingText = ref('搜索中...')

const cleanAddressType = ref('')
const addressTypeName = computed(() => {
  let tempMap: Record<string, any> = {
    [Address.SENDER_ADDRESS_TYPE]: '寄件地址簿',
    [Address.RECEIVE_ADDRESS_TYPE]: '收件地址簿',
  }
  return tempMap[addressType.value]
})

const visible = ref(false)
onBeforeMount(() => {
  if (isH5FSEnv) {
    setTimeout(() => {
      visible.value = true
    }, 500)
  }
})

// 飞书会影响进入页面,进入的时候会闪动一下
const visibleComp = computed(() => (!isH5FSEnv ? true : visible.value))

const toClearAddr = async (data: { cleanAddressType: string }) => {
  let params = {
    cleanAddressType: CleanAddressTypeMap[data.cleanAddressType as cleanAddrType],
    addressType: addressType.value,
    addressShowType: state.shareAddressPermission || EAddressPermissionTab.全部地址,
    requestSource: RequestSource.移动端,
    ids: [],
  }
  try {
    showLoadingToast({
      title: '清理中，请等待',
      duration: 0,
    })
    let taskNo = ''
    try {
      let { data } = await cleanAddressConfirm(params)
      taskNo = data.taskNo
      clickOneCleanRequestReport(addressTypeName.value, '成功')
    } catch (error) {
      clickOneCleanRequestReport(addressTypeName.value, '失败')
      closeToast()
    }
    if (taskNo) {
      isShowClearAddrPop.value = false
      cleanAddressType.value = ''
      // 拿到taskId后需要轮询判断是否全部删除完成
      pollingCheck(taskNo)
    }
  } catch (error) {
    console.log(error)
  }
}

const refreshAddrInfo = () => {
  // 刷新地址列表接口
  resetCacheTab()
  state.showSkeleton = true
  showLoadingToast({
    title: '加载中',
    duration: 0,
    forbidClick: true,
  })
  state.showManage = false
  state.batchCanSelect = false
  state.page = 0
  state.keyword = ''
  batchSelectList.value = []
  onLoad()
}

const pollingCheck = (taskNo: string) => {
  let timer: any = null
  // 轮询请求接口
  let stop = reqPollingFunction(
    async () => getCleanResult({ taskNo }),
    (res) => {
      let { data } = res ?? {}
      // 如果加载完成了
      if (data) {
        closeToast()
        clearTimeout(timer)
        refreshAddrInfo()
        onLoadClearAddInfo()
        showToast('清理成功')
      }
      return !data
    },
    200,
  )

  // 等待20秒，20还没有请求完自动关闭弹窗
  timer = setTimeout(() => {
    stop()
    closeToast()
    refreshAddrInfo()
    onLoadClearAddInfo()
    showToast('清理成功')
  }, 20000)

  return () => {
    closeToast()
    refreshAddrInfo()
    clearTimeout(timer)
    onLoadClearAddInfo()
    stop()
  }
}

const toShowClearAddrPop = async () => {
  isShowClearAddrPop.value = true
  // 清空弹窗内的选择
  cleanAddressType.value = ''
}

const toJumpClearAddrList = (cleanAddressType: string) => {
  // routerBackIsHidePop.value = false
  isShowClearAddrPop.value = false
  // router.push({
  //   path: '/address-book-clear',
  //   query: {
  //     cleanAddressType,
  //     addressType: addressType.value,
  //     addressShowType: state.shareAddressPermission || EAddressPermissionTab.全部地址,
  //   },
  // })
  Taro.navigateTo({
    url: urlContact('/modules/order-build-sub-pages/order-public/components/business/address-book/clear-addr/index', {
      cleanAddressType,
      addressType: addressType.value,
      addressShowType: state.shareAddressPermission || EAddressPermissionTab.全部地址,
    }),
  })
}

// 共享地址簿权限
const shareAddressAuth = ref<EAddressPermission>(EAddressPermission.有权限)
const getIsShowSearchPromise = ref()
const state = reactive<ListReactiveType>({
  active: 0, // 当前tabs下标
  keyword: '', // 搜索关键词
  refreshing: false,
  finished: false,
  list: [],
  page: 0,
  pageSize: 20,
  pageTotal: 0,
  defaultValue: false,
  selectItem: false,
  showManage: false,
  showSkeleton: false, // 骨架屏
  errorText: '', // 接口异常
  errorStatus: false, // 接口异常
  switchLoading: false, // 切换或者搜索加载
  batchCanSelect: false, // 新增属性-批量寄是否可以选中
  shareAddressPermission: '10',
  shareAddressPermissionKey: '', // 权限key值
  isSubTab: false, // 副tab是否可以显示
  showBtnOne: false,
})

//缓存tab及已经获取的数据，key值为tab_副tab，会在初始化通过resetCacheTab设置全部
const tabCache: Record<string, any> = reactive({
  [`${Address.SENDER_ADDRESS_TYPE}_${EAddressPermissionTab.全部地址}`]: {
    loadend: false,
    page: 0,
    list: [],
    keyword: '',
    finished: false,
    errorText: '',
    errorStatus: false,
  },
})

const customConfig = {
  image: EMPTY_CONFIGS.network.image,
  description: '用户信息已失效，请重新登录',
}

const isTokenAlive = computed(() => piniaStore.root.getIsTokenAlive)
const batchWaybillInfoList = computed(() => piniaStore.order.batchWaybillInfoList || [])
// 订单页类型（order=去程单 / order-back=返程单），emit 地址簿确认事件时拼接为场景后缀，避免页面栈中共存页面的重复监听
const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const selectAll = ref(false)

// 收方信息入口进来，需要将tabs切换
const tabs = [
  { title: '寄件地址', label: '寄件地址' },
  { title: '收件地址', label: '收件地址' },
]

const changeTabs = (index: number) => {
  state.active = index
  reportTabShow(state.shareAddressPermission, recognitionTypeTitle.value)
  onLoadClearAddInfo()
  if (!needGetData()) {
    setTimeout(() => {
      getCacheList()
    }, 200)
    return
  }
  state.switchLoading = true
  onSearch()

  batchSelectList.value = []
  showSelectItemNumber.value = 0
}

const onSearch = debounce(
  () => {
    state.switchLoading = true
    state.list = []
    onRefresh()
  },
  300,
  {
    leading: true,
  },
)

const recognitionTypeTitle = computed(() => {
  return tabs[state.active].title === '寄件地址' ? '寄件' : '收件'
})

const onChangeTab = debounce((val: string) => {
  // bug#446628 共享地址簿批量收方场景需要显示确定按钮
  // bug#454642
  if (val === EAddressPermissionTab.共享地址) {
    state.showBtnOne = true
  } else {
    state.showBtnOne = false
  }
  state.shareAddressPermission = val
  onLoadClearAddInfo()
  reportTabShow(state.shareAddressPermission, recognitionTypeTitle.value)

  const name = addressLabelList.value.find((i) => i.labelCode === val)
  clk_express_book_address_tab_v1(name?.labelName || val, recognitionTypeTitle.value)

  if (!needGetData()) {
    setTimeout(() => {
      getCacheList()
    }, 200)
    return
  }
  onRefresh().then(() => scrollTop())
})

/**
 * 设置寄件地址
 */
const onDefault = debounce(async (index: number) => {
  if (state.list?.[index] && !state.list[index].updateFlag) {
    showToast('此地址仅支持创建人操作')
    return false
  }
  try {
    const params = {
      id: state.list[index]?.id,
      type: addressType.value,
    }
    const currentIsDefault = state.list[index]?.defaultFlag
    state.list = state.list.map((item, idx) => ({
      ...item,
      defaultFlag: idx !== index ? false : item?.defaultFlag,
    }))
    state.list[index].defaultFlag = !currentIsDefault
    await switchDefaultAddress(params)
    showToast(!currentIsDefault ? '设为默认成功' : '取消默认成功')
    // 设置默认地址的话 需要刷新清理地址信息接口
    await onLoadClearAddInfo()
    resetCacheTab()
  } catch (error) {
    console.log('设置默认地址异常', error)
  }
}, 300)

/**
 * @description 获取批量场景公共部分运单
 */
const getFilterFormData = () => {
  const storeFormData = piniaStore.order.orderState as unknown as BatchOrderInfo
  // 处理手机号空格
  return filterFiledSpace(storeFormData.commonWaybillInfo.waybillInfo)
}

const onSelectRadio = (index: number) => {
  let isAdd = true
  if (state.showManage) {
    const findIndex = batchSelectList.value.findIndex(
      (item) => item.onlyMd5UniqueId === state.list[index].onlyMd5UniqueId,
    )
    if (findIndex > -1) {
      isAdd = false
    } else {
      isAdd = true
    }
  } else {
    isAdd = !!state.list[index].isSelectItem
  }

  state.list[index].isSelectItem = !state.list[index].isSelectItem

  if (isAdd) {
    showSelectItemNumber.value += 1
    batchSelectList.value.push(state.list[index])
  } else {
    showSelectItemNumber.value -= 1
    const findIndex = batchSelectList.value.findIndex(
      (item) => item.onlyMd5UniqueId === state.list[index].onlyMd5UniqueId,
    )
    if (findIndex > -1) {
      batchSelectList.value.splice(findIndex, 1)
    }
  }
}

/**
 * @description 全选，并且新加载的数据也要选中
 * @param flag
 */
const onSelectAllRadio = (loadFlag = false) => {
  console.log('全选')
  if (!loadFlag) {
    selectAll.value = !selectAll.value
  }

  for (let i = 0; i < state.list?.length; i++) {
    let item = state.list[i]
    // 不可删除，跳过
    if (isOperationLabel.value) {
      // 标签，跳过
      if (item.addressLabelAble === true) {
        continue
      }
    } else {
      // 不可删除，跳过
      if (!item.deleteFlag) {
        continue
      }
    }
    // 当全选勾选时，只操作未选中的项
    if (selectAll.value && !item.isSelectItem) {
      onSelectRadio(i)
    } else if (!selectAll.value && item.isSelectItem) {
      // 当取消全选时，只操作已选中的项
      onSelectRadio(i)
    }
  }
}

// 处理过程中接口加载loading
watch(
  () => piniaStore.globalData.processLoading,
  (flag) => {
    if (!flag) {
      closeToast()
    }
  },
)

/**
 * @description: 兼容网点查询入参
 * @param {*} item
 * @return {*}
 */
const netWorkQueryParams = (item: ListItem) => {
  return {
    company: item.companyName,
    contact: item.person,
    contactPhone: item.mobile,
    area: item.county,
    address: item.detailAddress,
    isCollect: item.commonFlag,
    isDefault: item.defaultFlag,
    onlyMd: item.onlyMd5UniqueId,
    updatable: item.updateFlag,
    deleteAble: item.deleteFlag,
    addressType: addressType.value,
    ...item,
  }
}
/**
 * 地址簿选中确认事件统一出口
 * leading 防抖：窗口期内重复触发只执行第一次，避免连点或事件重复绑定导致事件被多次发出
 */
const emitAddressBookEvent = debounce(
  (eventName: string, payload: Record<string, any>) => {
    globalEventBus.emit(eventName, payload)
  },
  500,
  { leading: true, trailing: false },
)

/**
 * 寄方地址簿确认回调：埋点 + 返回上一页
 * 返程单场景下，去程单/返程单两方都监听了确认事件，校验回调会执行多次，
 * 回退收敛到此处并用标记保证只执行一次；有参数为失败埋点（不回退），无参数为成功埋点并回退
 */
let hasSenderConfirmBacked = false
const senderAddressBookConfirmReport = (err?: unknown) => {
  other_express_single_address_book_v1(err)
  if (!err && !hasSenderConfirmBacked) {
    hasSenderConfirmBacked = true
    router.back()
  }
}

/**
 * 收方地址簿确认回调：埋点 + 返回上一页
 * 返程单场景下，去程单/返程单两方都监听了确认事件，校验回调会执行多次，
 * 回退收敛到此处并用标记保证只执行一次；有参数为失败埋点（不回退），无参数为成功埋点并回退
 */
let hasReceiveConfirmBacked = false
const receiveAddressBookConfirmReport = (err?: unknown) => {
  other_express_single_address_book_v1(err)
  if (!err && !hasReceiveConfirmBacked) {
    hasReceiveConfirmBacked = true
    router.back()
  }
}

/**
 * 选中
 */
const onSelectItem = debounce(async (item: ListItem) => {
  // 设置选中的地址
  setSelectAddressBookJumpData(item)
  if (isNetworkQueryAddress.value) {
    if (isWxApplet) {
      $native.postMessage({ type: 'networkQueryAddress', data: netWorkQueryParams(item) })
    } else {
      setAddressInfo(netWorkQueryParams(item))
    }
    setTimeout(() => {
      $native.navigateBack()
    }, 500)
    return
  }
  // 寄方手机号需要截断-虚拟号
  let mobile = getValueOrEmpty(item.mobile)
  if (routeQuery.addressType === Address.SENDER_ADDRESS_TYPE) {
    mobile = telephoneFn(mobile)
  }

  // 可能存在禁用地址，需要去筛选
  let address = checkAdressDisable(item)

  let data = {
    mobile,
    person: getValueOrEmpty(item.person),
    telephone: getValueOrEmpty(item.telephone),
    extension: getValueOrEmpty(item.extension),
    companyName: getValueOrEmpty(item.companyName),
    ...address,
  }

  if (!item?.city && item?.county) {
    data.city = getValueOrEmpty(item.county)
    data.county = ''
  }

  // 这里需要单独判断是寄方或者收方
  const flag = routeQuery.addressType === Address.SENDER_ADDRESS_TYPE

  // 返单信息过来的
  if (routeQuery.pageSource === 'receipter') {
    emitAddressBookEvent('ReceipterAddressBookEvent', {
      ...data,
    })
    router.back()
    return
  }

  if (routeQuery.pageSource === 'freight-time') {
    emitAddressBookEvent('FreightTimeAddressBookEvent', {
      ...data,
      addressType: routeQuery.addressType,
    })
    router.back()
    return
  }

  if (flag) {
    // 寄方选中时先关闭实名认证
    showRealNameGuide.value = false
  }
  if (routeQuery.pageSource === 'unfold' || routeQuery.pageSource === 'block') {
    // block：订单页收/寄方信息块直接进入，由订单页 block 组件监听处理；unfold：填写寄收页展开表单进入，由填写页监听处理
    const isBlock = routeQuery.pageSource === 'block'
    if (flag) {
      emitAddressBookEvent(
        isBlock
          ? `SenderAddressBookBlockConfirm_${orderPageType.value}`
          : `SenderAddressBookConfirm_${orderPageType.value}`,
        {
          data,
          moduleStyle: Address.SENDER,
          isTrigger: true,
          pageSource: routeQuery?.pageSource as string,
          cacheStrategy: cacheStrategy.value,
          reportCallback: senderAddressBookConfirmReport,
          getEditableFields,
        },
      )
    } else {
      emitAddressBookEvent(
        isBlock
          ? `ReceiveAddressBookBlockConfirm_${orderPageType.value}`
          : `ReceiveAddressBookConfirm_${orderPageType.value}`,
        {
          data,
          moduleStyle: Address.RECEIVE,
          isTrigger: true,
          pageSource: routeQuery?.pageSource as string,
          cacheStrategy: cacheStrategy.value,
          reportCallback: receiveAddressBookConfirmReport,
          getEditableFields,
        },
      )
    }
  } else {
    // 寄方
    if (flag) {
      emitAddressBookEvent(`SenderAddressBookConfirm_${orderPageType.value}`, {
        data,
        moduleStyle: Address.SENDER_PAGE,
        isTrigger: false,
        pageSource: routeQuery?.pageSource as string,
        cacheStrategy: cacheStrategy.value,
        reportCallback: senderAddressBookConfirmReport,
        getEditableFields,
      })
    } else {
      emitAddressBookEvent(`ReceiveAddressBookConfirm_${orderPageType.value}`, {
        data,
        moduleStyle: Address.RECEIVE_PAGE,
        isTrigger: false,
        pageSource: routeQuery?.pageSource as string,
        cacheStrategy: cacheStrategy.value,
        reportCallback: receiveAddressBookConfirmReport,
        getEditableFields,
      })
    }
  }
}, 500)

const checkAdressDisable = (item: ListItem): detailedAddress => {
  // 定义参数
  let orderInfo
  let disabledItem
  // 判断寄收
  const flag = routeQuery.addressType === Address.SENDER_ADDRESS_TYPE
  if (flag) {
    orderInfo = piniaStore.order.orderState?.sender || {}
    disabledItem = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
  } else {
    orderInfo = piniaStore.order.orderState?.receive || {}
    disabledItem = piniaStore.globalData.returnEditDisableInfo('receiveExtraInfo', 'address') || {}
  }

  let address = {
    province: disabledItem.key ? orderInfo.province : getValueOrEmpty(item.province),
    city: disabledItem.key ? orderInfo.city : getValueOrEmpty(item.city),
    county: disabledItem.key ? orderInfo.county : getValueOrEmpty(item.county),
    detailAddress: disabledItem.key ? orderInfo.detailAddress : getValueOrEmpty(item.detailAddress),
  }

  return address
}

const path = computed(() => {
  return addressType.value === Address.SENDER_ADDRESS_TYPE ? SENDER : RECEIVE
})

/**
 * 新增或删除
 */
const onAddOrDeleteAll = ({ type }: { type: string }) => {
  // 新增
  if (type === 'add') {
    const { bookPageFrome, waybillNumber = '', action = '' } = routeQuery
    Taro.navigateTo({
      url: urlContact(path.value, {
        addressType: addressType.value,
        operateType: 'add',
        bookPageFrome,
        waybillNumber,
        action,
        parentAddressType: routeQuery.addressType,
        pageSource,
        // 进入来源：page=独立填写页，其余（unfold/block/直达）=订单页；编辑页保存后据此拆分写回事件名
        editFrom: pageSource === 'page' ? 'page' : 'order',
      }),
    })
    // router.push({
    //   path: '/' + path.value,
    //   query: {
    //     addressType: addressType.value,
    //     operateType: 'add',
    //     bookPageFrome,
    //     waybillNumber,
    //     action,
    //     parentAddressType: routeQuery.addressType,
    //     pageSource,
    //   },
    // })

    // 清空数据
    let data = {
      person: '',
      mobile: '',
      telephone: '',
      extension: '',
      companyName: '',
      province: '',
      city: '',
      county: '',
      detailAddress: '',
      addressLabelCode: [''],
    } as AddressBook
    if (
      ![EAddressPermissionTab.全部地址, EAddressPermissionTab.共享地址, EAddressPermissionTab.我的地址].includes(
        state.shareAddressPermission as EAddressPermissionTab,
      )
    ) {
      data.addressLabelCode = [state.shareAddressPermission]
    }
    if (addressType.value === Address.SENDER_ADDRESS_TYPE) {
      // 新增地址，公司名称取下单公司
      data.companyName = getValueOrEmpty(piniaStore.root.getUserInfo?.nickName)
      piniaStore.extend.updateSenderAddressBook({ data })
    } else {
      piniaStore.extend.updateReceiveAddressBook({ data })
    }
  }

  // 删除
  if (type === 'delete' || type === 'addLabel') {
    let ids: string[] = []
    if (batchSelectList.value?.length) {
      ids = batchSelectList.value.map((item) => item.id)
    } else {
      ids = state.list?.filter((item) => item.isSelectItem).map((i) => i.id)
    }
    if (ids?.length > MaxClearAddrNum) {
      const msg = isOperationLabel.value
        ? `最多勾选${MaxClearAddrNum}条地址`
        : `单次删除地址最多支持${MaxClearAddrNum}条，请重新选择`
      return showToast(msg)
    }
    if (ids?.length && ids.length > 0) {
      if (type === 'delete') {
        onDelete(ids)
      } else {
        onAddLabel()
      }
    } else {
      showToast(type === 'delete' ? '请选择要删除的地址' : '请选择需要加入标签的地址')
    }
  }
}

enum OperationTypes {
  管理标签 = 10,
  加入标签 = 20,
}
const onAddLabel = () => {
  editAddressLabelRef.value?.open(OperationTypes.加入标签)
}

/**
 * 删除
 */

const onDelete = async (ids: string[]) => {
  if (ids?.length === 0) {
    return
  }
  if (ids?.length === 1) {
    const targetItem = state.list?.find((item) => item.id === ids[0])
    if (!targetItem?.deleteFlag) {
      showToast(targetItem?.cannotDeleteAbleTips || '此地址仅支持创建人删除')
      return
    }
  }

  try {
    // 记录当前滚动的距离

    const params = {
      ids,
      addressType: addressType.value,
    }
    const showKyDialogParams = {
      message: '您确认要删除所选地址么',
      title: '温馨提示',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '删除',
    }
    setAddressListDefaultScrollTop()
    let res = await showKyDialog(showKyDialogParams)
    if (res !== true) return
    await batchDeleteAddress(params)
    state.list = state.list?.filter((item) => !ids.some((id) => id === item.id))
    if (state.list?.length === 0) {
      state.errorText = '暂无地址信息'
    }

    //删除完成后使用当前页码调用onLoad，onLoad每次都会page+1
    if (state.page >= 1) {
      state.page -= 1
    }
    onLoad()
    // getIsShowSearchStatus()
    showToast('删除成功')
    if (selectAll.value) {
      selectAll.value = false
    }
    resetCacheTab()
    setNoCheck()
    if (state.list?.length <= 0) {
      onManage(false)
    }
  } catch (error) {
    console.log('取消', error)
    if (error !== 'cancel') {
      showToast('删除失败')
    }
    handleOutClick({})
  } finally {
    const ele = listLoadRef.value?.[state.active]
    ele.setScrollY(addressListPageScrollTop.value)
  }
}
/**
 * 编辑
 */
const onEdit = (item: ListItem) => {
  if (!item.updateFlag) {
    showToast('此地址仅支持创建人编辑')
    return false
  }
  const data = {
    id: getValueOrEmpty(item.id),
    person: getValueOrEmpty(item.person),
    mobile: getValueOrEmpty(item.mobile),
    telephone: getValueOrEmpty(item.telephone),
    extension: getValueOrEmpty(item.extension),
    companyName: getValueOrEmpty(item.companyName),
    province: getValueOrEmpty(item.province),
    city: getValueOrEmpty(item.city),
    addressLabelCode: item.addressLabelCode,
    county: getValueOrEmpty(item.county),
    detailAddress: getValueOrEmpty(item.detailAddress),
    remark: getValueOrEmpty(item.remark),
    defaultFlag: item.defaultFlag,
  } as AddressBook
  if (addressType.value === Address.SENDER_ADDRESS_TYPE) {
    // 寄方地址簿
    piniaStore.extend.updateSenderAddressBook({ data })
  } else {
    // 收方地址簿
    piniaStore.extend.updateReceiveAddressBook({ data })
  }
  const { bookPageFrome, waybillNumber = '', action = '' } = routeQuery || {}
  // router.push({
  //   path: path.value,
  //   query: {
  //     pageSource,
  //     addressType: addressType.value,
  //     operateType: 'edit',
  //     bookPageFrome,
  //     action,
  //     waybillNumber: waybillNumber,
  //     parentAddressType: routeQuery.addressType,
  //   },
  // })
  Taro.navigateTo({
    url: urlContact(path.value, {
      pageSource,
      addressType: addressType.value,
      operateType: 'edit',
      bookPageFrome,
      action,
      waybillNumber: waybillNumber,
      parentAddressType: routeQuery.addressType,
      // 进入来源：page=独立填写页，其余（unfold/block/直达）=订单页；编辑页保存后据此拆分写回事件名
      editFrom: pageSource === 'page' ? 'page' : 'order',
    }),
  })
}
/**
 * 管理
 */
const onManage = (flag: boolean) => {
  state.showManage = flag
  if (flag) {
    onLoadClearAddInfo()
  }
  state.list.forEach((item) => (item.isSelectItem = false))
  batchSelectList.value = []
  selectAll.value = false
}

const showSelectItemNumber = ref(0)
/**
 * @description: 确认 批量选中地址
 * @return {*}
 */
const batchConfirm = async () => {
  // const selectedList = batchSelectList.value.map((item) => ({ receive: item })) as unknown as OrderInfo[]
  // addressBookReport()
  // if (batchWaybillInfoList.value?.length >= BATCH_MAX_LENGTH) {
  //   // 有些管控提示 不会拦截，数据依然会被存入后端缓存，此处做兜底拦截，如果有列表已有限定条数，则直接返回列表。
  //   router.back()
  //   return
  // }
  // if (selectedList && selectedList.length > 0) {
  //   batchLoading.value = true
  //   // 批量寄逻辑处理
  //   try {
  //     await remoteBatchCheck(
  //       'init',
  //       getFilterFormData(),
  //       undefined,
  //       // 选择超过限定条数，则截取
  //       selectedList.splice(0, BATCH_MAX_LENGTH - batchWaybillInfoList.value?.length),
  //     )
  //     router.back()
  //   } catch (error) {
  //     console.error(error)
  //   } finally {
  //     batchLoading.value = false
  //   }
  // } else {
  //   router.back()
  // }
}

/**
 * 地址簿上报
 */
// const addressBookReport = () => {
//   const selectedIds = batchSelectList.value.map((item) => item.id) as string[]
//   const sendList = tabCache['10_10'].list
//   const receiveList = tabCache['20_10'].list
//   const sender_id = []
//   const receiver_id = []
//   for (let item of sendList) {
//     if (selectedIds.includes(item.id)) {
//       sender_id.push(item.id)
//     }
//   }
//   for (let item of receiveList) {
//     if (selectedIds.includes(item.id)) {
//       receiver_id.push(item.id)
//     }
//   }
//   other_express_single_address_book_select_v1('order-batch', {
//     sender_id: sender_id.join(','),
//     receiver_id: receiver_id.join(','),
//   })
// }

/**
 * 重新加载
 */
const onReLoad = debounce(() => {
  state.switchLoading = true
  handleUnLoginHandler()
  onRefresh()
}, 300)

const loadingTimer = ref()

const resetLoadingTimer = () => {
  try {
    clearTimeout(loadingTimer.value)
    loadingTimer.value = null
    loadingText.value = '搜索中...'
  } catch (error) {
    console.log(error)
  }
}

/**
 * 下拉刷新
 */
// eslint-disable-next-line complexity, max-lines-per-function
const onLoad = async () => {
  state.page += 1
  try {
    const params = {
      addressType: addressType.value,
      keyword: state.keyword,
      page: state.page,
      pageSize: state.pageSize,
      addressLabelCode: state.shareAddressPermission,
      queryScene: AddressScene.移动端,
    }
    resetLoadingTimer()
    loadingTimer.value = setTimeout(() => {
      loadingText.value = '正在努力搜索中...'
    }, 3000)
    const { data } = await getAddressBookList(params)
    resetLoadingTimer()

    if (state.refreshing) {
      state.list = []
      state.refreshing = false
    }

    state.list = state.page === 1 ? data?.rows : [...state.list, ...data?.rows]
    state.refreshing = false
    state.pageTotal = data?.pageTotal
    state.finished = state.pageSize > data?.rows?.length

    try {
      if (state.page === 1) {
        let EAddValueMap: Record<string, string> = {
          [EAddressPermissionTab.全部地址]: '全部地址',
          [EAddressPermissionTab.我的地址]: '我的地址',
          [EAddressPermissionTab.共享地址]: '共享地址',
        }
        umpOtherReport(
          'OTHER',
          {
            eventCode: 'other_express_book_perception_v1',
          },
          {
            page_type: EAddValueMap[state.shareAddressPermission],
            recognition_type: recognitionTypeTitle.value,
          },
        )
      }
    } catch (error) {
      console.log(error)
    }

    // 判断是否有权限显示SubTab有权限则设置默认值
    if (!state.shareAddressPermissionKey) {
      try {
        if (getIsShowSearchPromise.value) {
          await getIsShowSearchPromise.value
        }
      } catch (error) {
        console.log('error', error)
      }
      state.shareAddressPermissionKey = data?.shareAddressPermission || shareAddressAuth.value
      state.isSubTab = (data?.shareAddressPermission || shareAddressAuth.value) === EAddressPermission.有权限 || false
      if (state.isSubTab && !state.shareAddressPermission) {
        state.shareAddressPermission = EAddressPermissionTab.全部地址
      }
    }

    if (!listLength.value) {
      state.errorText = '暂无地址信息'
    }
    setSelectStatus({ orderPageType: orderPageType.value, state: state, batchSelectList: batchSelectList.value })
    if (selectAll.value) {
      onSelectAllRadio(true)
    }
    return {
      data: state.list,
      total: state.pageTotal,
    }
  } catch (error) {
    state.page -= 1
    state.refreshing = false
    state.finished = true
    state.errorStatus = true
    if ((error as any).code === 'ERR_NETWORK') {
      state.errorText = '当前无网络，请检查后重试'
    } else {
      state.errorText = (error as any).message || (error as any).msg
    }
    resetLoadingTimer()
  } finally {
    state.showSkeleton = false
    state.switchLoading = false
    preLoadSubTab()
    cacheTabFun()
    stopPullDownRefresh()
    resetLoadingTimer()
  }
}

const getCacheList = async () => {
  state.list = []
  await nextTick()
  const item = tabCache[cacheTabKey.value]

  const list = item.list || []
  for (let i = 0; i < list.length; i++) {
    if (list[i].isSelectItem) {
      list[i].isSelectItem = false
    }
  }
  state.list = list
  state.page = item.page
  state.finished = item.finished
  state.errorText = item.errorText
  state.errorStatus = item.errorStatus
  if (!listLength.value) {
    state.errorText = '暂无地址信息'
  }
  setSelectStatus({ orderPageType: orderPageType.value, state: state, batchSelectList: batchSelectList.value })
  if (selectAll.value) {
    onSelectAllRadio(true)
  }
}

/**
 * 上拉加载
 */
const onRefresh = () => {
  state.page = 0
  state.refreshing = true
  state.errorStatus = false
  cacheTabFun(true)
  return onLoad()
}

/**
 * 缓存tab的key
 */
const cacheTabKey = computed(() => {
  const address = addressType.value
  const shareAddressPermission = state.shareAddressPermission || EAddressPermissionTab.全部地址
  const key = `${address}_${shareAddressPermission}`
  return key
})

/**
 * 更新缓存tab数据
 */
const cacheTabFun = (isRefresh = false, key = cacheTabKey.value, tabData?: tabDataType) => {
  const subTitle = [EAddressPermissionTab.全部地址, EAddressPermissionTab.我的地址, EAddressPermissionTab.共享地址]
  const subKey = key?.split('_')[1]
  if (!subTitle.includes(subKey as EAddressPermissionTab)) return
  const {
    page = state.page,
    list = state.list,
    finished = state.finished,
    errorText = state.errorText,
    errorStatus = state.errorStatus,
  } = tabData || {}
  if (!tabCache[key]) {
    return
  }
  tabCache[key].page = page
  tabCache[key].list = list
  tabCache[key].keyword = isRefresh ? '' : state.keyword
  console.log(tabCache[key], 'cacheTabFun')
  tabCache[key].loadend = !isRefresh
  tabCache[key].finished = finished
  tabCache[key].errorText = errorText
  tabCache[key].errorStatus = errorStatus
}
/**
 * 判断是否需要加载
 */
const needGetData = () => {
  const tab = tabCache[cacheTabKey.value]
  if (!tab) {
    return true
  }
  if (tab.errorStatus) {
    return tab.errorStatus
  }
  console.log(tab, 'needGetData', tabCache, cacheTabKey.value)
  return !tab?.loadend || tab.keyword !== state.keyword
}

// 清理地址簿 相关信息
// const clearAddrInfo = computed(() => {
//   return tabClearAddrCache[cacheTabKey.value as DynamicKeys]! ?? {}
// })
const clearAddrInfo = ref<IsCanClearAddrResponse>({
  addressInfoList: [],
  hasCleanAddressAuth: '',
  authFlag: '',
})

// 请求可以删除地址接口
const onLoadClearAddInfo = async () => {
  await nextTick()
  // 加入标签不走这个逻辑
  if (isOperationLabel.value) return
  if (
    state.showManage &&
    (state.shareAddressPermission === EAddressPermissionTab.我的地址 ||
      state.shareAddressPermission === EAddressPermissionTab.全部地址)
  ) {
    getIsCanClearAddr({
      addressType: addressType.value,
      addressShowType: state.shareAddressPermission || EAddressPermissionTab.全部地址,
    }).then(({ data }) => {
      // 加入到缓存中
      clearAddrInfo.value = data
    })
  }
}

/**
 * 提前加载子级tab的第一页数据
 */
const preLoadSubTab = () => {
  if (!showSubTab.value) {
    return
  }
  let subTabList = [EAddressPermissionTab.全部地址, EAddressPermissionTab.我的地址, EAddressPermissionTab.共享地址]
  const subTabListCode = addressLabelList.value?.map((item) => item.labelCode)
  subTabList = subTabList.filter((item) => subTabListCode.includes(item) && item !== state.shareAddressPermission)
  const normalParams = {
    addressType: addressType.value,
    keyword: state.keyword,
    page: state.page || 1,
    pageSize: state.pageSize,
  }
  for (let i = 0; i < subTabList.length; i++) {
    const item = subTabList[i]
    const key = `${addressType.value}_${item}`
    if (tabCache[key] && tabCache[key].loadend) {
      break
    }
    const params = {
      ...normalParams,
      addressShowType: item,
      queryScene: AddressScene.移动端,
    }
    getAddressBookList(params)
      .then((res) => {
        const data = res?.data?.rows || []
        // 如果数据只有一页，需要将finished设置为true
        let finished = data.length >= (res?.data?.rowTotal ?? 0)
        cacheTabFun(false, key, {
          list: data,
          page: 1,
          finished,
          errorText: data.length ? '' : '暂无地址信息',
          errorStatus: false,
        })
      })
      .catch(() => {
        cacheTabFun(false, key, {
          list: [],
          page: 1,
          finished: false,
          errorText: '当前无网络，请检查后重试',
          errorStatus: true,
        })
      })
  }
  console.log(tabCache, 'tabCache')
}
/**
 * 重置tab的缓存数据
 */
const resetCacheTab = () => {
  const tabList = [Address.SENDER_ADDRESS_TYPE, Address.RECEIVE_ADDRESS_TYPE]
  const subTabList = [EAddressPermissionTab.全部地址, EAddressPermissionTab.我的地址, EAddressPermissionTab.共享地址]
  tabList.forEach((i) => {
    subTabList.forEach((a) => {
      const key = `${i}_${a}`
      tabCache[key] = {
        loadend: false,
        page: 0,
        list: [],
        keyword: '',
        finished: false,
        errorText: '',
        errorStatus: false,
      }
    })
  })
}

// tab的addressType，类型：10 寄方，20 收方
const addressType = computed(() => {
  let type = ''
  if (tabs[state.active].title === '寄件地址') {
    type = Address.SENDER_ADDRESS_TYPE
  } else {
    type = Address.RECEIVE_ADDRESS_TYPE
  }
  return type
})

recognition_type_init(state, tabs, addressType.value)
// 列表数据长度
const listLength = computed(() => state.list?.length)
// 是否选中
const isSelect = computed(() => state.list?.filter((item) => item?.isSelectItem)?.length <= 0)
// 没有更多文案
const finishedText = computed(() => (listLength.value > 8 ? '没有更多了' : ''))
// 刚刚新增
const justAddedFlagId = computed(() => {
  const senderAddressBook = piniaStore.extend.senderAddressBook()
  const receiveAddressBook = piniaStore.extend.receiveAddressBook()
  if (addressType.value === Address.SENDER_ADDRESS_TYPE) {
    return getValueOrEmpty(senderAddressBook?.justAddedFlagId)
  } else {
    return getValueOrEmpty(receiveAddressBook?.justAddedFlagId)
  }
})

// 是否需要展示默认地址, 独立进入地址薄界面常驻 默认标签
const showSaveAddressBookBtn = computed(() => {
  const { addressType: q = '' } = routeQuery
  return (
    addressType.value === Address.SENDER_ADDRESS_TYPE && (q === Address.SENDER_ADDRESS_TYPE || isInitAddressFlag.value)
  )
})

// 处理滑动，收起软键盘
const searchRef = ref<InstanceType<typeof Search>>()
const onTouchstart = () => {
  if (searchRef.value) {
    // searchRef.value.$el.querySelector('input').blur()
  }
}
useUnload(() => {
  // 从首页或者填单页进来，需要重置tabs下标
  // if (to.name === 'order' || to.name === 'sender-page' || to.name === 'receive-page' || to.name === 'order-batch') {
  //   state.active = 0
  //   needResetTabIndex.value = true
  // } else {
  //   needResetTabIndex.value = false
  // }
  routerBackIsHidePop.value = true
})

useDidHide(() => {
  // 清空刚刚新增标识 UPDATE_SENDER_ADDRESS_BOOK_JUST_ADDED_FLAG
  piniaStore.extend.updateSenderAddressBookJustAddedFlag({ data: '' })
  piniaStore.extend.updateReceiveAddressBookJustAddedFlag({ data: '' })
  routerBackIsHidePop.value = true
})

/**
 * @description: 更新页面标题
 * @return {*}
 */
const updateDocumentTitle = () => {
  if (isNetworkQueryAddress.value) {
    document.title = '选择地址簿地址'
  } else if (isInitAddressFlag.value) {
    document.title = '地址簿'
  } else if (routeQuery.addressType === Address.SENDER_ADDRESS_PAGE_TYPE) {
    document.title = '选择寄件信息'
  } else {
    document.title = '选择收件信息'
  }
}

const getIsShowSearchStatus = async () => {
  const defaultData = [
    {
      labelName: '全部',
      labelCode: '10',
      labelSort: 20,
      sortFlag: false,
    },
  ]
  try {
    // 获取地址标签
    const { data } = await navigationbarQuery({
      source: 'mobile',
    })
    if (typeof data?.allPersonCompanySenderReceive === 'boolean') {
      showSearch.value = data?.allPersonCompanySenderReceive
    }
    shareAddressAuth.value = data?.shareAddressPermission
    addressLabelList.value = data?.addressLabelList || defaultData
    // 缓存起来store 避免多次调用
    // 运费时效入口->地址编辑页->定位->返回运费时效入口->地址簿setAddressLabelList 会丢失
    if (piniaStore.globalData?.setAddressLabelList) {
      piniaStore.globalData?.setAddressLabelList({
        list: data?.addressLabelList || defaultData,
      })
    }
  } catch (error) {
    showSearch.value = true
    addressLabelList.value = defaultData
  }
}

const setAddressLabelListStore = () => {
  const defaultData = [
    {
      labelName: '全部',
      labelCode: '10',
      labelSort: 20,
      sortFlag: false,
    },
  ]
  // 缓存起来store 避免多次调用
  piniaStore.globalData.setAddressLabelList({
    list: addressLabelList.value || defaultData,
  })
}

const footerRef = ref()

useLoad(() => {
  // 从首页或者填单页进来，需要重置tabs下标
  if (routeQuery.addressType === Address.RECEIVE_ADDRESS_TYPE) {
    state.active = 1
    Taro.setNavigationBarTitle({ title: '选择收件信息' })
  } else {
    state.active = 0
    Taro.setNavigationBarTitle({ title: '选择寄件信息' })
  }
})

useDidShow(() => {
  getIsShowSearchPromise.value = getIsShowSearchStatus()
  if (routerBackIsHidePop.value) {
    isShowClearAddrPop.value = false
  } else {
    isShowClearAddrPop.value = true
    setTimeout(() => {
      if (footerRef.value) {
        footerRef.value.toChangeShowStatus(true)
      }
    }, 1200)
    return
  }

  state.shareAddressPermissionKey = ''
  // 清空全局参数
  setSelectAddressBookJumpData({})
  resetCacheTab()
  addressGlobalVariable()
  updateDocumentTitle()
  // 点击新增地址切换回来需要重置回我的地址
  if (state.shareAddressPermission === EAddressPermissionTab.共享地址) {
    state.shareAddressPermission = EAddressPermissionTab.我的地址
    state.showBtnOne = false
  }
  state.showSkeleton = true
  showLoadingToast({
    title: '加载中',
    duration: 0,
    forbidClick: true,
  })
  state.showManage = false
  state.batchCanSelect = false

  state.keyword = ''
  batchSelectList.value = []
  state.page = 0
  onLoad().finally(() => {
    closeToast()
  })
})

/**
 * @description: 显示底部操作按钮
 * 骨架屏，loading，无网络，非网点查询
 */
const showFooter = computed(() => {
  return !state.showSkeleton && !state.switchLoading && !state.errorStatus && !isNetworkQueryAddress.value
})
/**
 * @description: 显示副标题
 */
const showSubTab = computed(() => {
  return state.isSubTab && !isNetworkQueryAddress.value
})

/**
 * handleScroll 保存滚动的距离，因为showDialog 会刷新让页面回到顶部
 */
const handleScroll = (e) => {
  addressListPageScrollTopHistory.value = e.detail.scrollTop
}

const addAddressLabelRef = ref()
const editAddressLabelRef = ref()
// 操作类型是否是加入标签
const isOperationLabel = ref(false)
const addressLabelList = ref<AddressLabel[]>([])
// ----------------------------------------------
/**
 * 修改是否是编辑标签
 */
const setOperationType = (bool: boolean) => {
  isOperationLabel.value = bool
}
/**
 * 列表用的弹框-添加标签/管理标签
 */
const addOrEditLabel = debounce(
  async (isEdit?: boolean) => {
    // clk_express_single_send_address_book_label_v1(
    //   state.active === 0 ? 'sender' : 'receive',
    //   isEdit ? '管理标签' : '添加标签'
    // )
    clk_express_single_send_address_book_label_v1(
      addressType.value === Address.SENDER_ADDRESS_TYPE ? 'sender' : 'receive',
      isEdit ? '管理标签' : '添加标签',
    )
    if (isEdit) {
      editAddressLabelRef.value?.open()
    } else {
      addAddressLabelRef.value?.open()
    }
  },
  500,
  {
    leading: true,
  },
)

/**
 * 编辑弹框的添加弹框-添加标签/管理标签
 */
const addLabel = debounce(
  async (data?: AddressLabel) => {
    addAddressLabelRef.value?.open(data)
  },
  500,
  { leading: true },
)

/**
 * 地址批量加入地址标签
 */
const addAddressToAddressLabelAjax = debounce(async (labelCode: string, labelName: string) => {
  let addressIds: any = []
  let hasAddressLabel = false
  let _labelName: string[] = []
  if (batchSelectList.value?.length) {
    addressIds = batchSelectList.value.map((item) => {
      if (item?.addressLabelCode?.[0] && item.addressLabelCode?.[0] !== labelCode) {
        hasAddressLabel = true
        _labelName.push(item?.labelName || '')
      }
      return item.id
    })
  } else {
    addressIds = state.list
      ?.filter((item) => item.isSelectItem)
      .map((i) => {
        if (i?.addressLabelCode?.[0] && i.addressLabelCode?.[0] !== labelCode) {
          hasAddressLabel = true
          _labelName.push(i?.labelName || '')
        }
        return i.id
      })
  }
  // 过滤空的数据
  _labelName = _labelName.filter((item) => !!item)
  // 如果 有地址标签 则二次确认
  if (hasAddressLabel && _labelName && _labelName?.length > 0) {
    _labelName = Array.from(new Set(_labelName)) // 去重
    _labelName = _labelName?.map((item) => `【${item}】`)
    try {
      const res = await showDialog({
        allowHtml: true,
        title: '温馨提示',
        message: `原标记${_labelName.join(',')}地址将更新为【${labelName}】，确定保存吗？`,
        confirmButtonText: '确定',
        showCancelButton: true,
        cancelButtonText: '取消',
      })
      if (res === 'confirm') {
        doPolling(labelCode, addressIds)
      }
    } catch (error) {
      console.log(error)
    }
  } else {
    doPolling(labelCode, addressIds)
  }
}, 500)

const doPolling = async (labelCode: string, addressIds: string[]) => {
  resetCacheTab()
  const params = {
    labelCode,
    addressType: addressType.value,
    addressIds,
  }
  const { data } = await addAddressToAddressLabel(params)

  showLoadingToast({
    title: '处理中，请等待',
    duration: 0,
    forbidClick: true,
  })
  try {
    commonStopPolling('getAddressResultByTaskNo')
    await commonSetPolling({
      polling: getAddressResultByTaskNo,
      timerName: 'getAddressResultByTaskNo',
      delay: 300,
      count: 100,
      args: { taskNo: data },
      finishStatus: (res) => {
        if (res?.data) {
          closeToast()
          showToast('加入成功')
        }
        return res?.data || false
      },
    })
  } catch (error) {
    editAddressLabelRef.value?.close()
    closeToast()
    showToast('正在更新地址标签，请稍后刷新页面查看')
  } finally {
    editAddressLabelRef.value?.close()
    setNoCheck()
    setTimeout(() => {
      state.showSkeleton = true
      state.switchLoading = true
      state.refreshing = false
      onRefresh()
    }, 600)
  }
}

const setNoCheck = () => {
  state.list?.forEach((item) => (item.isSelectItem = false))
  batchSelectList.value = []
  selectAll.value = false
}

/**
 * 新增标签-新增标签机接口
 */
const saveLabel = debounce(
  async (labelName: string) => {
    try {
      const { data } = await addressLabelSave({ labelName })
      // getIsShowSearchStatus()
      addressLabelList.value.push(data)
      setAddressLabelListStore()
      showToast('保存成功')
      addAddressLabelRef.value.close()
    } catch (error) {
      showToast(error as string)
    }
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)

/**
 * 新增标签-管理标签机名称接口
 */
const editLabel = debounce(
  async (_addressLabelList: AddressLabel[], oldName: string, newName: string) => {
    try {
      if (oldName !== newName) {
        await showDialog({
          allowHtml: true,
          title: '温馨提示',
          message: `原标记【${oldName}】地址将更新为【${newName}】，确定保存吗？`,
          confirmButtonText: '确定',
          showCancelButton: true,
          cancelButtonText: '取消',
        })
        try {
          const { data } = await addressLabelUpdate({
            type: '20', // 10：排序，20：修改
            addressLabelList: _addressLabelList,
          })
          addressLabelList.value = data
          setAddressLabelListStore()
          showToast('编辑成功')
          addAddressLabelRef.value.close()
          refreshList()
        } catch (error) {
          showToast(error as string)
        }
      } else {
        showToast('标签名已重复，请重新输入')
      }
    } catch (error) {
      console.log(error as string)
    }
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)

/**
 * 管理标签-拖拽后保存接口
 */
const updateLabel = debounce(
  async (_addressLabelList: AddressLabel[]) => {
    try {
      const { data } = await addressLabelUpdate({
        type: '10',
        addressLabelList: _addressLabelList,
      })
      addressLabelList.value = data
      setAddressLabelListStore()
      // showToast('保存成功')
    } catch (error) {
      showToast(error as string)
    }
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)
/**
 * 管理标签-删除标签接口
 */
const delLabel = debounce(
  async (labelCode: string) => {
    try {
      await addressLabelDelete({ labelCode })
      addressLabelList.value = addressLabelList.value.filter((v) => v.labelCode !== labelCode)
      setAddressLabelListStore()
      showToast('删除成功')
      state.shareAddressPermission = EAddressPermissionTab.全部地址
      refreshList()
    } catch (error) {
      showToast(error as string)
    }
  },
  500,
  {
    leading: true,
    trailing: false,
  },
)

const refreshList = () => {
  resetCacheTab()
  if (state.page >= 1) {
    state.page -= 1
  }
  onLoad()
}

const handleOutClick = (e) => {
  console.log('handleOutClick', e)
  Taro.eventCenter.trigger('__global_out_click__', e)
}
/* eslint-disable max-lines */
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
// .address-book-page__footer {
//   position: fixed;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   z-index: 10;
// }
</style>
