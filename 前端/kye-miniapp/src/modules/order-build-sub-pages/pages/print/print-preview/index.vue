<template>
  <ky-container v-bind="pageOptions" class="print-preview">
    <view class="tabs" v-if="tabShow">
      <view
        class="tab"
        v-for="(tab, index) in printManagementList"
        :key="tab.key"
        @click="changeTab(tab.key, index)"
        :class="tab.key === tabKey ? 'active' : ''"
      >
        <text class="label">{{ tab.label }}</text>
        <view class="active-line"></view>
      </view>
    </view>
    <view class="page-size" v-if="pageParams.total > 1">
      <view class="item left-btn" :class="minDisabled() ? 'item-disabled' : ''" @click.stop="handleMinus">
        上一票
      </view>
      <view class="item">
        <text class="item-value">{{ pageParams.val }}/{{ pageParams.total }}</text>
      </view>
      <view
        class="item right-btn"
        :class="maxDisabled() ? 'item-disabled' : ''"
        :disabled="Number(pageParams.val) >= pageParams.total"
        @click.stop="handlePlus"
      >
        下一票
      </view>
    </view>
    <Skeleton v-if="showSkeleton" />
    <scroll-view
      scroll-y="true"
      class="content"
      v-if="!showSkeleton"
      id="contentPreviewPrintId"
      :scroll-into-view="scrollIntoViewId"
    >
      <view id="scrollTopList"></view>
      <view class="png-bg">
        <!-- <view class="png-bg-img" :style="pngStyle"></view> -->
        <img
          v-if="pngStyle.backgroundImage"
          :src="pngStyle.backgroundImage"
          mode="widthFix"
          alt="img"
          style="width: 100%"
        />
        <view class="png-bg-empty" v-else>
          <ky-empty
            description="网络异常，请重试"
            type="https://ic-img.ky-express.com/netc/20250624_40878_!!1750754280122_560_560.png"
          >
            <!-- <ky-button type="primary" @click.stop="handleResetFlushed"> 刷新 </ky-button> -->
          </ky-empty>
        </view>
      </view>
      <view id="scrollBottomList"></view>
    </scroll-view>
    <view class="print-preview-footer" v-if="!showSkeleton">
      <KyButton class="button-footer" type="primary" size="large" text="立即打印" @click="handleSubmit"></KyButton>
    </view>
  </ky-container>
  <BottomPopup
    v-model:show="popupVisible"
    title="请确认打印信息"
    show-tips
    :showTitleLeft="false"
    titleLeftIcon="left-arrow"
    :show-footer="false"
    @onClose="popupVisible = false"
  >
    <template v-slot:tips>
      <view class="popupTips">(共{{ waybillNumberList.length }}票运单)</view></template
    >
    <Popup :formData="printerForm" :waybillNumberList="waybillNumberList" :isMotherVisible="isMotherVisible"></Popup>
    <KyButton
      loading-text="立即打印"
      text="立即打印"
      class="nowbtn"
      type="primary"
      @click="handleSubmitPrint()"
      :loading="btnLoading"
    ></KyButton>
  </BottomPopup>

  <TransmitBluetoothPopup />
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import Popup from '../components/popup.vue'
import Skeleton from '../components/preview-skeleton/index.vue'
import TransmitBluetoothPopup from '../components/transmit-bluetooth/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useValidate } from '../hooks/useValidate'
import {
  printerForm,
  isBatch,
  popupVisible,
  btnLoading,
  waybillNumberList,
  waybillNumberBatchList,
  getPrintPreview,
  submit,
  onConfirm,
} from '../hooks/useData'
import { imgListType, printManagementListType } from '../hooks/type'
import { sessionStorage } from '@order-public-sub-public/utils/storage'
import { useDidShow } from '@tarojs/taro'
import Taro, { useUnload } from '@tarojs/taro'

const pageOptions = ref({
  navBarOptions: {
    showPlatList: [],
    title: '打印预览',
  },
  scrollOptions: {
    scrollViewPlatList: [],
  },
  toolOptions: {
    isHideShareMenu: true,
  },
  errorCheck: {
    // 监听弱网状态变化事件
    // onNetworkWeakChange: ({ errMsg, networkType, weakNet }) => {
    //   console.log('networkWeakChange', `${weakNet ? '弱网' : ''}`)
    // },
  },
})

const { isMotherVisible } = useValidate(printerForm, isBatch.value)

