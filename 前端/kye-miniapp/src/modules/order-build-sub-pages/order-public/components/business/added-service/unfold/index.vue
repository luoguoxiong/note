<template>
  <div class="added-service-unfold">
    <ClearanceWarehouse module-style="unfold" />
    <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
      <div
        v-if="item.name === 'recoveryReceipt' && item.visible"
        data-validate="addedService.addedService"
        class="added-service-unfold-prompt-wrapper"
      >
        <div :class="`${checkResultListTips ? 'single-receipt-service' : 'single-receipt-service-unfold'}`">
          <KyCell placeholder="请选择" @click="() => handlePopupVisible(true, 'receipt')" :large-value="true">
            <template #title>
              <div class="font-level3 flex items-center">回单服务</div>
            </template>
            <template #value v-if="defaultModuleFormData.receiptFlag">
              <div class="flex items-center receipt-cell-value">
                <div class="cell-value-title">{{ receiptCellValue }}</div>
                <div
                  class="flex items-center cell-value-icon"
                  v-if="defaultModuleFormData.receiptFlag === ReceiptType['ORIGIN'] && isUrgent"
                >
                  <SvgIcon name="urgent-icon" class="font-level4" />
                  <span class="color-warning urgent">加急</span>
                </div>
              </div>
              <div class="single-receipt-service-label" v-if="checkResultListTips" v-html="checkResultListTips"></div>
            </template>
          </KyCell>
          <div
            class="added-service-unfold-prompt"
            :style="{ maxWidth: '240px' }"
            v-show="!aiValidate && !checkResultListTipsPrompt && isReadAiTips"
          >
            <div class="popup-prompt-wrapper">
              {{ defaultModuleDimensionData?.aiTips }}
            </div>
          </div>
        </div>
        <BottomPopup
          id="added-service-bottom-unfold"
          class="added-service-bottom-unfold"
          v-model:show="unfoldReceiptVisible"
          title="回单服务"
          show-tips
          tipText=""
          tip-icon="desc"
          :show-footer="false"
          @on-click-tips="() => handleClickTips('receipt')"
          @onClose="onPopupClose"
        >
          <div class="added-service-bottom-unfold-receipt">
            <ReceiptService
              v-bind="item"
              :moduleStyle="props?.moduleStyle || ''"
              :key="internalState.stepperKey"
              :showCheckErrorTip="showCheckErrorTip"
              @receiptProviderClick="showCheckErrorTip = false"
            />
          </div>
          <!-- loading的时候增加一个透明遮罩，因为点击其他地方上传文件会乱 -->
          <div class="position-wrap" v-if="internalState.btnLoading"></div>
          <template #scroll-after>
            <BottomPopupBtn
              v-show="unfoldReceiptVisible || unfoldPackageVisible || detailPopupVisible"
              @click="handleConfirm"
              :button-loading="internalState.btnLoading"
              :isUnfold="true"
              class="added-service-unfold-popup"
            />
          </template>
        </BottomPopup>
      </div>
      <div v-if="item.name === 'collectionPayment' && item.visible">
        <CollectPayment v-bind="item" :moduleStyle="props?.moduleStyle || ''" @blur="onCollectPaymentBlur" />
      </div>
      <div
        class="package-sevice-unflod"
        :class="{ 'has-tips': packageCheckResultListTips }"
        v-if="item.name === 'packageService' && item.visible"
      >
        <KyCell placeholder="请选择" @click="() => handlePopupVisible(true, 'package')" :large-value="true">
          <template #title>
            <div class="font-level3 flex items-center">包装服务</div>
          </template>
          <template #value v-if="packageCellValue">
            <div class="package-sevice-unflod-value">
              {{ packageCellValue }}
            </div>
          </template>
          <template #extra v-if="packageCellValue">
            <div class="package-sevice-unflod-label">
              <span v-if="packageCheckResultListTips" v-html="packageCheckResultListTips"></span>
            </div>
          </template>
        </KyCell>
        <BottomPopup
          v-model:show="unfoldPackageVisible"
          class="added-service-bottom-unfold-package-popup"
          title="包装服务"
          show-tips
          tip-icon="desc"
          :show-footer="false"
          tip-text="如已包装，无需选择"
          @on-click-tips="() => handleClickTips('waterproof-packing')"
          @onClose="() => handlePopupVisible(false, 'package')"
        >
          <div class="added-service-bottom-unfold-package">
            <div v-if="unfoldPackageVisible">
              <PackageService
                v-if="item.name === 'packageService'"
                v-bind="item"
                :moduleStyle="props?.moduleStyle || ''"
                :key="internalState.stepperKey"
              />
            </div>
          </div>
          <template #scroll-after>
            <BottomPopupBtn
              v-show="unfoldReceiptVisible || unfoldPackageVisible || detailPopupVisible"
              @click="handleConfirm"
              :button-loading="internalState.btnLoading"
              :isUnfold="true"
              class="added-service-unfold-popup"
            />
          </template>
        </BottomPopup>
      </div>
    </template>
    <div class="dismantling-wooden-frame-unfold" v-if="defaultModuleDimensionData?.dismantlingWoodenFrame?.visible">
      <div class="dismantling-wooden-frame-unfold-content">
        <DismantlingWoodenFrame moduleStyle="unfold" @change="onDismantlingChange"></DismantlingWoodenFrame>
      </div>
      <div class="font-level4 color-warning bottom-desc" v-show="dismantlingWoodenFrameTips">
        <div>
          {{ dismantlingWoodenFrameTips }}
        </div>
      </div>
    </div>
    <template v-for="item in props?.config?.fieldsConfig" :key="item.name">
      <div
        class="goodsControl"
        v-if="item.name === 'dispatchNotice' && item.visible && defaultModuleDimensionData?.goodsControl?.visible"
      >
        <GoodsControl
          v-if="item.name === 'dispatchNotice'"
          v-bind="item"
          :moduleStyle="props?.moduleStyle || ''"
          :key="internalState.stepperKey"
        />
      </div>
    </template>
    <BottomPopupDetail />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, reactive, watch, ref } from 'vue'
