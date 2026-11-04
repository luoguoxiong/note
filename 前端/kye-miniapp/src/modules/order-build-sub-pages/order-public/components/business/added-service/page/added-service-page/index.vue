<template>
  <ky-navbar :leftArrow="true" title="增值服务" v-if="isWxMiniApp"></ky-navbar>
  <div class="added-service-intro flex flex-items-center" @click="handleClickTips">
    增值服务介绍<SvgIcon name="tip-label-color" class="font-level4 ml-8" />
  </div>
  <view class="p-a-service">
    <scroll-view :scroll-y="true" class="scroll-wrap" :showScrollbar="false">
      <div class="p-a-service-container" id="p-a-service-container">
        <ClearanceWarehouse module-style="popup" />
        <div class="container-block p-a-service-block">
          <template v-for="item in propsData?.fieldsConfig" :key="item.name">
            <div
              class="added-service-bottom-page-receipt"
              v-if="item.name === 'recoveryReceipt' && item.visible && !starting"
            >
              <ReceiptService
                v-bind="item"
                :moduleStyle="'page'"
                :showCheckErrorTip="showCheckErrorTip"
                @receiptProviderClick="showCheckErrorTip = false"
              />
            </div>
            <div
              class="added-service-page-collection mt-16"
              v-if="item.name === 'collectionPayment' && item.visible && !starting"
            >
              <CollectPayment v-bind="item" :moduleStyle="'page'" />
            </div>
            <div
              class="added-service-page-package mt-16"
              v-if="item.name === 'packageService' && item.visible && !starting"
            >
              <PackageService v-bind="item" :moduleStyle="'page'" />
            </div>
          </template>
          <div
            class="dismantling-wooden-frame-page"
            v-if="defaultModuleDimensionData?.dismantlingWoodenFrame?.visible && !starting"
          >
            <DismantlingWoodenFrame></DismantlingWoodenFrame>
          </div>
          <div
            class="dispatchNotice-warpper mt-16"
            v-if="goodsControlConfig && defaultModuleDimensionData?.goodsControl?.visible"
          >
            <GoodsControl v-bind="goodsControlConfig" :moduleStyle="'page'" />
          </div>
        </div>
      </div>
      <div class="display-none-bg" v-if="internalState.btnLoading"></div>
    </scroll-view>
  </view>
  <PageCommon pageValidateName="addedService" />
  <BottomPopupBtn
    @click="handleConfirm"
    :button-loading="internalState.btnLoading"
    :isUnfold="false"
    class="added-service-page-btn"
    :moduleStyle="ModuleStyle.跳转"
  />
  <BottomPopupDetail />
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, watch, ref } from 'vue'
import Taro, { useUnload } from '@tarojs/taro'

import { isWxMiniApp } from '@/public/utils'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../../hooks/useOrderWarehouseState'
import {
  useAiValidate,
  useCollectionAmount,
  useCollectionFee,
  useDismantlingWoodenFrame,
  useGoodsControl,
  useOtherWoodenFrame,
  useReceiptCheckType,
  useReceiptCount,
  useReceiptFlag,
  useReceiptProvider,
  useReceiptUrgentReturn,
  useWoodenFrame,
} from '../../hooks/useState'
import { showCheckErrorTip } from '../../hooks/state'

import {
  AddedService,
  AddedServiceConfig,
  AddedServiceDimension,
  AreaAttributeDimension,
} from '@order-public-sub-public/types'
import {
  AreaAttributeType,
  CheckAfterSubmitType,
  LimitResult,
  ModuleStyle,
  ModuleType,
  ReceiptProviderType,
  ReceiptType,
  Channel,
  MaterialSource,
} from '@order-public-sub-public/constants'

import ClearanceWarehouse from '../../components/clearance-warehouse/index.vue'
import DismantlingWoodenFrame from '../../components/dismantling-wooden-frame/index.vue'
import ReceiptService from '../../components/receipt-service/index.vue'
import CollectPayment from '../../components/collect-payment/index.vue'
import PackageService from '../../components/package-service/index.vue'
import GoodsControl from '../../components/goods-control/index.vue'
import BottomPopupBtn from '../../components/bottom-popup-btn/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopupDetail from '../../components/bottom-popup-detail/index.vue'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'

