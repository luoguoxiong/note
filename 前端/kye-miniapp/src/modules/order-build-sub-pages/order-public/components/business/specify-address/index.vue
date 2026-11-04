<template>
  <div class="specify-address">
    <BottomPopup
      v-model:show="state.showPopup"
      :title="title"
      :showFooter="batchSelect"
      :class="{ extra: state.showSkeleton }"
      class="specify-address-popup"
      :loading="batchLoading"
      :footerText="`确定(${selectedLength}/${batchSelectLength})`"
      @onClose="state.showPopup = false"
      @onConfirm="handleBatchConfirm"
    >
      <template #tips>
        <!-- 按就近地址排序 -->
        <Position v-if="state.isHasLocationRecode" @onClickPosition="onClickPosition" />
      </template>

      <!-- 骨架屏 -->
      <Skeleton v-if="state.showSkeleton" />
      <!-- 搜索 -->
      <div class="specify-address-input-wrap">
        <ky-input
          v-if="!state.showSkeleton"
          ref="searchRef"
          :placeholder="placeholder"
          :model-value="state.keyword"
          :addressVisibleType="addressVisibleType"
          :fieldsConfigType="fieldsConfigType"
          clearable
          @update:model-value="onSearch"
        >
          <template #left>
            <SvgIcon name="search-icon" class="search-icon" />
          </template>
        </ky-input>
      </div>

      <!-- 搜索加载 -->
      <div class="specify-flex" v-if="state.searchLoading"><KyLoading class="search__loading" text="加载中..." /></div>

      <!-- 缺省状态 -->
      <Empty
        v-if="!listLength && !state.showSkeleton && !state.searchLoading && state.showPopup"
        :keyword="state.keyword"
      />

      <!-- 列表 -->
      <!-- <ListRefreshLoad
        v-if="!state.showSkeleton && listLength > 0"
        :refreshing="state.refreshing"
        :loading="state.loading"
        :finished="state.finished"
        :finishedText="finishedText"
        @onLoad="onLoad"
        @onRefresh="onRefresh"
      > -->
      <scroll-view :style="{ height: '60vh' }" :scroll-y="true" class="specify-scroll-view">
        <List
          v-for="(item, index) in state.list"
          :key="index"
          :item="item"
          :index="index"
          :keyword="state.keyword"
          :activeItem="state.activeItem"
          :addressVisibleType="addressVisibleType"
          :fieldsConfigType="fieldsConfigType"
          :recommendByUserLocation="recommendByUserLocation"
          :batchSelect="batchSelect"
          @click="onSelect(item)"
          @onLocationDistance="onLocationDistance(item)"
          @touchstart.passive="onTouchstart"
        />
      </scroll-view>
      <!-- </ListRefreshLoad> -->
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'

// 组件
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import ListRefreshLoad from '@order-public-sub-public/components/ui/list-refresh-load/index.vue'
import Skeleton from '@order-public-sub-public/components/business/specify-address/components/skeleton/index.vue'
// import Search from '@order-public-sub-public/components/business/specify-address/components/search/index.vue'
import List from '@order-public-sub-public/components/business/specify-address/components/list/index.vue'
import Position from '@order-public-sub-public/components/business/specify-address/components/position/index.vue'
import Empty from '@order-public-sub-public/components/business/specify-address/components/empty/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { isWxPcApplet } from '@order-public-sub-public/utils/device'

// 方法
import { getConfigAddressList } from '@order-public-sub-public/apis/address'
import { $native, getValueOrEmpty } from '@order-public-sub-public/utils'

// 类型
import { AddressType, BATCH_MAX_LENGTH } from '@order-public-sub-public/constants'
import { SpecifyAddress } from './types'
import { ConfigAddress } from '@order-public-sub-public/apis/address/types'
import { localStorage } from '@order-public-sub-public/utils/storage'
const piniaStore = useStore()

const props = defineProps<{
  addressType: AddressType
  recommendByUserLocation?: boolean | unknown
  addressVisibleType?: string
  fieldsConfigType?: boolean
  batchLoading?: boolean
  batchSelect?: boolean
}>()

const emit = defineEmits(['onSelect', 'onBatchSelect'])

const state = reactive<SpecifyAddress>({
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
  isHasLocationRecode: false,
})

// 弹窗标题
const title = computed(() => {
  const addressTypeText = props.addressType === AddressType.RECEIVE ? '收件' : '寄件'
  const infoTypeText = props.fieldsConfigType ? '地址' : '信息'
  return `请选择${addressTypeText}${infoTypeText}`
})

// 数组长度
const listLength = computed(() => state.list?.length || 0)

// 没有更多了文案
const finishedText = computed(() => (listLength.value > 20 ? '没有更多了' : ''))

const placeholder = computed(() => {
  let str = ''

  if (props.fieldsConfigType) {
    str = '请输入地址名称/详细地址'
  } else {
    str = '请输入姓名/手机/地址名称/详细地址'
  }

  return str
})

// 处理滑动，收起软键盘
const searchRef = ref()
const onTouchstart = () => {
  if (searchRef.value) {
    searchRef.value.$el.querySelector('input').blur()
  }
}

