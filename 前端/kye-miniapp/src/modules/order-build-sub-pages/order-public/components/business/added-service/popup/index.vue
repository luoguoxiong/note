<template>
  <div :class="domClass" data-validate="addedService.addedService">
    <ClearanceWarehouse module-style="unfold" v-if="!isShowTitle" />
    <div class="single-receipt-service">
      <KyCell
        data-validate="addedService.addedService"
        id="addedService_addedService"
        placeholder="请选择"
        :large-value="true"
        :no-bg-disabled="disabled"
        @click="() => handlePopupVisible(true)"
        v-click-report="{ eventCode: 'clk_express_increment_v1' }"
        v-exposure-report="exp_express_single_insurance_v1()"
        :value="cellValue && cellValue.length"
      >
        <template #title>
          <div class="font-level3 flex items-center">{{ cellTitle }}</div>
        </template>
        <template #value v-if="cellValue && cellValue.length > 0">
          <div class="single-receipt-service-value">
            <span v-for="(item, index) in cellValue" :key="index">
              {{ item.trim()
              }}<span class="cell-value-icon" v-if="item?.includes(ReceiptTypeEnum['10']) && isUrgent">
                <SvgIcon name="urgent-icon" class="font-level4" /><text class="urgent">加急</text>
              </span>
              {{ index === cellValue.length - 1 ? '' : '/' }}
            </span>
          </div>
        </template>
        <template #extra>
          <!--报关出入仓、 出展进展提示-->
          <ClearanceWarehouseTips />
          <div v-if="checkResultListTips" class="single-receipt-service-label" v-html="checkResultListTips"></div>
        </template>
      </KyCell>
    </div>
    <div
      class="added-service-popup-prompt"
      :style="{ maxWidth: '240px' }"
      v-show="!aiValidate && !checkResultListTipsPrompt && !isReadAiTips"
    >
      <div class="popup-prompt-wrapper">
        {{ defaultModuleDimensionData?.aiTips }}
      </div>
    </div>
    <!-- eventCode: 'other_express_increment_popup_perception_v1', -->
    <!--弹框组件-->
    <BottomPopup
      v-if="asynrender && popupVisible"
      id="added-service-bottom-popup"
      class="added-service-bottom-popup-contanier"
      :isMinHeight="orderPageType !== OrderPageType.返程单"
      v-model:show="popupVisible"
      :title="cellTitle"
      show-tips
      tipText=""
      tip-icon="tip-label-color"
      :show-footer="popupVisible || detailPopupVisible"
      @on-click-tips="handleClickTips"
      @onClose="onPopupClose"
      @closed="closed"
      :scrollTop="scrollTop"
    >
      <div class="pb-env">
        <div
          v-exposure-report="{
            eventCode: 'exp_express_single_insurance_cost_pop_v1',
            regionCode: 'pop',
          }"
          class="added-service-bottom-popup-wrapper"
          :class="`${isShowTitle ? `${showTitleLength === 2 ? 'added-service-bottom-popup' : ''}` : ''}`"
        >
          <ClearanceWarehouse module-style="popup" v-if="isShowTitle" />
          <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
            <div
              :class="`${!isShowTitle ? 'added-service-bottom-popup-receipt' : ''}`"
              v-if="item.name === 'recoveryReceipt' && item.visible"
            >
              <!-- 回单 -->
              <ReceiptService
                v-bind="item"
                :moduleStyle="props?.moduleStyle || ''"
                :showCheckErrorTip="showCheckErrorTip"
                @receiptProviderClick="receiptProviderClick"
              />
            </div>
            <div
              :class="`${!isShowTitle ? 'added-service-bottom-popup-collection' : ''}`"
              v-if="item.name === 'collectionPayment' && item.visible"
            >
              <!-- 代收货款 -->
              <CollectPayment v-bind="item" :moduleStyle="props?.moduleStyle || ''" />
            </div>
            <div
              class="added-service-bottom-popup-package"
              v-if="item.name === 'packageService' && item.visible"
              :data-dismantling-wooden-frame="defaultModuleDimensionData?.dismantlingWoodenFrame?.visible"
            >
              <!-- 包装服务 -->
              <PackageService v-if="asyncPacakgeService" v-bind="item" moduleStyle="props?.moduleStyle || ''" />
            </div>
          </template>
        </div>
        <div class="dismantling-wooden-frame-popup" v-if="defaultModuleDimensionData?.dismantlingWoodenFrame?.visible">
          <!-- 拆木架服务 -->
          <DismantlingWoodenFrame></DismantlingWoodenFrame>
        </div>
        <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
          <div
            class="dispatchNotice-warpper"
            v-if="item.name === 'dispatchNotice' && item.visible && defaultModuleDimensionData?.goodsControl?.visible"
          >
            <!-- 定时派送 -->
            <GoodsControl v-bind="item" :moduleStyle="props?.moduleStyle || ''" /></div
        ></template>
      </div>
      <!-- loading的时候增加一个透明遮罩，因为点击其他地方上传文件会乱 -->
      <div class="position-wrap" v-if="internalState.btnLoading"></div>
      <template #footer>
        <BottomPopupBtn
          v-show="popupVisible || detailPopupVisible"
          :moduleStyle="props?.moduleStyle || ''"
          @click="handleConfirm"
          :button-loading="internalState.btnLoading"
          :isUnfold="false"
        />
      </template>
    </BottomPopup>
    <BottomPopupDetail
      :moduleStyle="props?.moduleStyle || ''"
      :btn-loading="internalState.btnLoading"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch, nextTick } from 'vue'
