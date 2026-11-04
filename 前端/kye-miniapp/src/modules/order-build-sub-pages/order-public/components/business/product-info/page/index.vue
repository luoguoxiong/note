<template>
  <div class="product-info-page" id="productInfo_productInfo">
    <KyCell
      :class="{ 'error-padding': overweightOrLengthTips, 'goods-type-fee-tips': goodsTypeFeeTips }"
      @click="handleToProductInfoPage"
      placeholder="请选择"
      :no-bg-disabled="isDisabled"
      :border="false"
      :value="cellValue"
      data-validate="productInfo.productInfo"
    >
      <template #title>
        <div class="font-level3 flex items-center">
          货物信息<img
            class="product-spec-required"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAolBMVEUAAAD/h3H/h3D/h3D/h3L/hXL/h3L/hnT/h3L/iHL94OD/4uL/h3L/iHL/h3L/gGD/h3L/iHL/h3L/h3H/hnD94N/94eD/h3L94uD94eH94uD/h3L94OD/hnP/5OT/gGr/hnH/h3L/h3L/hnH/h3H/hXD/h3L/h3L/h3H/h3L/gHD+4eD+4eD/iHL/hnH/h3L/hnP/hnL/hXH/h3H94uH/h3Ktn1/aAAAANHRSTlMAvyBAn4BfFvnPMgjojsYIb++1Zx369dvZmZWVjCgmDFjz31NGMNethzkQ4MWmfHdQTCzjXNbewAAAArFJREFUWMPtl9l2qjAUhjcKkigzKI51HlunHv73f7WDDDZLoGW1ueS7IQH8zN47KyTU0NDQ0PBFdzTsR3+kPxx1M11vHEli3Et8H9Fg2u3RH+l1p4Po46EZR+9vJIW392gc5y8axD5JxkHUpVE0JWlMoxENY6k0utGQ+lFPnrAX9SmKSB6xrUzo61RBp6OLPVWtJTRh3CuEQFvoncFrCR0GTOy8Z5/XVUILk3ohf3KAf2YdDei8CpUUhjBrmd8LyZ4Ay1QTMFiFEeIV5UVYpLNEGo8KHAvCVoIPo5Wh/yikzzD58RFQq4qiCY9+FpKuXIjmIVw9vxGPBFi0WgHRRokxsBIyWC1sCVWYCG0VGas4IxBRKoX2i/AOnKlUKEi0b4TrpScKdQPhnKgQcn3hAVwQzi2w7UnbBa9FqR+ygokg3AMOBS68MuFKy1GqhXOGxZfQTGeMA9xehLVDvgH6U+gjG9oOK7soNNQcXi1UwZ9VdgArLcgGcIpCV8lZVQrtJS65MPbt9GdmXftXIfvALBOago/agFMQ8naOWinksCgV7gBLF9c94zfTZgGsMyGwT/InPHkK9euh5ggdl+dFgEk5J4oxsM+FnCGsm0N7RjFXBhzoiaHFsZv8nixpJmLCiapa4rR5tP2q1WZrAeKafwJu2TB9jhjvTm0UUcuFpwMDFFE4+1qwL4A7SaaB9sD0kounJpdbaciOAfxbt0ThBsjLHXB/LoQSskeij0t2rVqxO7GOHeakA76QcYNKsDUG9ngr2AN8Wy6cLbFPysLAN62UhYszFVmHgDVL2/Er7FJe5Xb2Tx4E2LGg23DAdZ7dwAK8glAk8BhyjA4VmBnM1EnAxPWnD734vS2yfb3dFkKWvp2TvuGUviWWvmmXfqyQffCRfjSTfXiUfbxtaGhoaHjyH3pRu/OA05k8AAAAAElFTkSuQmCC"
            v-if="orderPageType !== OrderPageType.批量寄"
          />
        </div>
      </template>
      <template #extra>
        <p class="overweight-error-tips" v-if="overweightOrLengthTips">
          <SvgIcon name="dollar-reminder-line" class="tips-icon"></SvgIcon>
          {{ overweightOrLengthTips }}
        </p>
        <WarnTips showIcon source="page" />
      </template>
    </KyCell>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { ProductInfo } from '@order-public-sub-public/types'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import WarnTips from '../components/warn-tips/index.vue'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import {
  useGoodsType,
  useProductCode,
  usePreWaybillGoodsSizeList,
  useCount,
  useActualWeight,
  useVolumeSize,
  useMatchList,
} from '../hooks/useState'
import { cloneDeep, isNull } from 'lodash-es'
import { useModuleHotZone } from '../hooks/useModuleHotZone'
import { getVolumeSize, cellValue } from '../utils/index'
import { overLengthAndWeightFee, useOverLengthAndWeight } from '../hooks/useOverLengthAndWeigth'
import { useOverLengthAndWeightRequest } from '../hooks/state'
import { getQueryObject } from '@order-public-sub-public/utils'
const piniaStore = useStore()
defineProps<{ isDisabled?: boolean }>()
const router = useRouter()

