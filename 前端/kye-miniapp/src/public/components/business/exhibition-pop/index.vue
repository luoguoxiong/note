<template>
  <ky-popup :show="show" safeAreaInsetBottom :closeOnClickOverlay="false" position="bottom">
    <view class="popup-box-exhibition">
      <view class="popup-box-exhibition-title">
        <text
          >展馆/展位号<text class="popup-box-exhibition-title-waybill"
            >({{ orderInfo.waybillNumber || '--' }})</text
          ></text
        >
        <view class="kye-miniapp-waybill-popup-close-box" @tap="handleClose">
          <image
            class="kye-miniapp-waybill-popup-close"
            src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
          ></image>
        </view>
      </view>
    </view>
    <view class="form-content form-content-exhibition">
      <view class="form-item">
        <view class="item-label">展馆号</view>
        <ky-popover location="top-start" :offset="[150, 0]" theme="dark" :show="exhibitionNumberPopoverShow">
          <template #reference>
            <view class="item-value" :class="{ 'item-value-error': exhibitionNumberPopoverShow }">
              <exbition-cell
                :value="orderInfo.exhibitionNumber"
                placeholder="请选择收件地址展馆号"
                label=""
                title=""
                @handleClick="clickExbition"
              />
            </view>
          </template>
          <template #content>
            <view class="error-tips-padding">{{ !orderInfo.exhibitionNumber ? '请选择收件地址展馆号' : '' }}</view>
          </template>
        </ky-popover>
      </view>
      <view class="row-line"></view>
      <view class="form-item">
        <view class="item-label">展位号</view>

        <ky-popover location="top-start" :offset="[150, 0]" theme="dark" :show="SiteNumberPopoverShow">
          <template #reference>
            <view class="item-value" :class="{ 'item-value-error': SiteNumberPopoverShow }">
              <text v-if="!canEdit">{{ orderInfo.exhibitionSiteNumber }}</text>
              <ky-input
                v-else
                v-model="orderInfo.exhibitionSiteNumber"
                @blur="handleBlur"
                @focus="handleFocus"
                input-align="right"
                placeholder-class="my-placeholder"
                :isError="SiteNumberPopoverShow"
                label=""
                clearable
                placeholder="请输入收件地址展位号"
                @input="handleExhibitionSiteNumber"
                :popoverConfig="filePopoverConfig"
                :cursor-spacing="100"
                class="exhibition-pop-input"
              >
              </ky-input>
            </view>
          </template>
          <template #content>
            <view class="error-tips-padding">{{ !orderInfo.exhibitionSiteNumber ? '请输入收件地址展位号' : '' }}</view>
          </template>
        </ky-popover>
      </view>
      <view class="row-line" :class="{ active: isFocus }"></view>
    </view>
    <view v-if="canEdit" class="footer-content-exhibition">
      <ky-button block type="default" class="btn cancel-btn" @click="resetData">重置</ky-button>
      <ky-button
        block
        type="default"
        class="btn confirm-btn"
        @click="confirmHandle"
        loading-text="确定"
        :loading="loading"
      >
        确定
      </ky-button>
    </view>
  </ky-popup>
  <ky-popup :show="showExhibitionList" :closeOnClickOverlay="false" position="bottom" class="exhibition-list-box">
    <view class="popup-box">
      <view class="popup-box-title">
        <text>展馆号</text>
        <image
          class="popup-close"
          @tap="showExhibitionList = false"
          src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png"
        ></image>
      </view>
    </view>
    <view class="exbition-list" v-if="exhibitionList.length > 0">
      <view
        class="exbition-item"
        :class="{ active: item.exhibitionNumber === orderInfo.exhibitionNumber }"
        @click="selectExbition(item)"
        v-for="item in exhibitionList"
        :key="item.exhibitionNumber"
      >
        {{ item.exhibitionNumber }}
        <Image
          class="exbition-item-img"
          src="https://ic-img.ky-express.com/netc/20250614_44359_!!1749884848790_56_50.png"
          alt=""
          v-if="item.exhibitionNumber === orderInfo.exhibitionNumber"
        />
      </view>
    </view>
    <!-- 缺省页 -->
    <view class="no-data__body" v-else>
      <image src="https://ic-img.ky-express.com/netc/20250612_34679_!!1749693134835_608_608.png" alt="" />
      <view class="text">当前收件地址获取不到展馆信息，请联系商务</view>
    </view>
  </ky-popup>
</template>
<script lang="ts" setup>
import './index.scss'
import Taro from '@tarojs/taro'
import { ref } from 'vue'
import ExbitionCell from './components/exbition-cell/index.vue'
import { getExhibitionList, setExhibitionList } from '@public/apis/pop'
import { report_CLK_event, report_EXP_event } from '@public/utils'

const emit = defineEmits(['updateExhibitionHandle', 'refreshRouteData'])

const handleClose = () => {
  show.value = false
}

const exhibitionNumberPopoverShow = ref(false)
const SiteNumberPopoverShow = ref(false)

const show = ref<boolean>(false)
const canEdit = ref<boolean>(false)

const showExhibitionList = ref<boolean>(false)
const skeletonLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const isFocus = ref<boolean>(false)
const exhibitionList = ref<
  {
    /** 会展中心编码 */
    exhibitionCode: string
    /** 展馆号 */
    exhibitionNumber: string
  }[]