import { useUpdateDimensionStore, useUpdateOrderStore } from '../../hooks/useModuleStore'
import { useValidate } from '../../hooks/useValidate'
import { updateWarehouse } from '@order-public-sub-public/validate/limit'
import { useRouter } from '@order-public-sub-public/vue-router/index'
// import { PackageServiceTypeEnum, ReceiptProviderTypeEnum, ReceiptTypeEnum, goodsControlTypeEnum } from '../../types'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { cloneDeep } from 'lodash-es'
// import { clk_express_increment_desc_v1 } from '../../hooks/report'
import { getChannel } from '@order-public-sub-public/configs'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const router = useRouter()
const propsData = computed(() => piniaStore.schema.moduleConfigData(ModuleType['增值服务']))
const { startConfig, removeLast, submitConfig } = useInitMulitFielConfigChild()

const goodsControlConfig = computed(() =>
  propsData.value.fieldsConfig?.find((item) => item.name === 'dispatchNotice' && item.visible),
)

const { receiptFlag, setReceiptFlag } = useReceiptFlag()
const { receiptProvider, setReceiptProvider } = useReceiptProvider()
const { receiptCheckType, setReceiptCheckType } = useReceiptCheckType()
const { receiptUrgentReturn, setReceiptUrgentReturn } = useReceiptUrgentReturn()
const { receiptCount, setReceiptCount } = useReceiptCount()
const { collectionAmount, setCollectionAmount } = useCollectionAmount()
const { collectionFee, setCollectionFee } = useCollectionFee()
const { woodenFrame, setWoodenFrame } = useWoodenFrame()
const { otherWoodFrameList, setOtherWoodenFrame } = useOtherWoodenFrame()
const { goodsControl, setGoodsControl } = useGoodsControl()
const { orderWarehouseIn, setOrderWarehouseIn } = useOrderWarehouseIn()
const { orderWarehouseOut, setOrderWarehouseOut } = useOrderWarehouseOut()
const { setAiValidate } = useAiValidate()
const { dismantlingWoodenFrame, setDismantlingWoodenFrame } = useDismantlingWoodenFrame()

const { useAddedServiceValidate, useReceiptProviderValidate } = useValidate()

const internalState = reactive({
  stepperKey: 0,
  btnLoading: false,
  clickSubmit: false,
})

const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['增值服务'])
})

const defaultModuleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData?.clearanceWarehouse
  return restrictStoreData
})

const areaAttribute = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature)

/**
 * @description 处理回单
 */
const initReceipt = () => {
  setReceiptFlag(defaultModuleFormData.value?.receiptFlag || '')
  setReceiptProvider(defaultModuleFormData.value?.receiptProvider || '')
  setReceiptCheckType(defaultModuleFormData.value?.receiptCheckType || [])
  setReceiptUrgentReturn(defaultModuleFormData.value?.receiptUrgentReturn || 'notUrgent')
  // 跨越代打要将回单份数设置为null
  if (defaultModuleFormData.value?.receiptProvider === ReceiptProviderType['KYEPINCHHIT']) {
    setReceiptCount(null)
  } else {
    if (defaultModuleFormData.value?.receiptFlag && defaultModuleFormData.value?.receiptFlag !== ReceiptType.NONE) {
      setReceiptCount(defaultModuleFormData.value?.receiptCount || 1)
    } else {
      setReceiptCount(null)
    }
  }
}

/**
 * @description 处理报关出入仓
 */
const initOrderWareHouse = () => {
  if (restrictData.value?.sendAdjustFlag === '10' && restrictData.value?.sendConfirmResult === 10) {
    setOrderWarehouseOut(true)
  } else {
    setOrderWarehouseOut(false)
  }
  if (restrictData.value?.endAdjustFlag === '10' && restrictData.value?.endConfirmResult === 10) {
    setOrderWarehouseIn(true)
  } else {
    setOrderWarehouseIn(false)
  }
}
/**
 * @description 处理代收货款
 */
