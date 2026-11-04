<template>
  <div :class="domClass">
    <ClearanceWarehouse module-style="unfold" v-if="!isShowTitle" />
    <div class="single-receipt-service" data-validate="addedService.addedService">
      <KyCell
        placeholder="请选择"
        @click="toAddedServicePage"
        v-click-report="{ eventCode: 'clk_express_increment_v1' }"
        v-exposure-report="exp_express_single_insurance_v1()"
        :large-value="true"
      >
        <template #title>
          <div class="font-level3 flex items-center">{{ cellTitle }}</div>
        </template>
        <template #value v-if="cellValue && cellValue.length > 0">
          <div class="single-receipt-service-value">
            <span v-for="(item, index) in cellValue" :key="index">
              {{ item
              }}<span class="cell-value-icon" v-if="item?.includes(ReceiptTypeEnum['10']) && isUrgent">
                <SvgIcon name="urgent-icon" class="font-level4" /><text class="urgent">加急</text>
              </span>
              {{ index === cellValue.length - 1 ? '' : '/' }}
            </span>
          </div>
        </template>
        <template #extra>
          <!--报关出入仓、出展进展提示-->
          <ClearanceWarehouseTips />
          <div class="single-receipt-service-label" v-if="checkResultListTips" v-html="checkResultListTips"></div>
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
  </div>
</template>
<script setup lang="ts">
import { computed, inject, watch } from 'vue'

import { useRouter } from '@order-public-sub-public/vue-router/index'

import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import ClearanceWarehouseTips from '../components/clearance-warehouse-tips/index.vue'

import { isShowTitle } from '../utils'
import { AddedService, AddedServiceConfig, AddedServiceDimension, PickModule } from '@order-public-sub-public/types'
import {
  ModuleType,
  ReceiptProviderType,
  ReceiptType,
  clearanceWarehouseType,
} from '@order-public-sub-public/constants'
import { useOrderWarehouseIn, useOrderWarehouseOut } from '../hooks/useOrderWarehouseState'
import {
  OtherPackageServiceTypeEnum,
  PackageServiceTypeEnum,
  ReceiptProviderTypeEnum,
  ReceiptTypeEnum,
  ReceiptUrgentReturnEnum,
  goodsControlTypeEnum,
} from '../types'
import { isEmptyText } from '@order-public-sub-public/utils'
import { useAiValidate, useIsReadAiTips, useReceiptUrgentReturn } from '../hooks/useState'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { exp_express_single_insurance_v1 } from '@order-public-sub-public/components/business/added-service/hooks/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props: PickModule<AddedServiceConfig> | undefined = inject('addedServiceProps')
const router = useRouter()
const { receiptUrgentReturn } = useReceiptUrgentReturn()
const { orderWarehouseIn, setOrderWarehouseIn } = useOrderWarehouseIn()
const { orderWarehouseOut, setOrderWarehouseOut } = useOrderWarehouseOut()
const { aiValidate, setAiValidate } = useAiValidate()
const { isReadAiTips } = useIsReadAiTips()

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData?.clearanceWarehouse
  return restrictStoreData
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

const checkKeyList = [
  'addedService.receiptFlag',
  'addedService.dismantlingWoodenFrame',
  'addedService.goodsControl',
  'addedService.woodenFrame',
]

const getValue = (data) => {
  return data?.reduce((all, item, index) => {
    const s = index === data.length - 1 ? '' : '/'
    const j = item?.includes(ReceiptTypeEnum['10']) && isUrgent ? '🌩 加急' : ''
    all += item + s + j
    return all
  }, '')
}
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

const domClass = computed(() => {
  return [
    'added-service-popup',
    'dialog_root_class',
    { 'single-receipt-service': checkResultListTips.value },
    {
      // 判断有报关出入仓提示的时候需要覆盖一部分样式
      'clearance-warehouse-tips':
        restrictData.value?.addedServiceEndShowTips || restrictData.value?.addedServiceSendShowTips,
    },
  ]
})

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

const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['增值服务'])
})

const defaultModuleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

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

const toAddedServicePage = () => {
  router.push({ path: '/added-service' })
}

watch(defaultModuleDimensionData, () => {
  if (defaultModuleDimensionData.value) {
    // setCollectionFee(defaultModuleDimensionData.value?.collectionAmount?.collectionFee)

    if (defaultModuleDimensionData.value?.aiTips) {
      closeTippy()
      setAiValidate(false)
    } else {
      setAiValidate(true)
    }
  }
})

const initStateData = () => {
  // 处理报关出入仓
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
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