>([])
const requiredFlag = ref<boolean>(false)
const orderInfo = ref({
  waybillNumber: '',
  exhibitionCode: '',
  exhibitionNumber: '',
  exhibitionSiteNumber: '',
})

const originOrderInfo = ref({
  waybillNumber: '',
  exhibitionCode: '',
  exhibitionNumber: '',
  exhibitionSiteNumber: '',
})

const filePopoverConfig = ref({
  placement: 'right-end',
  offset: [0, 0],
})

const clickExbition = () => {
  if (!canEdit.value) return
  showExhibitionList.value = true
  exhibitionNumberPopoverShow.value = false
}

// 重置数据
const resetData = () => {
  orderInfo.value.exhibitionCode = ''
  orderInfo.value.exhibitionNumber = ''
  orderInfo.value.exhibitionSiteNumber = ''
  report_CLK_event('clk_order_search_exhibition_pop_button_v1', {
    button_name: '重置',
  })
}

// 提交方法
const confirmHandle = () => {
  report_CLK_event('clk_order_search_exhibition_pop_button_v1', {
    button_name: '确定',
  })
  // 校验
  console.log('orderInfo >>>>> ', orderInfo.value)
  if (requiredFlag.value) {
    if (!orderInfo.value.exhibitionNumber) {
      exhibitionNumberPopoverShow.value = true
      return
    }

    if (!orderInfo.value.exhibitionSiteNumber) {
      SiteNumberPopoverShow.value = true
      return
    }
  } else {
    if (!orderInfo.value.exhibitionNumber && orderInfo.value.exhibitionSiteNumber) {
      exhibitionNumberPopoverShow.value = true
      return
    }
    if (orderInfo.value.exhibitionNumber && !orderInfo.value.exhibitionSiteNumber) {
      SiteNumberPopoverShow.value = true
      return
    }
  }

  loading.value = true
  exhibitionNumberPopoverShow.value = false
  SiteNumberPopoverShow.value = false

  const apiParams = {
    waybillNumber: orderInfo.value.waybillNumber || '',
    exhibitionCode: orderInfo.value.exhibitionCode || '',
    exhibitionNumber: orderInfo.value.exhibitionNumber || '',
    exhibitionSiteNumber: orderInfo.value.exhibitionSiteNumber || '',
  }
  setExhibitionList(apiParams)
    .then((res) => {
      if (res.data) {
        emit('updateExhibitionHandle', {
          pickupExhibitionCode: apiParams.exhibitionCode,
          pickupExhibitionHallNumber: apiParams.exhibitionNumber,
          pickupExhibitionSiteNumber: apiParams.exhibitionSiteNumber,
          waybillNumber: orderInfo.value.waybillNumber,
        })
        Taro.showToast({ title: '提交成功', icon: 'success' })
        show.value = false
        emit('refreshRouteData')
      }
    })
    .catch((err) => {
      Taro.showToast({
        title: err?.message || err || '更新失败',
        icon: 'none',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

const selectExbition = (item) => {
  orderInfo.value.exhibitionNumber = item.exhibitionNumber
  orderInfo.value.exhibitionCode = item.exhibitionCode
  showExhibitionList.value = false
}
const handleBlur = () => {
  isFocus.value = false
}
const handleFocus = () => {
  isFocus.value = true
  SiteNumberPopoverShow.value = false
}
const handleExhibitionSiteNumber = (val) => {
  val = val?.trim()
  if (val) {
    val = val?.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\s/g, '')
  }
  orderInfo.value.exhibitionSiteNumber = val
}

const openDialog = (queryParams: {
  /** 收件会展编码 */
  pickupExhibitionCode: string
  /** 收件展馆号 */
  pickupExhibitionHallNumber: string
  /** 收件展位号 */
  pickupExhibitionSiteNumber: string
  /** 运单号 */
  waybillNumber: string
  /** 是否可编辑 */
  canEdit: boolean
}) => {
  exhibitionNumberPopoverShow.value = false
  SiteNumberPopoverShow.value = false

  show.value = true
  canEdit.value = queryParams.canEdit

  orderInfo.value = {
    waybillNumber: queryParams.waybillNumber,
    exhibitionCode: queryParams.pickupExhibitionCode,
    exhibitionNumber: queryParams.pickupExhibitionHallNumber,
    exhibitionSiteNumber: queryParams.pickupExhibitionSiteNumber,
  }

  originOrderInfo.value = {
    waybillNumber: queryParams.waybillNumber,
    exhibitionCode: queryParams.pickupExhibitionCode,
    exhibitionNumber: queryParams.pickupExhibitionHallNumber,
    exhibitionSiteNumber: queryParams.pickupExhibitionSiteNumber,
  }

  skeletonLoading.value = true
  getExhibitionList({ waybillNumber: orderInfo.value.waybillNumber })
    .then((res) => {
      exhibitionList.value = res.data.exhibitionInfos || []
      requiredFlag.value = !!res.data.required
    })
    .catch((err) => {
      Taro.showToast({
        title: err?.message || err,
        icon: 'none',
      })
    })
    .finally(() => {
      skeletonLoading.value = false
    })
  report_EXP_event('exp_order_search_exhibition_v1')
}

defineExpose({
  openDialog,
})
</script>
