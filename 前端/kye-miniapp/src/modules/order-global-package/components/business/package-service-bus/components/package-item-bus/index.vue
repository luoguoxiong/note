<template>
  <div class="package-service-content-item" @click="() => handleSelect(listItem)">
    <div
      class="content-item-detail"
      :class="{ 'content-item-detail-selected': isSelected(listItem), disabled: listItem.disabled }"
    >
      <img class="item-backgound" :src="listItem.img" />
      <div class="item-bottom-desc font-level5">{{ listItem.desc }}</div>
      <div class="recom-tag" v-if="listItem.recommendationType === '10'">
        <img src="https://ic-img.ky-express.com/netc/20260317_70931_!!1773750369528_226_48.png" />
      </div>
      <!-- 这里也是推荐小标，和ai推荐冲突，沟通后删除 -->
      <!-- <div class="item-bottom-tip font-level5" v-if="listItem.tip">{{ listItem.tip }}</div> -->
      <SvgIcon class="item-checked-icon" v-if="isSelected(listItem)" name="radio-checked" />
      <SvgIcon class="item-checked-icon" v-else-if="!isSelected(listItem)" name="radio-unchecked" />
      <!-- 禁用遮罩 -->
      <div class="disabled-mask" @click.stop="showDisabledTips(listItem.disabledTips)" v-if="listItem.disabled"></div>
    </div>
    <div class="font-level3 bottomtext">{{ listItem.name }}</div>

    <!-- 当包装服务=打木架、打木箱或打木箱（国际）时，木架费的计算规则调整 -->
    <template v-if="hasFrightFeeAuth">
      <template v-if="isWoodVolumeType(listItem)">
        <div class="price-text" v-if="getWoodFrameEstimateFeeExt(listItem)">
          <span v-if="isUnitFee(listItem)" class="price-text-unit">
            <span class="price-text-unit-lebel">单价</span>
            <span>¥{{ decimal(getWoodFrameEstimateFeeExt(listItem) || '') }}/m³</span>
          </span>
          <span v-else class="price-text-total">
            <span v-if="isShowTotalText" class="price-text-unit-lebel">总价</span>
            <span>¥{{ decimal(getWoodFrameEstimateFeeExt(listItem) || '') }}</span>
          </span>
        </div>
      </template>
      <template v-else>
        <div class="price-text" v-if="getWoodFrameEstimateFee(listItem)">
          <span class="price-text-total">
            <span v-if="isShowTotalText" class="price-text-unit-lebel">总价</span>
            <span>¥{{ decimal(getWoodFrameEstimateFee(listItem) || '') }}</span>
          </span>
        </div>
        <div class="price-text" v-if="listItem.value === '130'">
          <span class="price-text-total">以实际使用为准</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { woodenFrameInfoListType } from '../../../../../types'
import SvgIcon from '../../../../ui/svg-icon/index.vue'
import { computed } from 'vue'
import { showToast } from '../../../../../hooks/useShowToast'
import { decimal } from '../../../../../utils/filter'
import { OtherPackageServiceEnum, PackageServiceEnum, WoodFeeType } from '../../../../../types/added-service'

const emits = defineEmits(['select'])

const props = withDefaults(
  defineProps<{
    woodenFrame?: string
    otherWoodFrameList?: string[]
    feeList?: {
      type: PackageServiceEnum | OtherPackageServiceEnum
      value: number
      feeUnitPrice: string
      showFeeUnitPriceFlag: string
    }[]
    type: 'normal' | 'other'
    listItem: woodenFrameInfoListType
    isSelected: (item: woodenFrameInfoListType) => boolean
    hasFrightFeeAuth?: boolean
  }>(),
  {
    hasFrightFeeAuth: true,
  },
)

const showDisabledTips = (str: string | undefined) => {
  if (str) {
    showToast(str)
  }
}

const isWoodVolumeType = (item: woodenFrameInfoListType) => {
  return (
    [PackageServiceEnum.打木箱, PackageServiceEnum['打木箱(国际)'], PackageServiceEnum.打木架].includes(
      item.value as PackageServiceEnum,
    ) && props.type === 'normal'
  )
}

const getWoodFrameEstimateFee = (item: woodenFrameInfoListType) => {
  const feeItem = props.feeList?.find((feeItem) => {
    return feeItem.type + '' === item.value + ''
  })
  if (feeItem) {
    return feeItem.value
  }
}

const getWoodFrameEstimateFeeExt = (item: woodenFrameInfoListType) => {
  const feeItem = props.feeList?.find((feeItem) => {
    return feeItem.type + '' === item.value + ''
  })
  if (feeItem) {
    return feeItem.showFeeUnitPriceFlag === WoodFeeType.单价 ? feeItem.feeUnitPrice : feeItem.value
  }
}

// 是否展示单价
const isUnitFee = (item: woodenFrameInfoListType) => {
  const feeItem = props.feeList?.find((feeItem) => {
    return feeItem.type + '' === item.value + ''
  })
  return feeItem?.showFeeUnitPriceFlag === WoodFeeType.单价
}

const handleSelect = (item: woodenFrameInfoListType) => {
  emits('select', item)
}

const isShowTotalText = computed(() => {
  return props.feeList?.some((v) => v.showFeeUnitPriceFlag === WoodFeeType.单价) && props.type === 'normal'
})
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
