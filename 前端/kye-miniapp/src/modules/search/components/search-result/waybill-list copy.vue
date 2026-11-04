<template>
  <view class="waybill-search-item__Warp">
    <view
      class="waybill-search-item"
      v-for="(data, index) in state.search.waybill"
      :key="index"
      @tap="handleWaybillCardTap(data)"
    >
      <WaybillCard
        :waybillData="data"
        @touchstart="null"
        @labelClick="() => handleWaybillLabel(data)"
        @limitRemind="() => onConfirmBarClick(data)"
        @applyStatusClick="() => handleApplyStatus(data)"
      >
        <template #headRight>
          <view class="waybill-card-head-right">
            <view>
              <view
                v-if="+data?.waybill?.baseInfo?.pickupMode !== 10 && getBarCodeBtn(data)"
                class="right-extra-btn"
                @click.stop="openBarCode(data?.waybill?.baseInfo?.waybillNumber)"
              >
                <KyImage src="https://ic-img.ky-express.com/default/20250724_85055_!!1753359202402_48_48.png" />
                <text class="right-extra-btn-text">寄件码</text>
              </view>
              <view v-if="getCustomerBtn(data)" class="right-extra-btn" @click.stop="openCustomerService(data)">
                <KyImage src="https://ic-img.ky-express.com/netc/20250724_49645_!!1753364856395_48_48.png" />
                <text class="right-extra-btn-text">客服</text>
              </view>
            </view>
            <view>
              <ky-tag
                v-if="data?.waybill?.baseInfo?.waybillType === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >回单</ky-tag
              >
              <ky-tag
                v-if="data?.waybill?.baseInfo?.waybillType === 30"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >发票</ky-tag
              >
              <ky-tag
                v-if="data?.functionInfo?.waybillRoundFlag?.operateStatus === 10"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >去程单</ky-tag
              >
              <ky-tag
                v-if="data?.functionInfo?.waybillRoundFlag?.operateStatus === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >返程单</ky-tag
              >
              <!-- 这里与后端约定好，取data?.waybill?.baseInfo?.deliveryMode，
                        后端：文豪
                       +data?.waybill?.baseInfo?.deliveryMode === 10"
                       -->
              <ky-tag
                v-if="+data?.waybill?.baseInfo?.deliveryMode === 10"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >网点自提</ky-tag
              >
              <ky-tag
                v-if="+data?.waybill?.baseInfo?.pickupMode === 10 && +data?.waybill?.baseInfo?.waybillStatus === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >服务点自寄</ky-tag
              >
            </view>
          </view>
        </template>
      </WaybillCard>
    </view>
    <!-- 寄件码弹窗 -->
    <BarcodePopup ref="barcodePopupRef" />

    <!-- 运单标签 -->
    <TagPopup
      v-model:show="showTagPopup"
      ref="tagPopupRef"
      :loading="tagSubmitLoading"
      :waybill="tagCurrentWaybill"
      @cancel="showTagPopup = false"
      @confirm="updateTagHandle"
    ></TagPopup>
  </view>
</template>

<script setup lang="ts">
import './waybill-list.scss'

import Taro, { navigateTo, useDidHide, useDidShow } from '@tarojs/taro'
import { ref, onUnmounted, onMounted } from 'vue'

import KyImage from '@public/components/base/ky-image/index.vue'
import WaybillCard from '@public/components/business/waybill-card/index.vue'
import WaybillSearchHeader from '@/modules/waybill-build/components/waybill-search/components/waybill-search-header/index.vue'
import BarcodePopup from '@/modules/waybill-build/components/waybill-search/components/barcode-popup/index.vue'
import { updateTag, getMobileExportStatus } from '@/modules/waybill-build/apis/waybill-search/index'
import { queryWarehousingPrice, newBatchUpdateClearanceStorage } from '@/modules/waybill-build/apis/waybill-route/index'
import type { ISearchWeb } from '@/modules/waybill-build/apis/waybill-search/types'
import { getBaseUrl, getInternationalDetailUrl } from '@/modules/waybill-build/constants/externalLink'
import { openURL } from '@modules/webview/utils'
import TagPopup from '@/modules/waybill-build/components/waybill-search/components/tag-popup/index.vue'
import { onStorageTokenChange, offStorageTokenChange } from '@public/storage'
import { showDialog } from '@kye-netc/kye-miniui'
import { getToken } from '@public/storage'

import { suspendedConfigMap } from '@/modules/waybill-build/constants/suspended'
import { WAYBILL_TYPE } from '@/modules/waybill-build/constants/waybillSearch'
import { useCustomerCodeEvent } from '@public/storage/hooks/useCustomerCodeEvent'

