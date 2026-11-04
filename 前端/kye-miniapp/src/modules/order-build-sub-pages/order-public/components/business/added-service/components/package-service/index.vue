<!-- 包装服务 -->
<template>
  <div class="package-service" v-if="visible">
    <div v-if="isShowTitle && moduleStyle !== 'unfold'" class="package-service-title font-level3 flex items-center">
      <span v-exposure-report="{ eventCode: 'exp_express_packaging_v1' }">包装服务</span>
      <div class="desctitle">
        <span class="font-level5">(如已包装,无需选择)</span>
      </div>
    </div>
    <div class="desctitle" v-if="showSizeTips">
      <span class="font-level5 color-sub-title">
        <SvgIcon name="dollar-reminder-line" class="font-level4 mr-8 reminder-icon mt--2"></SvgIcon
        >包装服务需要额外收费，若填写托寄物尺寸，计费会更准确哦</span
      >
    </div>

    <!-- 常规包装服务 -->
    <PackageList
      :dataList="packageServiceList"
      :woodenFrame="woodenFrame"
      :feeList="listFeeData?.packageServiceFee"
      type="normal"
      @select="handlePackageService"
    />

    <!-- 更多包装服务 -->
    <PackageList
      :dataList="otherWoodList"
      :feeList="listFeeData?.allocatePackageServiceFee"
      :otherWoodFrameList="otherWoodFrameList"
      type="other"
      @select="handleOtherPackageService"
    />
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  FieldsConfig,
  AddedServiceDimension,
  AiItems,
  woodenFrameInfoListType,
  ProductInfo,
} from '@order-public-sub-public/types'
import { useOtherWoodenFrame, useWoodenFrame } from '../../hooks/useState'
import { useValidate } from '../../hooks/useValidate'
import { isShowTitle } from '../../utils/index'
import { useStore } from '@order-public-sub-public/store'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { computed, onMounted, ref } from 'vue'
import { clk_express_single_insurance_content_v1 } from './report/index'
import { OtherWoodFrameShowVo } from '@order-public-sub-public/apis/init/types'
import PackageList from './components/package-list/index.vue'
import { packageServiceListC } from './hooks/useUpdate'
import { packageServiceListBase } from '../../hooks/state'
import { isSingleOrderScene } from '@order-public-sub-public/store/utils'
import { getBatchWoodenFrameFee, getWoodenFrameFee } from '@order-public-sub-public/apis/added-service'
import { WoodenFrameFeeResponse } from '@order-public-sub-public/apis/added-service/types'
import { debounce } from 'lodash-es'
const piniaStore = useStore()

const aiItem = computed(() => {
  const arr = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.aiItems || []
  return arr.find((v) => v.type === 'woodenFrame') || ({} as AiItems)
})

const moduleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})

const listFeeData = ref<WoodenFrameFeeResponse>()

// 兼容新老前端版本不一致问题
const packageServiceList = computed(() => {
  let newList = moduleDimensionData?.value?.woodenFrameInfoListV2
  let oldList = moduleDimensionData?.value?.woodenFrameInfoList
  let list = newList || []
  if (!newList && oldList) {
    list = [...packageServiceListBase, ...oldList]
  }
  const arr = packageServiceListC(list || [], 'normal')
  return arr || []
})

defineProps<FieldsConfig & { moduleStyle: string }>()

const { woodenFrame, setWoodenFrame } = useWoodenFrame()
const { otherWoodFrameList } = useOtherWoodenFrame()

const { useAddedServiceValidate } = useValidate()

const handlePackageService = (item: woodenFrameInfoListType) => {
  const value = item.value as string
  if (woodenFrame.value + '' === value) {
    // 反选
    setWoodenFrame('')
  } else {
    setWoodenFrame(value)
  }
  validateSelected()
}

const validateSelected = debounce(() => {
  try {
    const orderPageType = piniaStore.root.getOrderPageType

    if (orderPageType === OrderPageType.批量寄) {
      return
    }
    useAddedServiceValidate({ field: 'woodenFrame' })
  } catch (error) {
    console.error(error)
  }
}, 500)

const handleOtherPackageService = (item: woodenFrameInfoListType) => {
  const index = otherWoodFrameList.value?.findIndex((v) => v + '' === item.value)
  if (index !== -1) {
    otherWoodFrameList.value.splice(index, 1)
  } else {
    otherWoodFrameList.value.push(item.value as string)
  }
  console.log('handleOtherPackageService', otherWoodFrameList.value)
  validateSelected()
}

const sizeList = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货物信息'])
})

const otherWoodList = computed(() => {
  const list =
    (piniaStore.globalData.dynamicConfig('otherWoodFrameShowVo') as OtherWoodFrameShowVo)?.otherWoodFrameList || []
  return packageServiceListC(list, 'other') || []
})

const showSizeTips = computed(() => {
  return !sizeList.value?.preWaybillGoodsSizeList?.length || !sizeList.value?.count
})

const getWoodenFee = () => {
  const waybillId = piniaStore.order.waybillId
  const orderPageType = piniaStore.root.getOrderPageType
  const cacheStrategy = orderPageType === OrderPageType.批量寄单票 ? 20 : undefined
  if (isSingleOrderScene(orderPageType)) {
    return getWoodenFrameFee({ waybillId, cacheStrategy })
  } else {
    return getBatchWoodenFrameFee({ waybillId, cacheStrategy })
  }
}

// 单独调用费用
const buildPackageFee = async () => {
  const orderPageType = piniaStore.root.getOrderPageType

  // 本次寄件信息统一不调用费用
  if (orderPageType === OrderPageType.批量寄) {
    return
  }

  try {
    const processPromise = piniaStore.globalData.initDataPromise
    const servicePromise = piniaStore.globalData.serviceModePromise
    if (processPromise || servicePromise) {
      await Promise.all([processPromise, servicePromise])
    }
    const { data } = await getWoodenFee()
    listFeeData.value = data
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  buildPackageFee()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