import {
  AddedService,
  AddedServiceConfig,
  AddedServiceDimension,
  AreaAttributeDimension,
  PickModule,
} from '@order-public-sub-public/types'
import ClearanceWarehouse from '../components/clearance-warehouse/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import ReceiptService from '../components/receipt-service/index.vue'
import CollectPayment from '../components/collect-payment/index.vue'
import PackageService from '../components/package-service/index.vue'
import GoodsControl from '../components/goods-control/index.vue'
import BottomPopupBtn from '../components/bottom-popup-btn/index.vue'
import {
  AreaAttributeType,
  ModuleStyle,
  ModuleType,
  OrderPageType,
  ReceiptProviderType,
  ReceiptType,
  Channel,
  MaterialSource,
} from '@order-public-sub-public/constants'
import { useRouter } from '@order-public-sub-public/vue-router/index'
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
  OtherPackageServiceTypeEnum,
  PackageServiceTypeEnum,
  ReceiptProviderTypeEnum,
  ReceiptTypeEnum,
  ReceiptUrgentReturnEnum,
} from '@order-public-sub-public/components/business/added-service/types'
import { useValidate } from '../hooks/useValidate'
import {
  useDetailPopupVisible,
  useUnfoldPackageVisible,
  useUnfoldReceiptVisible,
  useVisibleType,
} from '../hooks/useVisible'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../hooks/useOrderWarehouseState'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import BottomPopupDetail from '../components/bottom-popup-detail/index.vue'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { showCheckErrorTip } from '../hooks/state'
import DismantlingWoodenFrame from '../components/dismantling-wooden-frame/index.vue'
import { cloneDeep, debounce } from 'lodash-es'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { getChannel } from '@order-public-sub-public/configs'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface InternalState {
  stepperKey: number
  btnLoading: boolean
}
defineProps<{ disabled?: boolean }>()