import {
  AddedService,
  AddedServiceConfig,
  AddedServiceDimension,
  AreaAttributeDimension,
  PickModule,
} from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import {
  AreaAttributeType,
  CheckAfterSubmitType,
  LimitResult,
  ModuleStyle,
  ModuleType,
  OrderPageType,
  ReceiptProviderType,
  ReceiptType,
  Channel,
  MaterialSource,
} from '@order-public-sub-public/constants'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import ReceiptService from '../components/receipt-service/index.vue'
import CollectPayment from '../components/collect-payment/index.vue'
import PackageService from '../components/package-service/index.vue'
import GoodsControl from '../components/goods-control/index.vue'
import ClearanceWarehouse from '../components/clearance-warehouse/index.vue'
import BottomPopupBtn from '../components/bottom-popup-btn/index.vue'
import {
  useAiValidate,
  useCollectionAmount,
  useCollectionFee,
  useDismantlingWoodenFrame,
  useGoodsControl,
  useIsReadAiTips,
  useOtherWoodenFrame,
  useReceiptCheckType,
  useReceiptCount,
  useReceiptFlag,
  useReceiptProvider,
  useReceiptUrgentReturn,
  useWoodenFrame,
} from '../hooks/useState'
import { useUpdateDimensionStore, useUpdateOrderStore } from '../hooks/useModuleStore'
import {
  goodsControlTypeEnum,
  OtherPackageServiceTypeEnum,
  PackageServiceTypeEnum,
  ReceiptProviderTypeEnum,
  ReceiptTypeEnum,
  ReceiptUrgentReturnEnum,
} from '@order-public-sub-public/components/business/added-service/types'
import { useValidate } from '../hooks/useValidate'
import { useDetailPopupVisible, usePopupVisible, useVisibleType } from '../hooks/useVisible'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../hooks/useOrderWarehouseState'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { isShowTitle, showTitleLength } from '../utils'
import BottomPopupDetail from '../components/bottom-popup-detail/index.vue'
import { closeTippy, removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { showCheckErrorTip } from '../hooks/state'
import { updateWarehouse } from '@order-public-sub-public/validate/limit'
import ClearanceWarehouseTips from '../components/clearance-warehouse-tips/index.vue'
import { clearanceWarehouseType } from '@order-public-sub-public/constants/clearanceWarehouse'
import DismantlingWoodenFrame from '../components/dismantling-wooden-frame/index.vue'
import {
  clk_express_increment_control_v1,
  clk_express_increment_desc_v1,
  exp_express_single_insurance_v1,
  incrementPopupClosedReport,
} from '@order-public-sub-public/components/business/added-service/hooks/report'
import { isEmptyText } from '@order-public-sub-public/utils'
import { cloneDeep, debounce } from 'lodash-es'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { getChannel } from '@order-public-sub-public/configs'
import { unifiedInfoSwitcher } from '@order-public-sub-public/components/business/batch/send-info-stand/hooks/state'
import { asynrender } from '@order-public-sub-public/hooks/asynrender'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const piniaStore = useStore()

const bizId = computed(() => piniaStore.order.waybillNumber)

interface InternalState {
  stepperKey: number
  btnLoading: boolean
}

defineProps<{ disabled?: boolean }>()

const props: PickModule<AddedServiceConfig> | undefined = inject('addedServiceProps')

const router = useRouter()
const route = useRoute()
const { startConfig, removeLast, submitConfig } = useInitMulitFielConfigChild()

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
const { aiValidate, setAiValidate } = useAiValidate()
const { dismantlingWoodenFrame, setDismantlingWoodenFrame } = useDismantlingWoodenFrame()
const { isReadAiTips } = useIsReadAiTips()

const { useAddedServiceValidate, useReceiptProviderValidate } = useValidate()

const { popupVisible, setPopupVisible } = usePopupVisible()
const { setVisibleType } = useVisibleType()
const { detailPopupVisible, setDetailPopupVisible } = useDetailPopupVisible()
const scrollTop = ref(0)

const asyncPacakgeService = ref(false)

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

const domClass = computed(() => {
  return [
    'added-service-popup',
    { 'single-receipt-service': checkResultListTips.value },
    {
      // 判断有报关出入仓提示的时候需要覆盖一部分样式
      'clearance-warehouse-tips':
        restrictData.value?.addedServiceEndShowTips || restrictData.value?.addedServiceSendShowTips,
    },
  ]
})

const checkKeyList = [
  'addedService.receiptFlag',
  'addedService.dismantlingWoodenFrame',
  'addedService.goodsControl',
  'addedService.woodenFrame',
]

const checkResultListTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList

  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (checkKeyList.includes(item.key) && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})