const { setGoodsType } = useGoodsType()
const { setProductCode } = useProductCode()
const { count, setCount } = useCount()
const { actualWeight, setActualWeight } = useActualWeight()
const { setVolumeSize } = useVolumeSize()
const { preWaybillGoodsSizeList, setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { setMatchList } = useMatchList()

const goodsTypeFeeTips = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict?.goodsTypeFeeTips
})

// 表单初始化默认值
const defaultModuleFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货物信息'])
})

// 货物信息超长、超重给予提示
const overweightOrLengthTips = computed(() => {
  if (piniaStore.globalData.restrictData?.goodsRestrict?.goodsTypeFeeTips) {
    return false
  }
  return overLengthAndWeightFee?.agent?.agentOverTips || ''
})

onMounted(async () => {
  useModuleHotZone()

  // 兼容批量寄
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
    initStateData()
    // 体积处理
    if (defaultModuleFormData.value) {
      setVolumeSize(
        defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
      )
    }
  } else {
    initStateData()
  }

  setTimeout(async () => {
    const processPromise = piniaStore.globalData.initDataPromise
    if (processPromise) {
      await processPromise
    }
    if (useOverLengthAndWeightRequest.value) {
      useOverLengthAndWeightRequest.value = false
      await useOverLengthAndWeight(
        count.value,
        actualWeight.value,
        preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
      )
    }
  })
})

watch(defaultModuleFormData, () => {
  initStateData()
})

const initStateData = () => {
  if (defaultModuleFormData.value) {
    setGoodsType(defaultModuleFormData.value?.goodsType || '')
    setProductCode(defaultModuleFormData.value?.productCode || '')
    setPreWaybillGoodsSizeList(
      cloneDeep(
        defaultModuleFormData.value?.preWaybillGoodsSizeList &&
          defaultModuleFormData.value?.preWaybillGoodsSizeList?.length > 0
          ? defaultModuleFormData.value?.preWaybillGoodsSizeList
          : [
              {
                width: '',
                height: '',
                length: '',
                count: 1,
              },
            ],
      ),
    )
    setCount(defaultModuleFormData.value?.count || 0)
    setActualWeight(defaultModuleFormData.value?.actualWeight || 0)
    setMatchList(defaultModuleFormData.value?.matchList || [])
    setVolumeSize(
      defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
    )
  }
}

// 设置体积 只拿一次默认值
const watchVolumSize = watch(defaultModuleFormData, () => {
  if (defaultModuleFormData.value) {
    setVolumeSize(
      defaultModuleFormData.value?.volumeSize || getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
    )
  }
  watchVolumSize()
})

// 切换客户编码后需要执行的逻辑
watch(
  () => piniaStore.globalData.initDataPromise,
  async (promise) => {
    try {
      if (!isNull(promise)) {
        await promise

        if (defaultModuleFormData.value) {
          setVolumeSize(
            defaultModuleFormData.value?.volumeSize ||
              getVolumeSize(defaultModuleFormData.value?.preWaybillGoodsSizeList),
          )
        }
      }
    } catch (error) {
      console.log(error)
    }
  },
)

const handleToProductInfoPage = () => {
  const { isAppointmentPickup } = getQueryObject()
  router.push({
    path: '/product-info',
    query: {
      isAppointmentPickup,
    },
  })
}

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

onBeforeUnmount(() => {
  useOverLengthAndWeightRequest.value = true
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