const props: PickModule<AddedServiceConfig> | undefined = inject('addedServiceProps')

const router = useRouter()

const { submitConfig, startConfig, removeLast } = useInitMulitFielConfigChild()
const { receiptFlag, setReceiptFlag } = useReceiptFlag()
const { receiptProvider, setReceiptProvider } = useReceiptProvider()
const { receiptCheckType, setReceiptCheckType } = useReceiptCheckType()
const { receiptUrgentReturn, setReceiptUrgentReturn } = useReceiptUrgentReturn()
const { receiptCount, setReceiptCount } = useReceiptCount()
const { collectionAmount, setCollectionAmount } = useCollectionAmount()
const { collectionFee, setCollectionFee } = useCollectionFee()
const { woodenFrame, setWoodenFrame } = useWoodenFrame()
const { otherWoodFrameList, setOtherWoodenFrame } = useOtherWoodenFrame()
const { setGoodsControl } = useGoodsControl()
const { setOrderWarehouseIn } = useOrderWarehouseIn()
const { setOrderWarehouseOut } = useOrderWarehouseOut()
const { aiValidate, setAiValidate } = useAiValidate()
const { dismantlingWoodenFrame, setDismantlingWoodenFrame } = useDismantlingWoodenFrame()
const { isReadAiTips } = useIsReadAiTips()

const { useAddedServiceValidate, useReceiptProviderValidate } = useValidate()

const { unfoldReceiptVisible, setUnfoldReceiptVisible } = useUnfoldReceiptVisible()
// const { unfoldPackageVisible, setUnfoldPackageVisible } = useUnfoldPackageVisible()
const { detailPopupVisible, setDetailPopupVisible } = useDetailPopupVisible()
const { visibleType, setVisibleType } = useVisibleType()

const unfoldPackageVisible = ref(false)

const setUnfoldPackageVisible = (visible: boolean) => {
  unfoldPackageVisible.value = visible
}
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['增值服务'])
})

const defaultModuleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const tempWaybillInfo = computed(() => piniaStore.globalData.tempWaybillInfo?.addedService)

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData?.clearanceWarehouse
  return restrictStoreData
})

const checkResultListTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.receiptFlag' && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})

const packageCheckResultListTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.woodenFrame' && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})

const getValue = () =>
  defaultModuleFormData.value?.receiptFlag
    ? receiptCellValue.value +
      (defaultModuleFormData.value?.receiptFlag === ReceiptType['ORIGIN'] && isUrgent ? ' 🌩 加急' : '')
    : ''

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

const dismantlingWoodenFrameTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.dismantlingWoodenFrame' && item.showType === 2) {
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
    setCollectionFee(defaultModuleDimensionData.value.collectionAmount?.collectionFee)

    if (defaultModuleDimensionData.value?.aiTips) {
      closeTippy()
      setAiValidate(false)
    } else {
      setAiValidate(true)
    }
  }
})

watch(
  restrictData,
  () => {
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
  },
  {
    immediate: true,
  },
)

const areaAttribute = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature)