const printManagementList = ref<printManagementListType[]>([])
const tabKey = ref('10')
const showSkeleton = ref(false)
const route = useRoute()
const pageParams = reactive({
  val: 1,
  total: 0,
})
const pngStyle = reactive({
  backgroundImage: '',
  backgroundRepeat: 'no-repeat',
})

const tabShow = computed(() => {
  return printManagementList.value.length > 1
})

useUnload(() => {
  popupVisible.value = false
})

// 缓存一下打印件数的值，返回时主动赋值回
const cacheCount = ref()

onMounted(async () => {
  cacheCount.value = printerForm.count
  sessionStorage?.setItem('printPreview', '1')
  showSkeleton.value = true
  try {
    if (waybillNumberBatchList.value.length) {
      waybillNumberList.value = waybillNumberBatchList.value
    } else {
      waybillNumberList.value = (route.query.waybillNumber as string)?.split(',')
    }
    // waybillNumberList.value = (route.query.waybillNumber as string).split(',')
    // waybillNumberList.value.push('KY5000216029700')
    pageParams.val = 1
    pageParams.total = waybillNumberList.value.length
    await initPrintPreview(0)
  } finally {
    showSkeleton.value = false
  }
})

onUnmounted(() => {
  printerForm.count = cacheCount.value
})

const handleResetFlushed = () => {
  initPrintPreview(0)
}

const initPrintPreview = async (index: number) => {
  showSkeleton.value = true
  Taro.showLoading({ mask: true, title: '加载中...' })
  let res = await getPrintPreview(index)
  showSkeleton.value = false
  if (res.data && res.data.previewImageList && res.data.previewImageList.length) {
    const cargoReceiptList: imgListType[] = res.data.previewImageList.filter((v) => v.previewType === '10')
    printManagementList.value = []
    if (cargoReceiptList.length) {
      printManagementList.value.push({ key: '10', label: '随货联', imgList: cargoReceiptList })
    }
    const labelList: imgListType[] = res.data.previewImageList.filter((v) => v.previewType === '30')
    if (labelList.length) {
      printManagementList.value.push({ key: '30', label: '标签', imgList: labelList })
    }
    const counterfoilList: imgListType[] = res.data.previewImageList.filter((v) => v.previewType === '20')
    if (counterfoilList.length) {
      printManagementList.value.push({ key: '20', label: '存根联', imgList: counterfoilList })
    }
    if (printManagementList.value.length) {
      let inx = printManagementList.value.findIndex((v) => v.key === tabKey.value)
      if (inx === -1) {
        tabKey.value = printManagementList.value[0].key
        inx = 0
      }
      changeTab(tabKey.value, inx)
    }
  }
  Taro.hideLoading()
}

const scrollIntoViewId = ref('')

const changeTab = (key: string, index: number) => {
  tabKey.value = key
  const url = printManagementList.value[index]?.imgList[0]?.imgUrl
  console.log(url)
  pngStyle.backgroundImage = url
  // const contentPreviewPrintIdEle = document.getElementById('contentPreviewPrintId') as HTMLElement
  // if (contentPreviewPrintIdEle) {
  //   contentPreviewPrintIdEle.scrollTop = 0
  // }
  scrollIntoViewId.value = 'scrollTopList'
  setTimeout(() => {
    scrollIntoViewId.value = ''
  }, 100)
}

// 点击立即打印
const router = useRouter()
const handleSubmitPrint = async () => {
  // 提交打印
  await onConfirm()

  if (!printerForm?.printer || !printerForm.printer?.name) {
    Taro.getApp().notPrinter = true
    return router.back()
  }

  // setTimeout(() => {
  //   // 重新刷新一下权限
  //   getSimpleWaybillInfoFn()
  // }, 2000)
}

// 点击提交
const handleSubmit = async () => {
  await submit()
  setTimeout(() => {
    if (!printerForm?.printer || !printerForm.printer?.name) {
      Taro.getApp().notPrinter = true
      return router.back()
    }
  }, 1000)
}

const minDisabled = () => {
  return Number(pageParams.val) <= 1
}
const maxDisabled = () => {
  return Number(pageParams.val) >= pageParams.total
}
const handleMinus = () => {
  if (minDisabled()) {
    showToast('已经是第一张了')
    return
  }
  pageParams.val = Number(pageParams.val) - 1
  initPrintPreview(pageParams.val - 1)
}
const handlePlus = () => {
  if (maxDisabled()) {
    showToast('没有更多了')
    return
  }
  pageParams.val = Number(pageParams.val) + 1
  initPrintPreview(pageParams.val - 1)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