const initCollectionAmount = () => {
  if (areaAttribute.value === AreaAttributeType['自营区']) {
    setCollectionAmount(defaultModuleFormData.value?.collectionAmount || '')
  } else {
    if (defaultModuleFormData.value?.collectionAmount) {
      setCollectionAmount(defaultModuleFormData.value?.collectionAmount)
    } else {
      setCollectionAmount('')
    }
  }
  if (defaultModuleDimensionData.value) {
    setCollectionFee(defaultModuleDimensionData.value?.collectionAmount?.collectionFee)
  }
}
/**
 * @description 根据运单信息设置本地数据
 */
const initStateData = () => {
  if (defaultModuleFormData.value) {
    initReceipt()
    initCollectionAmount()
    setWoodenFrame(defaultModuleFormData.value?.woodenFrame || '')
    const otherWoodenFrameList = defaultModuleFormData.value?.otherWoodFrameList || []
    setOtherWoodenFrame(cloneDeep(otherWoodenFrameList))
    setGoodsControl(defaultModuleFormData.value?.goodsControl || '')
    setDismantlingWoodenFrame(defaultModuleFormData.value?.dismantlingWoodenFrame || '')
  }
  initOrderWareHouse()
}

watch(
  defaultModuleFormData,
  () => {
    initStateData()
  },
  { deep: true },
)

watch(defaultModuleDimensionData, () => {
  if (defaultModuleDimensionData.value) {
    setCollectionFee(defaultModuleDimensionData.value?.collectionAmount?.collectionFee)

    if (defaultModuleDimensionData.value?.aiTips) {
      closeTippy()
      setAiValidate(false)
    } else {
      setAiValidate(true)
    }
  }
})

/**
 * @description 组装上报报关出入仓入参
 */
const getWareHouseInOrOut = () => {
  let warehouseInOrOut = []
  if (restrictData.value?.sendAdjustFlag === '10') {
    warehouseInOrOut.push({
      adjustBackType: CheckAfterSubmitType.报关出仓,
      adjustResult: orderWarehouseOut.value ? LimitResult.确认 : LimitResult.拒绝,
      adjustRespId: restrictData.value?.adjustRespId,
    })
  }
  if (restrictData.value?.endAdjustFlag === '10') {
    warehouseInOrOut.push({
      adjustBackType: CheckAfterSubmitType.报关入仓,
      adjustResult: orderWarehouseIn.value ? LimitResult.确认 : LimitResult.拒绝,
      adjustRespId: restrictData.value?.adjustRespId,
    })
  }
  return warehouseInOrOut
}

const reportSubmit = () => {
  // window.$umpOtherReport(
  //   'CLK',
  //   {
  //     eventCode: 'clk_express_increment_control_v1',
  //   },
  //   {
  //     button_name: '确定',
  //   },
  // )
  // window.$umpOtherReport(
  //   'OTHER',
  //   {
  //     eventCode: 'other_express_single_insurance_v1',
  //   },
  //   {
  //     is_receipt: receiptFlag.value ? '是' : '否',
  //     receipt_type: ReceiptTypeEnum[receiptFlag.value],
  //     receipt_provider: ReceiptProviderTypeEnum[receiptProvider.value],
  //     number_receipt: receiptCount.value?.toString(),
  //     if_payment_collection: collectionAmount.value ? '是' : '否',
  //     payment_collection: collectionAmount.value,
  //     if_packaging_services: woodenFrame.value ? '是' : '否',
  //     inform_type: goodsControlTypeEnum[goodsControl.value],
  //     packaging_services: PackageServiceTypeEnum[woodenFrame.value],
  //     request_result: '成功',
  //     failure_reason: '',
  //   },
  // )
}
// loading之前提交文件，loading 的时候不重复提交
// removeLast有300ms 关闭有动画 都要等这些结束
// internalState.btnLoading 接口也要等待
// 校验之前要submit
const isSubmitting = ref(false)
const isSubmittingPromise = ref()
const _submitConfig = () => {
  if (internalState.btnLoading === true || isSubmitting.value === true) return
  isSubmittingPromise.value = new Promise((resolve) => {
    try {
      submitConfig().then(() => {
        resolve(true)
      })
    } catch (error) {
      resolve(true)
    }
  })
}