/**
 * 打开弹窗
 * @param str string
 * @param addressId string
 */
const open = async (str: string, addressId: string) => {
  state.page = 0
  state.keyword = ''
  state.showPopup = true
  state.showSkeleton = true

  // 用户第一次开启定位，先将这个值缓存取来，下次不提示用户获取定位且不显示按“按就近地址排序”入口
  const flag = props.recommendByUserLocation && localStorage?.getItem('isHasLocationRecode') !== 'true'
  state.isHasLocationRecode = flag ? true : false

  if (props.batchSelect) {
    state.activeItem = 0
  } else {
    // 未选中需要清空选中的高亮
    state.activeItem = str ? addressId : -1
  }

  if (!state.isHasLocationRecode) {
    await getPosition()
  }
  onLoad(true)
}

/**
 * 获取经纬度
 */
const getPosition = async () => {
  try {
    // const { longitude, latitude } = await $native.getLocation()
    const { longitude, latitude } = await Taro.getLocation({
      type: 'wgs84', // 或 'wgs84'
    })
    state.longitude = longitude
    state.latitude = latitude
    setIsHasLocationRecode()
    state.isHasLocationRecode = false
  } catch (error) {
    state.longitude = ''
    state.latitude = ''
    console.log('获取地位失败', error)
  }
}

// 按最近距离排序 显示一次
const setIsHasLocationRecode = async () => localStorage?.setItem('isHasLocationRecode', 'true')

/**
 * 按最近距离排序
 */
const onClickPosition = async () => {
  try {
    await getPosition()
  } catch (error) {
    console.error(error)
  } finally {
    onSearch()
  }
}

/**
 * 公里数唤起地图
 */
const onLocationDistance = async (item: ConfigAddress) => {
  if (isWxPcApplet) {
    // PC微信小程序 不支持定位功能
    showToast('当前登录设备，暂不支持查看位置功能')
    return
  }
  const { latitude = 0, longitude = 0, addrName = '', addrDetail } = item
  try {
    // $native.openLocation({
    //   latitude,
    //   longitude,
    //   address: addrDetail,
    //   title: addrName || '[位置]',
    //   name: addrName || '[位置]',
    //   scale: 16, // 地图缩放级别,整型值,范围从1~28。默认为最大
    // })
    Taro.openLocation({
      latitude,
      longitude,
      address: addrDetail,
      name: addrName || '',
      scale: 16,
    })
  } catch (error) {
    showToast('公里数唤起地图失败')
  }
}

/**
 * 搜索
 */
const onSearch = debounce((value: string) => {
  state.keyword = value
  state.page = 0
  state.searchLoading = true
  state.list = []
  onLoad(true)
}, 300)

/**
 * 选中某项
 * @param item
 */
const onSelect = (item: ConfigAddress) => {
  if (props.batchSelect) {
    if (selectedLength.value === batchSelectLength.value && !item.isSelectItem) {
      showToast(`最多可选择${batchSelectLength.value}个收件人`)
      return
    }
    item.isSelectItem = !item.isSelectItem

    state.list = state.list.map((data) => {
      if (data.addressId === item.addressId) {
        return { ...data, isSelectItem: item.isSelectItem }
      }
      return data
    })
  } else {
    const data = {
      person: getValueOrEmpty(item.userName),
      mobile: getValueOrEmpty(item.mobile),
      telephone: getValueOrEmpty(item.telephone),
      extension: getValueOrEmpty(item.extension),
      companyName: getValueOrEmpty(item.companyName),
      province: getValueOrEmpty(item.province),
      city: getValueOrEmpty(item.city),
      county: getValueOrEmpty(item.county),
      detailAddress: getValueOrEmpty(item.detailAddress),
      locationName: getValueOrEmpty(item.addrName),
      addrCode: getValueOrEmpty(item.addrCode),
      locationId: item.addressId || 0,
    }

    // 处理二级或三级地址为空的情况
    if (!item?.city && item?.county) {
      data.city = getValueOrEmpty(item?.county)
      data.county = ''
    }

    emit('onSelect', data)
    state.activeItem = item.addressId
    state.showPopup = false
  }
}

/**
 * 下拉刷新
 * @param isRefresh 判断是刷新还是加载更多
 */
const onLoad = async (isRefresh: boolean) => {
  state.page += 1
  state.loading = !state.refreshing && !isRefresh

  const params = {
    configId: piniaStore.schema.currentSchema.configId,
    addrType: props.addressType,
    keyword: state.keyword,
    page: state.page,
    pageSize: state.pageSize,
    longitude: state?.longitude,
    latitude: state?.latitude,
  }

  try {
    const { data } = await getConfigAddressList(params)

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

const close = () => {
  state.showPopup = false
}

defineExpose({ open, close })

const handleBatchConfirm = () => {
  const result = state.list.filter((item) => item.isSelectItem)
  emit('onBatchSelect', result)
}

const batchSelectLength = computed(() => {
  const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList || []

  return BATCH_MAX_LENGTH - batchWaybillInfoList.length || 0
})

const selectedLength = computed(() => {
  return state.list.filter((item) => item.isSelectItem).length
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