const checkResultListTipsPrompt = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.receiptFlag' && item.showType === 1) {
        result = item.content
      }
    })
  }
  return result
})

const hotZoneStore = computed(() => piniaStore.extend.hotZoneStore)

const onPopupOpen = () => {
  internalState.stepperKey += 1
  initStateData()
}

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

watch(
  defaultModuleFormData,
  () => {
    initStateData()
  },
  {
    deep: true,
  },
)

watch(restrictData, () => {
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
})

const areaAttribute = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature)

const receiptProviderClick = () => {
  showCheckErrorTip.value = false
}
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
    if (!hotZoneStore.value[ModuleType['收方信息']] && defaultModuleFormData.value?.collectionAmount) {
      setCollectionAmount(defaultModuleFormData.value?.collectionAmount)
    } else {
      setCollectionAmount('')
    }
  }
  if (defaultModuleDimensionData.value) {
    setCollectionFee(defaultModuleDimensionData.value?.collectionAmount?.collectionFee)
  }
}

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

const internalState: InternalState = reactive({
  stepperKey: 0,
  btnLoading: false,
})

const _removeLast = debounce(async () => {
  removeLast()
}, 300)

const handlePopupVisible = async (visible: boolean) => {
  if (!(unifiedInfoSwitcher.value && route.path === '/order-batch')) {
    if (visible === true) {
      const channel = getChannel()
      // order-batch页面下打开本次寄件信息统一的 增值服务不进行初始化
      await startConfig(
        tmpCacheKey.value || bizId.value,
        channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
        true,
      )
    } else {
      _removeLast()
    }
  }

  setPopupVisible(visible)
  setVisibleType('popup')
  if (visible) {
    onPopupOpen()
    asyncPacakgeService.value = true
    // 打开弹窗
    nextTick(() => {
      reportPerception('other_express_increment_popup_perception_v1')
    })
  } else {
    asyncPacakgeService.value = false
  }
}