// eslint-disable-next-line complexity, max-lines-per-function
const initStateData = () => {
  if (defaultModuleFormData.value) {
    setReceiptFlag(defaultModuleFormData.value?.receiptFlag || '')
    setReceiptProvider(defaultModuleFormData.value?.receiptProvider || '')
    setReceiptCheckType(defaultModuleFormData.value?.receiptCheckType || [])
    setReceiptUrgentReturn(defaultModuleFormData.value?.receiptUrgentReturn || 'notUrgent')
    // 跨越代打要将回单份数设置为null
    if (defaultModuleFormData.value?.receiptProvider === ReceiptProviderType['KYEPINCHHIT']) {
      setReceiptCount(null)
    } else {
      setReceiptCount(defaultModuleFormData.value?.receiptCount || 1)
    }
    if (areaAttribute.value === AreaAttributeType['自营区']) {
      setCollectionAmount(defaultModuleFormData.value?.collectionAmount || '')
    } else {
      if (!hotZoneStore.value[ModuleType['收方信息']] && defaultModuleFormData.value?.collectionAmount) {
        setCollectionAmount(defaultModuleFormData.value?.collectionAmount)
      } else {
        setCollectionAmount('')
      }
    }
    setWoodenFrame(defaultModuleFormData.value?.woodenFrame || '')
    const otherWoodenFrameList = defaultModuleFormData.value?.otherWoodFrameList || []
    setOtherWoodenFrame(cloneDeep(otherWoodenFrameList))
    setGoodsControl(defaultModuleFormData.value?.goodsControl || '')
    setDismantlingWoodenFrame(defaultModuleFormData.value?.dismantlingWoodenFrame || '')
  }
  if (defaultModuleDimensionData.value) {
    setCollectionFee(defaultModuleDimensionData.value.collectionAmount?.collectionFee)
  }
}

const internalState: InternalState = reactive({
  stepperKey: 0,
  btnLoading: false,
})

const _removeLast = debounce(async () => {
  removeLast()
  isSubmitting.value = false
}, 300)

const handlePopupVisible = debounce(async (visible: boolean, moduleType: string, closeType?: string) => {
  if (moduleType === 'receipt') {
    setUnfoldReceiptVisible(visible)
    setVisibleType('unfoldReceipt')
    if (visible === true) {
      const channel = getChannel()
      await startConfig(
        tmpCacheKey.value || piniaStore.order.waybillNumber,
        channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
        true,
      )
    } else {
      _removeLast()
    }
  }
  if (moduleType === 'package' && visible) {
    await useAddedServiceValidate({ field: 'addedService', cancelProcess: true })
  }
  if (moduleType === 'package') {
    setUnfoldPackageVisible(visible)
    setVisibleType('unfoldPackage')

    if (!visible) {
      if (closeType !== 'confirm') {
        // 如果是主动关闭 数据用store
        setWoodenFrame(defaultModuleFormData.value.woodenFrame || '')
        const otherWoodenFrameList = defaultModuleFormData.value.otherWoodFrameList || []
        setOtherWoodenFrame(cloneDeep(otherWoodenFrameList))
        console.log('initStateDatasetWoodenFrame', defaultModuleFormData.value.otherWoodFrameList)
      }
      try {
        await useAddedServiceValidate({ field: 'collectionAmount' })
      } catch (error) {
        console.error(error)
      }
    }
  }
  if (visible) {
    onPopupOpen()
  }
}, 300)

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

const handleConfirm = async () => {
  let moduleType = ''
  if (visibleType.value === 'unfoldReceipt') {
    moduleType = 'receipt'
    const validateReceiptProviderRes = await useReceiptProviderValidate()
    if (!validateReceiptProviderRes.passed) {
      showCheckErrorTip.value = true
    }
  }
  if (visibleType.value === 'unfoldPackage') {
    moduleType = 'package'
  }

  if (visibleType.value === 'unfoldGoodsControl') {
    moduleType = 'goodsControl'
  }
  if (visibleType.value === 'unfoldReceipt') {
    _submitConfig()
  }
  internalState.btnLoading = true
  isSubmitting.value = true

  try {
    // 电子回单需要清掉回单要求
    if (receiptFlag.value === ReceiptType['ELECTRON']) {
      setReceiptCheckType([])
    }
    // 校验
    await useAddedServiceValidate({
      field: 'addedService',
      cb: async () => {
        if (visibleType.value === 'unfoldReceipt') {
          await isSubmittingPromise.value
        }
      },
    })

    if (moduleType === 'receipt') {
      useUpdateOrderStore({
        receiptFlag: receiptFlag.value as ReceiptType,
        receiptProvider: receiptProvider.value as ReceiptProviderType,
        receiptCheckType: receiptCheckType.value,
        receiptUrgentReturn: receiptUrgentReturn.value,
        receiptCount: receiptCount.value,
      })
      // 重置ai状态
      setAiValidate(true)
    }
    if (moduleType === 'package') {
      useUpdateOrderStore({
        woodenFrame: woodenFrame.value,
        otherWoodFrameList: otherWoodFrameList.value,
      })
    }
    useUpdateDimensionStore({ collectionAmount: { collectionFee: collectionFee.value } })
    handlePopupVisible(false, moduleType, 'confirm')
    setDetailPopupVisible(false)
  } catch (error) {
    console.error(error)
  } finally {
    internalState.btnLoading = false
    setTimeout(() => {
      isSubmitting.value = false
    }, 1000)
  }
}