/**
 * @description 确定提交
 */
const handleConfirm = async () => {
  _submitConfig()
  internalState.btnLoading = true
  internalState.clickSubmit = true
  isSubmitting.value = true
  const validateReceiptProviderRes = await useReceiptProviderValidate()
  if (!validateReceiptProviderRes.passed) {
    showCheckErrorTip.value = true
  }

  try {
    const warehouseInOrOut = getWareHouseInOrOut()
    if (warehouseInOrOut.length > 0) {
      await updateWarehouse(warehouseInOrOut)
    }
    // 电子回单需要清掉回单要求
    if (receiptFlag.value === ReceiptType['ELECTRON']) {
      setReceiptCheckType([])
    }
    await isSubmittingPromise.value
    // 校验
    await useAddedServiceValidate({ field: 'addedService', moduleStyleParmas: ModuleStyle.跳转 })
    useUpdateOrderStore({
      receiptFlag: receiptFlag.value as ReceiptType,
      receiptProvider: receiptProvider.value as ReceiptProviderType,
      receiptCheckType: receiptCheckType.value,
      receiptUrgentReturn: receiptUrgentReturn.value,
      receiptCount: receiptCount.value,
      collectionAmount: collectionAmount.value,
      goodsControl: goodsControl.value,
      woodenFrame: woodenFrame.value,
      otherWoodFrameList: otherWoodFrameList.value,
      dismantlingWoodenFrame: dismantlingWoodenFrame.value,
    })
    useUpdateDimensionStore({ collectionAmount: { collectionFee: collectionFee.value } })
    // 重置ai状态
    setAiValidate(true)
    router.back()
    // window.$umpOtherReport(
    //   'CLK',
    //   {
    //     eventCode: 'clk_express_increment_control_v1',
    //   },
    //   {
    //     button_name: '返回',
    //   },
    // )
  } catch (error) {
    console.error('error>>', error)
  } finally {
    reportSubmit()
    internalState.btnLoading = false
    setTimeout(() => {
      isSubmitting.value = false
    }, 1000)
  }
}

const handleClickTips = () => {
  // clk_express_increment_desc_v1()
  router.push({
    path: '/order-service-introduction',
    query: {
      type: 'goods-control',
    },
  })
}

const noInitPage = ['receipt-resources', 'order-service-introduction'] // 去服务介绍和上传资料回来不需要重新加载

const starting = ref(true)
onMounted(async () => {
  // const { forward } = history.state
  // 从上传资料返回不需要初始化
  // if (!forward || !noInitPage.find((pageName) => forward.includes(pageName))) {
  initStateData()
  // }
  // if (from.indexOf('/order') > -1 || from.indexOf('/order-batch-waybill')) {

  try {
    starting.value = true
    const channel = getChannel()
    await startConfig(
      tmpCacheKey.value || piniaStore.order.waybillNumber,
      channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
      true,
    )
    starting.value = false
  } catch (error) {
    starting.value = false
  }
  // }
})

/**
 * @description 后退时，需要重置数据、重新计算费用
 */
useUnload(() => {
  // if (!noInitPage.includes(to.name as string) && !internalState.clickSubmit) {
  initStateData()

  useAddedServiceValidate({
    field: 'collectionAmount',
    cancelProcess: false,
    moduleStyleParmas: ModuleStyle.平铺,
  })
    .then(() => (internalState.clickSubmit = false))
    .catch((error) => console.log(error))
  // } else {
  // internalState.clickSubmit = false
  // }
  // if (to.name === 'order' || to.name === 'order-batch-waybill') {
  removeLast()
  isSubmitting.value = false
  // }
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
