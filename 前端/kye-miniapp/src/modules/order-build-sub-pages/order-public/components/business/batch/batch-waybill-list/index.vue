<template>
  <div class="batch-waybill-list">
    <div class="batch-waybill-list-content">
      <div
        :class="`waybill-item font-special ${item.waybillNumber}`"
        v-for="(item, index) in batchWaybillInfoList"
        :key="index"
      >
        <div :class="`waybill-item-left-icon font-level4 ${handleItemDisbaled(item?.restrictData) ? 'disabled' : ''}`">
          收{{ index + 1 }}
        </div>
        <div :class="`waybill-item-content ${handleItemDisbaled(item?.restrictData) ? 'item-gray' : ''}`">
          <div class="waybill-item-receive" data-validate="receive">
            <div class="waybill-item-receive-head flex items-center">
              <template
                v-if="
                  item?.waybillInfo?.receive?.person &&
                  (item?.waybillInfo?.receive?.mobile || item?.waybillInfo?.receive?.telephone)
                "
              >
                <div class="person-content font-level2 item-gray-text" @click="handleToReceivePage(item.waybillNumber)">
                  {{ item?.waybillInfo?.receive?.person }}
                </div>
                <div
                  class="waybill-item-receive-head-phone font-level2 item-gray-text"
                  @click="handleToReceivePage(item.waybillNumber)"
                >
                  {{
                    item?.waybillInfo?.receive?.mobile ||
                    `${item?.waybillInfo?.receive?.telephone}${
                      item?.waybillInfo?.receive?.extension ? `-${item?.waybillInfo?.receive?.extension}` : ''
                    }`
                  }}
                </div>
                <span class="waybill-item-receive-head-space"></span>
              </template>
              <template v-else>
                <div class="waybill-item-receive-head-tips" @click="handleToReceivePage(item.waybillNumber)">
                  请完善收件人姓名手机号
                </div>
              </template>
              <div class="waybill-item-receive-head-delete">
                <KyLoading text=" " />
                <SvgIcon
                  name="icon-delete-black"
                  class="waybill-item-receive-head-delete-icon item-gray-text"
                  @click="handleDeleteWaybill(item.waybillId || '', item.waybillNumber)"
                ></SvgIcon>
              </div>
            </div>
            <div
              class="waybill-item-receive-address color-assist item-gray-text"
              @click="handleToReceivePage(item.waybillNumber)"
            >
              {{ item?.waybillInfo?.receive?.province }}{{ item?.waybillInfo?.receive?.city
              }}{{ item?.waybillInfo?.receive?.county }}{{ item?.waybillInfo?.receive?.detailAddress }}
            </div>
          </div>
          <div class="waybill-item-info">
            <div class="waybill-item-info-content" data-validate="batchWaybillInfoList">
              <div
                class="waybill-item-info-content-cell flex items-center"
                @click="handleToWaybillInfo(item.waybillInfo?.waybillNumber, index)"
                :class="item.waybillNumber"
                data-validate="batchWaybillList"
              >
                <div class="cell-label flex items-center item-gray-text">
                  运单信息
                  <SvgIcon :name="requiredName(item?.restrictData)" class="waybill-item-cell-required"></SvgIcon>
                </div>
                <div
                  :class="`cell-value ml-32 ${
                    comboWaybillInfo(item?.waybillInfo, item?.waybillId) !== '' ? 'blod-text' : ''
                  }`"
                >
                  <span class="info-text" v-if="comboWaybillInfo(item?.waybillInfo, item?.waybillId) !== ''">{{
                    comboWaybillInfo(item?.waybillInfo, item?.waybillId)
                  }}</span>
                  <span v-else class="info-text color-assist placeholder">请填写</span>
                </div>
                <SvgIcon
                  :name="`${handleItemDisbaled(item?.restrictData) ? 'right-arrow-gray' : 'right-arrow'}`"
                ></SvgIcon>
              </div>
              <CouponCell :item="item" :gray="handleItemDisbaled(item?.restrictData)" />
              <EstimatedCostCell
                :item="item"
                :gray="handleItemDisbaled(item?.restrictData)"
                v-click-report="{
                  eventCode: 'clk_express_receive_cost_v1',
                  otherParams: {
                    waybill_number: item.waybillNumber,
                    no: index + 1,
                  },
                }"
              ></EstimatedCostCell>
            </div>
          </div>
          <!-- 取派限制 -->
          <template v-if="addressLimit(item.restrictData)">
            <div class="waybill-item-restrict-icon">
              <img
                v-if="
                  item?.restrictData?.addressRestrict?.limitReason &&
                  imgMaps[item?.restrictData?.addressRestrict?.limitReason]
                "
                class="icon ticket-limit__icon"
                :src="imgMaps[item?.restrictData?.addressRestrict?.limitReason]"
              />
            </div>
            <div class="waybill-item-restrict" v-if="item?.restrictData?.addressRestrict?.receiverAddressPlainBar">
              <div
                :class="`waybill-item-restrict-content restrict-content-${item?.restrictData?.addressRestrict?.limitReason}`"
              >
                {{ item?.restrictData?.addressRestrict?.receiverAddressPlainBar }}
              </div>
            </div>
          </template>
          <!-- 取派提醒 -->
          <template v-if="item?.restrictData?.addressRestrict?.restrictedType === LimitBlockType.提醒">
            <div class="waybill-item-restrict" v-if="item?.restrictData?.addressRestrict?.receiverAddressPlainBar">
              <div
                :class="`waybill-item-restrict-content restrict-content-${item?.restrictData?.addressRestrict?.limitReason}`"
              >
                {{ item?.restrictData?.addressRestrict?.receiverAddressPlainBar }}
              </div>
              <div class="restrict-content-delete" @click="() => handleDeleteRestrict(item?.waybillId)">
                <SvgIcon class="icon" name="restrict-delete"></SvgIcon>
              </div>
            </div>
          </template>
          <!-- 调价限制 -->
          <template v-if="isLimitPrice(item?.restrictData)">
            <div class="waybill-item-restrict-icon">
              <SvgIcon name="restrict-limit-icon-80" class="icon ticket-limit__icon"></SvgIcon></div
          ></template>
          <div
            class="waybill-item-restrict font-level4 color-error"
            v-if="item?.moduleDimension?.receive?.stairFeeTips"
          >
            <SvgIcon name="icon-tip-error"></SvgIcon>
            {{ item?.moduleDimension?.receive?.stairFeeTips }}
          </div>
          <!-- 地址不准确等创可贴 -->
          <div
            class="waybill-item-restrict font-level4 color-error line-height-32"
            v-if="receiveCheckResultItem(item.checkResultList)"
            v-html="receiveCheckResultItem(item.checkResultList)?.content"
          ></div>
        </div>
        <div class="receive-mask" v-if="showReceiveMask(item)">
          <div class="receive-mask-head-delete">
            <SvgIcon
              name="icon-delete-black"
              class="waybill-item-receive-head-delete-icon item-gray-text"
              @click="handleDeleteWaybill(item.waybillId || '', item.waybillNumber)"
            ></SvgIcon>
          </div>
          <div class="receive-mask-content" @click="handleToReceivePage(item.waybillNumber)">
            <div class="receive-mask-content-tip">
              <SvgIcon name="icon-tip-error" class="icon-tips"></SvgIcon>
              <span>收件人信息不全，</span>
              <span class="receive-mask-go"
                >前往补全<SvgIcon name="right-arrow-blue" class="right-arrow-blue"></SvgIcon
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import router from '@order-public-sub-public/router'
import EstimatedCostCell from '@order-public-sub-public/components/business/estimated-cost/components/cell.vue'
import CouponCell from '@order-public-sub-public/components/business/coupon/cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import {
  Module,
  OrderInfo,
  RestrictData,
  PickModule,
  GoodsTimeConfig,
  CheckDetail,
} from '@order-public-sub-public/types'
import { BatchProcessResultResponse, WaybillInfoList } from '@order-public-sub-public/apis/batch/types'
import { showSkeleton } from '@order-public-sub-public/utils/skeleton'
import {
  OrderPageType,
  Address,
  LimitBlockType,
  YesOrNoNumber,
  ModuleType,
  MatchType,
  CheckShowType,
} from '@order-public-sub-public/constants'
import { deleteWaybillInfo } from '@order-public-sub-public/apis/batch/index'
import { batchProcessTimer } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcessUtils'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { PayModeObj } from '@order-public-sub-public/components/business/pay-mode/type'
import { initData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { initBatchUpdataOneStore } from '@order-public-sub-root-pages/order-single/hooks/useBatchInit'
import { getBatchNightFeeTip } from '@order-public-sub-public/components/business/goods-time/hooks/useBatchNightFeeTip'
import { checkSenderAddressRestrict, showReceiveMask } from './hooks/utils'
import { imgMaps } from './maps'
import { checkReceive, checkGoodsTime, isWaybillEmpty } from './hooks/useValidate'
import { showDialog, showToast } from '@order-public-sub-public/hooks/useShowToast'
import { updateWaybillNumberCommonReport } from '@order-public-sub-public/components/business/batch/batch-waybill-list/report/report'

import { useEstimateFeeResult } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { addMasker, removeMasker } from '@order-public-sub-public/hooks/useMasker'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { estimateFeeProcessPolling } = useEstimateFeeResult()
const { startConfig } = useInitMulitFielConfigChild()
const batchWaybillInfoList = computed(() => piniaStore.order.batchWaybillInfoList)

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const comboWaybillInfo = (data: OrderInfo, waybillId: string | undefined) => {
  let result = []
  if (data) {
    if (data?.payMode?.payMode && payModeCurrentVisible(waybillId)) {
      result.push(PayModeObj[data?.payMode?.payMode])
    }

    const serviceModeConfig = piniaStore.schema.moduleConfigData(ModuleType['服务方式'], true)

    if (serviceModeConfig.visible) {
      data?.serviceMode?.serviceMode && result.push(serviceTypeName(data?.serviceMode?.serviceMode, waybillId))
    }

    const productInfoConfig = piniaStore.schema.moduleConfigData(ModuleType['货物信息'], true)

    if (productInfoConfig.visible) {
      data?.productInfo?.goodsType && result.push(data?.productInfo?.goodsType)
      data?.productInfo?.count && result.push(`${data?.productInfo?.count}件`)
      data?.productInfo?.actualWeight && result.push(`${data?.productInfo?.actualWeight}kg`)
    }
  }
  return result.join('/')
}

const requiredName = (restrictData: RestrictData) => {
  return isLimitPrice(restrictData) || addressLimit(restrictData) ? 'required-grey' : 'required'
}

const isLimitPrice = (restrictData: RestrictData) => {
  if (!restrictData) {
    return false
  }

  return (
    restrictData?.adjustPrice?.confirmResult === YesOrNoNumber.NO ||
    restrictData?.adjustPrice?.limitedOrderFlag === LimitBlockType.限制
  )
}

const serviceTypeName = (selectServiceMode: string, waybillId: string | undefined) => {
  if (waybillId) {
    const serviceSelect = currentService(selectServiceMode, waybillId)
    const hasInvalid = serviceSelect?.restrictFlag === '10'
    if (!serviceSelect || hasInvalid) {
      return ''
    }
    return serviceSelect.serviceTypeName || ''
  }
}

//当前服务方式
const currentService = (serviceMode: string, waybillId: string) => {
  const service = serviceTypes(waybillId).find((i) => i.serviceTypeCode === serviceMode)
  if (!service) {
    return {
      serviceTypeCode: '',
      restrictFlag: '',
      serviceTypeName: '',
    }
  }
  return service
}

//获取服务方式数据
const serviceMode = (waybillId: string) => {
  const moduleDimensionData = piniaStore.order.batchWaybillInfoList.filter((item) => item.waybillId === waybillId)?.[0]
    ?.moduleDimension?.serviceMode
  return moduleDimensionData || []
}
//获取服务方式列表
const serviceTypes = (waybillId: string) => {
  const { serviceTypes = [] } = serviceMode(waybillId)
  return serviceTypes || []
}

// 付款方式是否可用
const payModeCurrentVisible = (waybillId: string | undefined) => {
  let result = true
  const moduleDimensionData = piniaStore.order.batchWaybillInfoList.filter((item) => item.waybillId === waybillId)?.[0]
    ?.moduleDimension?.payMode?.payMethodList

  if (moduleDimensionData && moduleDimensionData.length > 0) {
    result = moduleDimensionData.filter((item) => item.visible === true).length > 0
  }

  return result
}

/**
 * @description 删除单条运单 #451450 增加删除时的交互
 * @param waybillId
 * @param waybillNumber
 */
const handleDeleteWaybill = async (waybillId: string, waybillNumber: string) => {
  if (waybillId) {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList

    let curOrderInfo,
      result: WaybillInfoList[] = []
    for (const item of batchWaybillInfoList) {
      if (item?.waybillId === waybillId) {
        curOrderInfo = item.waybillInfo
      } else {
        result.push(item)
      }
    }

    if (!isWaybillEmpty(curOrderInfo as OrderInfo)) {
      const showDialogParams = {
        title: '确定删除该收件人吗？',
        message: '删除后，该收件人运单信息不会保留',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: '我再想想',
        confirmButtonText: '删除',
      }
      await showDialog(showDialogParams)
    }
    addMasker('正在删除中')
    const { data } = await deleteWaybillInfo([waybillId])

    // DELETE_ESTIMATE_RESPONSES
    piniaStore.globalData.deleteEstimateResponses({
      data: undefined,
      waybillNumber,
      orderPageType: orderPageType.value,
    })
    if (data?.taskId) {
      // 批量删除单条，如果有taskId 也需要轮询费用
      await estimateFeeProcessPolling({
        taskId: data?.taskId,
        batchProcessResponse: data as BatchProcessResultResponse,
        orderPageType: OrderPageType.批量寄,
      })
    } else {
      // 更新批量费用 SET_WAYBILL_ESTIMATED_COST
      piniaStore.globalData.setWaybillEstimatedCost({
        data: data?.estimateFeeResult as GetEstimateFeeByTaskIdResponse,
        orderPageType: orderPageType.value,
      })
    }
    removeMasker()

    getBatchNightFeeTip()

    // SET_BATCH_WAYBILL_INFO_LIST
    piniaStore.order.setBatchWaybillInfoList({
      waybillInfoList: result,
      orderPageType: orderPageType.value,
    })

    setTimeout(() => {
      showToast('删除成功')
    }, 200)
  }
}
let waybillInfoLoading = false //是否点击卡片，防止重复点击，尤其是有过程接口的时候
const handleToWaybillInfo = async (waybillNumber: string, index: number) => {
  if (waybillInfoLoading) {
    return
  }
  waybillInfoLoading = true
  try {
    if (checkSenderAddressRestrict()) {
      return
    }
    const goodsTimeConfig = piniaStore.schema.moduleConfigData(
      ModuleType['货好时间'],
      true,
    ) as PickModule<GoodsTimeConfig>
    if (goodsTimeConfig.visible) {
      // 检查货好时间是否有值
      await checkGoodsTime()
    }

    // 检查当前数据收件地址是否正常
    await checkReceive(waybillNumber)

    // 等待公共数据同步
    const processPromise = piniaStore.globalData.processPromise
    if (processPromise) {
      try {
        await processPromise
      } catch (error) {
        console.log(error)
      }
    }

    // 取消批量寄过程中接口调用
    batchProcessTimer.value && clearTimeout(batchProcessTimer.value)
    showSkeleton()

    initBatchUpdataOneStore(OrderPageType.批量寄单票, waybillNumber)
    // 更新orderPageType
    piniaStore.root.setOrderPageType(OrderPageType.批量寄单票)

    // 更新currentWaybillNumber
    piniaStore.root.setCurrentWaybillNumber(waybillNumber)
    //更新埋点的运单公共信息,并上报点击
    updateWaybillNumberCommonReport({
      waybillNumber,
      index: index + 1,
    })

    startConfig(tmpCacheKey.value || waybillNumber)
  } catch (e) {
    waybillInfoLoading = false
    console.error(e)
    return
  }
  waybillInfoLoading = false
  router.push({ name: 'order-batch-waybill', query: { waybillNumber } })
}

const handleToReceivePage = (waybillNumber: string) => {
  if (checkSenderAddressRestrict()) {
    return
  }
  const receiveData = piniaStore.order.batchWaybillInfoList?.filter((item) => item.waybillNumber === waybillNumber)?.[0]
    .waybillInfo?.receive

  initData(receiveData)

  // 更新currentWaybillNumber
  piniaStore.root.setCurrentWaybillNumber(waybillNumber)

  router.push({
    name: 'receive-page',
    query: {
      addressType: Address.RECEIVE_ADDRESS_TYPE,
      pageSource: 'page',
      waybillNumber: waybillNumber,
      batchType: 'modify',
    },
  })
}

/**
 * @description 调价限制和取派限制是否禁用
 * @param restrictData
 */
const handleItemDisbaled = (restrictData: RestrictData) => {
  if (!restrictData) {
    return false
  }

  // 取派限制
  const addressRestrictLimited = addressLimit(restrictData)

  // 调价限制
  const adjustPrice = isLimitPrice(restrictData)

  return addressRestrictLimited || adjustPrice
}

const handleDeleteRestrict = (waybillId: string | undefined) => {
  if (waybillId) {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList

    const result = batchWaybillInfoList.map((item) => {
      if (item.waybillId === waybillId) {
        return {
          ...item,
          restrictData: {
            ...item.restrictData,
            addressRestrict: { ...item.restrictData.addressRestrict, receiverAddressPlainBar: '' },
          },
        }
      }
      return item
    })

    piniaStore.order.setBatchWaybillInfoList({
      waybillInfoList: result as WaybillInfoList[],
      orderPageType: orderPageType.value,
    })
  }
}

/**
 * @description 取派限制判断条件,只有限制且不是寄件的管控才需要打标签
 * @param item
 */
const addressLimit = (restrictData: RestrictData) => {
  const addressRestrict = restrictData?.addressRestrict
  return addressRestrict?.restrictedType === LimitBlockType.限制 && addressRestrict?.matchType !== MatchType.寄件
}

/**
 * @description 创可贴数据
 * @param item
 */
const receiveCheckResultItem = (item: CheckDetail[]) => {
  return item.find((result) => result.key === 'batchWaybillList' && result.showType === CheckShowType.BAR)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