import { useSearchContext } from '../../context'
import { report_CLK_event } from '@/public/utils'
// 判断当前是否是微信的环境
const isALIPAY: boolean = Taro.getEnv() === Taro.ENV_TYPE.ALIPAY

const { state } = useSearchContext()
/* 客户编码code-变更事件*/
const { onRefGlobalDataCustomerCodeChange, offRefGlobalDataCustomerCodeChange } = useCustomerCodeEvent()

const handleWaybillCardTap = (params: any) => {
  const waybillNumber = params.waybill?.baseInfo?.waybillNumber || ''
  const orderNumber = params.waybill?.baseInfo?.orderNumber || ''

  report_CLK_event('clk_home_search_card_v1', {
    event_code: 'clk_home_search_card_v1',
    page_code: 'page_home_head_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_点击',
    region_name: '搜索栏',
    search_card: '运单',
    work_id: state.workId,
  })

  if (+params.waybill.baseInfo.waybillBusinessRange === WAYBILL_TYPE.国际件) {
    const link = getInternationalDetailUrl()
    openURL(`${link}/#/waybill-details?waybillNo=${waybillNumber}`, { needLogin: true })
    return
  }

  if (+params.waybill.baseInfo.waybillStatus === 40) {
    navigateTo({
      url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${waybillNumber}`,
    })
    return
  }
  navigateTo({
    url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${waybillNumber}&orderNumber=${
      waybillNumber ? '' : orderNumber
    }`,
  })
}

const noLogin = ref<boolean>(!getToken())
const waybillSearchHeaderRef = ref<InstanceType<typeof WaybillSearchHeader>>()
const waybillSearchListRef = ref<any>(null)
const barcodePopupRef = ref<InstanceType<typeof BarcodePopup>>()

/** 打开寄件码弹窗 */
const openBarCode = (waybillNumber: string) => {
  barcodePopupRef.value?.openPopup(waybillNumber)
}

/** 打开客服弹窗 */
const openCustomerService = (params: string) => {
  console.log('打开客服弹窗', params)
  let waybillNumber = params?.waybill?.baseInfo?.waybillNumber
  // Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${waybillNumber}&type=reminder` })
  Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${waybillNumber}&type=''` })
}

/**
 * 是否显示客服按钮
 */
const getCustomerBtn = (params: ISearchWeb) => {
  const { functionInfo } = params || {}
  return functionInfo.hasCustomerService?.showStatus && !isALIPAY
}

/**
 * 是否显示寄件码按钮
 */
const getBarCodeBtn = (params: ISearchWeb) => {
  const { functionInfo } = params || {}
  return functionInfo.hasDeliveryCode?.showStatus
}

const showTagPopup = ref(false)
const tagSubmitLoading = ref(false)
const tagCurrentWaybill = ref({})
/** 运单标签 */
const handleWaybillLabel = (params: any) => {
  console.log('运单标签', params)
  tagCurrentWaybill.value = {
    ...params?.waybill?.baseInfo,
    showLabel: params?.functionInfo?.showLabelFlag || '',
  }
  showTagPopup.value = true
}

/**货好时间更改 */
const handleApplyStatus = (params: any) => {
  console.log('更改货好时间：', params, getBaseUrl())
  // const webViewUrl = `${getBaseUrl()}/change-feedback-new-version-one.html#/goods-home?batchNo=${}`
}

const updateTagHandle = async (item: any) => {
  tagSubmitLoading.value = true
  const { waybillNumber, showLabel, orderNumber } = item
  try {
    await updateTag({
      waybillNumber,
      label: showLabel,
    })
    showTagPopup.value = false
    Taro.showToast({
      title: '保存成功',
      icon: 'none',
    })
    // 更新数组某一项
    // emit('updateItem', item)
    const obj = waybillSearchListRef.value.allData.find((v) => {
      const { waybill } = v || {}
      const { baseInfo } = waybill || {}
      return (
        (waybillNumber && baseInfo?.waybillNumber === waybillNumber) ||
        (orderNumber && baseInfo.orderNumber === orderNumber)
      )
    })
    if (obj) {
      obj.functionInfo.showLabelFlag.showText = showLabel
    }
  } finally {
    tagSubmitLoading.value = false
  }
}

const suspendedList = ref([])
const isPolling = ref(true) // 是否轮询
const taskTimerMap = ref(new Map())
const pollingTime = ref(1000) // 轮询延迟时间
// 成功弹框点击确认
const handleSuccessDialog = () => {
  const exportSuccessParams = Taro.getApp().exportSuccessParams
  const taskId = exportSuccessParams?.taskId
  const exportType = exportSuccessParams?.taskId
  if (suspendedList.value.length < 5 && taskId && exportType !== 2) {
    isPolling.value = true
    pollingGetUnDownTask(taskId)
  }
}

const pollingGetUnDownTask = (id: string) => {
  if (!isPolling.value) return
  getMobileExportStatus({
    id,
  }).then(async (res) => {
    if (res.code === 0) {
      const status = res.data?.exportStatus
      const taskId = res.data?.id

      if (!status) return

      const targetItem = suspendedConfigMap[status]

      // 更新导出数组状态
      if (targetItem) {
        const newItem = { ...targetItem, id }
        const existingIndex = suspendedList.value.findIndex((ele) => ele.id === id)

        existingIndex > -1
          ? suspendedList.value.splice(existingIndex, 1, newItem)
          : suspendedList.value.unshift(newItem)
      }

      if (status !== -1) return
      // 清理当前任务的历史定时器（可选）
      if (taskTimerMap.value.has(taskId)) {
        clearTimeout(taskTimerMap.value.get(taskId))
      }

      // 启动新轮询并记录定时器 ID
      const timerId = setTimeout(() => {
        pollingGetUnDownTask(taskId)
      }, pollingTime.value)

      taskTimerMap.value.set(taskId, timerId)
    }
  })
}

const clearPolling = () => {
  isPolling.value = false
  suspendedList.value = []
}

const handlerMessage = (tips, tipsH5, value) => {
  const str = tipsH5 || tips
  if (!str) return
  return str.replace(new RegExp(`(${value})`, 'ig'), "<span class='high-amount'>$1</span>")
}
const updateClearanceStorage = (type: string, waybillStatus, waybillNumber) => {
  const params = {
    waybillStatus: waybillStatus,
    wareHouseStatus: [
      {
        adjustPriceFlag: '10',
        clearanceStorageFlag: type,
        waybillNumber: waybillNumber,
      },
    ],
    sourceId: 10, //请求来源 10 列表 20 路由
  }
  newBatchUpdateClearanceStorage(params).then(() => {
    if (type === '10') {
      // showLimitRemindConfirmBar.value = false
    }
  })
}
/**
 * 确认横条，点击
 * isNeedPop: 刚进页面调用传true，否则为false
 */
const onConfirmBarClick = async (params: any) => {
  try {
    const { data } = await queryWarehousingPrice({
      waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
      requestSource: 10, //请求来源 10 列表 20 路由
    })

    /**
     * totalAmount 报关手续费
     * excTotalAmount 异常操作费
     */
    const { totalAmount } = data || {}
    if (!totalAmount) {
      // TODO: 异常提示
      return
    }

    let message = ''
    // 报关提醒
    const str1 = handlerMessage(data?.fenceTips, data?.fenceTipsText, data?.totalAmount)
    const str2 = handlerMessage(data?.excTips, data?.excTipsText, data?.excTotalAmount)
    message = `<div class="tips ql-editor"><div class="content">${str1}</div></div><div class="tips ql-editor"><div class="content">${str2}</div></div>`
    showDialog({
      parentClassName: 'common-search-page',
      zIndex: 1000,
      title: '收费提示',
      message,
      cancelButtonText: '不同意',
      confirmButtonText: '同意',
      showCancelButton: true,
    })
      .then(() => {
        updateClearanceStorage('10', params?.waybill?.baseInfo?.waybillStatus, params?.waybill?.baseInfo?.waybillNumber)
      })
      .catch(() => {
        updateClearanceStorage('20', params?.waybill?.baseInfo?.waybillStatus, params?.waybill?.baseInfo?.waybillNumber)
      })
  } catch (error) {
    console.log('err', error)
    if (error.code === 80013) {
      // showLimitRemindConfirmBar.value = false
    }
  }
}

const handleCustomerCodeChange = () => {
  waybillSearchListRef.value?.init()
}

useDidHide(() => {
  clearPolling()
})

onMounted(() => {
  const exportSuccessParams = Taro.getApp().exportSuccessParams
  const taskId = exportSuccessParams?.taskId
  if (taskId) {
    handleSuccessDialog()
  }
  onStorageTokenChange((data) => {
    noLogin.value = !data.value
    // token变化需要重新刷新数据
    waybillSearchListRef.value?.init()
    waybillSearchHeaderRef.value?.handleShowExportDrawer(false)
  })
  onRefGlobalDataCustomerCodeChange(handleCustomerCodeChange)
})

onUnmounted(() => {
  offStorageTokenChange()
  offRefGlobalDataCustomerCodeChange(handleCustomerCodeChange)
})

useDidShow(() => {
  const isCancelWaybill = Taro.getApp().isCancelWaybill
  if (isCancelWaybill) {
    waybillSearchListRef.value?.init()
    Taro.getApp().isCancelWaybill = null
  }
})
</script>