const reportConfirm = () => {
  clk_express_increment_control_v1('确定')
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_insurance_v1',
    },
    {
      is_receipt: receiptFlag.value ? '是' : '否',
      receipt_type: ReceiptTypeEnum[receiptFlag.value],
      receipt_provider: ReceiptProviderTypeEnum[receiptProvider.value],
      number_receipt: receiptCount.value?.toString(),
      if_payment_collection: collectionAmount.value ? '是' : '否',
      payment_collection: collectionAmount.value,
      if_packaging_services: woodenFrame.value ? '是' : '否',
      inform_type: goodsControlTypeEnum[goodsControl.value],
      packaging_services: PackageServiceTypeEnum[woodenFrame.value],
      request_result: '成功',
      failure_reason: '',
    },
  )
}

const handleConfirm = async () => {
  internalState.btnLoading = true
  const validateReceiptProviderRes = await useReceiptProviderValidate()
  if (!validateReceiptProviderRes.passed) {
    showCheckErrorTip.value = true
  }
  try {
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

    if (warehouseInOrOut.length > 0) {
      await updateWarehouse(warehouseInOrOut)
    }
    // 电子回单需要清掉回单要求
    if (receiptFlag.value === ReceiptType['ELECTRON']) {
      setReceiptCheckType([])
    }
    // 校验
    await useAddedServiceValidate({
      field: 'addedService',
      cb: async () => {
        await submitConfig()
      },
    })

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
    handlePopupVisible(false)
    setDetailPopupVisible(false)
    // 重置ai状态
    setAiValidate(true)
    reportConfirm()
  } catch (error) {
    console.error(error)
    scrollTop.value = 0
    nextTick(() => {
      scrollTop.value = 1
    })
  } finally {
    internalState.btnLoading = false
  }
}

const handleReceiptFlagCellValue = (resultCellValue: string[]) => {
  const receiptCount = defaultModuleFormData.value?.receiptCount || ''
  const receiptFlag = defaultModuleFormData.value.receiptFlag as keyof typeof ReceiptTypeEnum
  const receiptProvider = defaultModuleFormData.value?.receiptProvider || ''
  const receiptElectronCount = defaultModuleDimensionData.value?.receiptFile?.fileCount || ''
  const receiptCheckTypeLength = defaultModuleFormData.value?.receiptCheckType?.length || 0
  if (receiptFlag !== ReceiptType['NONE']) {
    let cellValue = ReceiptTypeEnum[receiptFlag]
    cellValue +=
      receiptCount && receiptFlag !== ReceiptType['ELECTRON'] && receiptProvider !== ReceiptProviderType['KYEPINCHHIT']
        ? `/${receiptCount}张`
        : ''
    cellValue += receiptFlag === ReceiptType['ELECTRON'] && receiptElectronCount ? `/${receiptElectronCount}张` : ''
    cellValue +=
      receiptFlag !== ReceiptType['ELECTRON'] && receiptProvider ? `(${ReceiptProviderTypeEnum[receiptProvider]})` : ''
    cellValue += receiptCheckTypeLength ? `/${receiptCheckTypeLength}项要求` : ''
    resultCellValue.push(cellValue)
  }
}