// eslint-disable-next-line complexity
const receiptCellValue = computed(() => {
  if (defaultModuleFormData.value) {
    const receiptFlag = defaultModuleFormData.value?.receiptFlag || ''
    const receiptCount = defaultModuleFormData.value?.receiptCount || ''
    const receiptElectronCount = defaultModuleDimensionData.value?.receiptFile?.fileCount || ''
    const receiptProvider = defaultModuleFormData.value?.receiptProvider || ''
    const receiptCheckTypeLength = defaultModuleFormData.value?.receiptCheckType?.length || 0

    let cellValue = (receiptFlag && ReceiptTypeEnum[receiptFlag]) || ''
    cellValue +=
      receiptCount && receiptProvider !== ReceiptProviderType['KYEPINCHHIT'] && receiptFlag !== ReceiptType['ELECTRON']
        ? `/${receiptCount}张`
        : ''
    cellValue += receiptFlag === ReceiptType['ELECTRON'] && receiptElectronCount ? `/${receiptElectronCount}张` : ''
    cellValue +=
      receiptFlag !== ReceiptType['ELECTRON'] && receiptProvider ? `(${ReceiptProviderTypeEnum[receiptProvider]})` : ''
    cellValue += receiptCheckTypeLength ? `/${receiptCheckTypeLength}项要求` : ''
    return cellValue
  } else {
    return ''
  }
})

const packageCellValue = computed(() => {
  if (defaultModuleFormData.value) {
    const normalName = `${
      defaultModuleFormData.value?.woodenFrame ? PackageServiceTypeEnum[defaultModuleFormData.value.woodenFrame] : ''
    }`

    const otherName =
      defaultModuleFormData.value?.otherWoodFrameList?.map((item) => OtherPackageServiceTypeEnum[item]) || []
    if (normalName) {
      otherName?.unshift(normalName)
    }
    return otherName.join('/')
  } else {
    return ''
  }
})

const onCollectPaymentBlur = () => {
  useUpdateDimensionStore({ collectionAmount: { collectionFee: collectionFee.value } })
  useUpdateOrderStore({ collectionAmount: collectionAmount.value })
}

const onDismantlingChange = () => {
  useUpdateOrderStore({ dismantlingWoodenFrame: dismantlingWoodenFrame.value })
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

const handleClickTips = (type: string) => {
  router.push({
    path: '/order-service-introduction',
    query: {
      type,
    },
  })
}

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

// 关闭回单服务弹窗
const onPopupClose = async () => {
  handlePopupVisible(false, 'receipt')
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
}

watch(tempWaybillInfo, () => {
  if (tempWaybillInfo.value?.receiptProvider) {
    setReceiptProvider(tempWaybillInfo.value?.receiptProvider)
    // useUpdateOrderStore({
    //   receiptProvider: tempWaybillInfo.value?.receiptProvider,
    // })
  }
})

onMounted(() => {
  // const orderPageType = piniaStore.root.getOrderPageType
  // if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
  //   initStateData()
  // }
  setTimeout(() => {
    initStateData()
  }, 300)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
