<template>
  <div v-if="dataList?.length > 0" class="package-service--list">
    <div class="package-service-tips" v-if="packageServiceTips">
      <SvgIcon name="dollar-reminder-line" class="reminder-icon"></SvgIcon>
      <span>{{ packageServiceTips }}</span>
    </div>
    <div class="type-select-tip" :class="{ 'other-package': type === 'other' }">
      <span>{{ typeTips[type] }}</span
      ><span class="single-tip" v-show="selectTypeTips">{{ selectTypeTips }}</span>
    </div>
    <scroll-view :scroll-x="true" :scroll-y="false" style="width: 100%" class="scroll-height">
      <div :class="`package-service-content ${isPcMiniprogram ? 'in-pc-mina-env' : ''}`">
        <template v-for="item in dataList" :key="item.value">
          <PackageItemBus
            :hasFrightFeeAuth="hasFrightFeeAuth"
            @select="handleSelect"
            :feeList="feeList"
            :type="type"
            :woodenFrame="woodenFrame"
            :otherWoodFrameList="otherWoodFrameList"
            :listItem="item"
            :isSelected="isSelectedItem"
          ></PackageItemBus>
        </template>
      </div>
    </scroll-view>
  </div>
</template>
<script setup lang="ts">
import { woodenFrameInfoListType } from '../../../../../types'
import SvgIcon from '../../../../ui/svg-icon/index.vue'
import { computed } from 'vue'
import { OtherPackageServiceEnum, PackageServiceEnum } from '../../../../../types/added-service'
import { isDesktopMiniprogram } from '../../../../../utils/native'
import PackageItemBus from '../package-item-bus/index.vue'

const isPcMiniprogram = isDesktopMiniprogram()

const emits = defineEmits(['select'])

const props = withDefaults(
  defineProps<{
    dataList: woodenFrameInfoListType[]
    woodenFrame?: string
    otherWoodFrameList?: string[]
    feeList?: {
      type: PackageServiceEnum | OtherPackageServiceEnum
      value: number
      feeUnitPrice: string
      showFeeUnitPriceFlag: string
    }[]
    type: 'normal' | 'other'
    packageServiceTips?: string
    hasFrightFeeAuth?: boolean
  }>(),
  {
    hasFrightFeeAuth: true,
  },
)

const typeTips = {
  normal: '常规包装服务',
  other: '更多包装服务',
}

const isSelectedItem = (item: woodenFrameInfoListType) => {
  if (props.type === 'normal') {
    return props.woodenFrame + '' === item.value
  } else {
    const index = props.otherWoodFrameList?.findIndex((v) => v + '' === item.value)
    return index !== -1
  }
}

const selectTypeTips = computed(() => {
  if (props.type === 'normal') {
    return '(单选)'
  } else {
    if (props.dataList?.length > 1) {
      return '(多选)'
    }
    return ''
  }
})

const handleSelect = (item: woodenFrameInfoListType) => {
  if (item.disabled) {
    return
  }
  emits('select', item)
}
</script>
<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