const cellValue = computed(() => {
  let resultCellValue: string[] = []

  if (isShowTitle.value) {
    const { endShowType, sendShowType } = restrictData.value || {}
    const outTitle = clearanceWarehouseType[sendShowType as keyof typeof clearanceWarehouseType] || '报关出仓'
    const inTitle = clearanceWarehouseType[endShowType as keyof typeof clearanceWarehouseType] || '报关入仓'
    orderWarehouseOut.value && resultCellValue.push(outTitle)
    orderWarehouseIn.value && resultCellValue.push(inTitle)
  }

  if (defaultModuleFormData.value) {
    if (defaultModuleFormData.value?.receiptFlag) {
      handleReceiptFlagCellValue(resultCellValue)
    }
    defaultModuleFormData.value?.collectionAmount && resultCellValue.push('代收货款')
    if (defaultModuleFormData.value?.dismantlingWoodenFrame === '10') {
      resultCellValue.push('拆木架服务')
    }

    const woodenFrameConfig = props?.config?.fieldsConfig?.find((item) => item.name === 'packageService')
    if (woodenFrameConfig?.visible) {
      defaultModuleFormData.value?.woodenFrame &&
        resultCellValue.push(PackageServiceTypeEnum[defaultModuleFormData.value.woodenFrame])

      defaultModuleFormData.value?.otherWoodFrameList?.length && resultCellValue.push(buildwoodenFrameName())
    }

    defaultModuleFormData.value?.goodsControl &&
      resultCellValue.push(goodsControlTypeEnum[defaultModuleFormData.value.goodsControl])
  }

  return resultCellValue.filter((x) => !isEmptyText(x))
})

const buildwoodenFrameName = () => {
  const otherName =
    defaultModuleFormData.value?.otherWoodFrameList?.map((item) => OtherPackageServiceTypeEnum[item]) || []
  return otherName.join('/')
}

// 地址自营区非自营区切换
watch(
  () => piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature,
  (value, preValue) => {
    if (
      (preValue === AreaAttributeType['自营区'] && value !== AreaAttributeType['自营区']) ||
      (preValue !== undefined && preValue !== AreaAttributeType['自营区'] && value === AreaAttributeType['自营区'])
    ) {
      // useUpdateOrderStore({ receiptProvider: '' })
      setCollectionFee(0)
    }
  },
)

watch(defaultModuleFormData, () => {
  initStateData()
})
// bug#451635 需求当bug处理，顶部的icon跳转到定时派送
const handleClickTips = () => {
  clk_express_increment_desc_v1()
  router.push({
    path: '/order-service-introduction',
    query: {
      type: 'goods-control',
    },
  })
}

const cellTitle = computed(() => {
  let result = '增值服务'
  const config = props?.config?.fieldsConfig
  const filterConfig = config?.filter((item) => item.visible)
  if (filterConfig?.length && filterConfig?.length <= 1) {
    result = filterConfig[0].name === 'recoveryReceipt' ? '回单服务' : filterConfig[0].label
  }
  return result
})

const isUrgent = computed(() => {
  const flag = defaultModuleDimensionData.value?.receiptServiceList
    ?.filter((item) => item.type === ReceiptType['ORIGIN'])
    .every((item) => item.receiptTypeUrgentState)

  return (
    flag ||
    (ReceiptUrgentReturnEnum[receiptUrgentReturn.value] === '加急' &&
      defaultModuleDimensionData.value?.receiptUrgentReturn?.visible)
  )
})

const onPopupClose = async () => {
  clk_express_increment_control_v1('关闭')
  removeErrClassByDataValidate('addedService.receiptCount')
  // 关闭时需要清除报错的样式
  showCheckErrorTip.value = false
  handlePopupVisible(false)

  // 为了处理代收货款服务费需要重新调用过程中接口
  initStateData()
  try {
    await useAddedServiceValidate({
      field: 'collectionAmount',
      cancelProcess: false,
      moduleStyleParmas: ModuleStyle.平铺,
    })
  } catch (error) {
    console.error(error)
  }
  clk_express_increment_control_v1('关闭')
}

const closed = () => {
  incrementPopupClosedReport()
}

// watch(tempWaybillInfo, () => {
//   if (tempWaybillInfo.value?.receiptProvider) {
//     setReceiptProvider(tempWaybillInfo.value?.receiptProvider)
//     useUpdateOrderStore({
//       receiptProvider: tempWaybillInfo.value?.receiptProvider,
//     })
//   }
// })

watch(
  () => props?.config?.fieldsConfig,
  (val) => {
    console.log('监听 valvalvalval ', val)
    if (val) {
      reportPerception('other_express_increment_popup_perception_v1')
    }
  },
)

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

onMounted(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
    initStateData()
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
