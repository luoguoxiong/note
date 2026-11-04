<template>
  <div v-if="dataList?.length > 0" class="package-service--list">
    <div class="type-select-tip" :class="{ 'other-package': type === 'other' }">
      <span>{{ typeTips[type] }}</span
      ><span class="single-tip" v-show="selectTypeTips">{{ selectTypeTips }}</span>
    </div>
    <scroll-view :scroll-x="true" :scroll-y="false" style="width: 100%" class="scroll-height">
      <div :class="`package-service-content ${isPcMiniprogram ? 'in-pc-mina-env' : ''}`">
        <template v-for="item in dataList" :key="item.value">
          <div class="package-service-content-item" @click="() => handleSelect(item)">
            <div
              class="content-item-detail"
              :class="{ 'content-item-detail-selected': isSelected(item), disabled: item.disabled }"
            >
              <img class="item-backgound" :src="item.img" />
              <div class="item-bottom-desc font-level5">{{ item.desc }}</div>
              <div class="item-bottom-tip font-level5" v-if="item.tip">{{ item.tip }}</div>
              <SvgIcon class="item-checked-icon" v-if="isSelected(item)" name="radio-checked" />
              <SvgIcon class="item-checked-icon" v-else-if="!isSelected(item)" name="radio-unchecked" />
              <!-- 禁用遮罩 -->
              <div class="disabled-mask" @click="showDisabledTips(item.disabledTips)" v-if="item.disabled"></div>
            </div>
            <div class="font-level3 bottomtext">{{ item.name }}</div>
            <div class="price-text" v-if="getWoodFrameEstimateFee(item)">
              ¥{{ decimal(getWoodFrameEstimateFee(item) || '') }}
            </div>
          </div>
        </template>
      </div>
    </scroll-view>
  </div>
</template>
<script setup lang="ts">
import { woodenFrameInfoListType } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { computed } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { decimal } from '@order-public-sub-public/utils/filter'
import {
  OtherPackageServiceEnum,
  PackageServiceEnum,
} from '@order-public-sub-public/components/business/added-service/types'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'

const isPcMiniprogram = isDesktopMiniprogram()

const emits = defineEmits(['select'])
const props = defineProps<{
  dataList: woodenFrameInfoListType[]
  woodenFrame?: string
  otherWoodFrameList?: string[]
  feeList?: { type: PackageServiceEnum | OtherPackageServiceEnum; value: number }[]
  type: 'normal' | 'other'
}>()

const typeTips = {
  normal: '常规包装服务',
  other: '更多包装服务',
}

const isSelected = (item: woodenFrameInfoListType) => {
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

const showDisabledTips = (str: string | undefined) => {
  if (str) {
    showToast(str)
  }
}

const getIconName = (item: woodenFrameInfoListType) => {
  if (item.disabled) {
    return 'radio-disabled-unchecked'
  } else {
    return `${isSelected(item) ? 'radio-checked' : 'radio-unchecked'}`
  }
}

const getWoodFrameEstimateFee = (item: woodenFrameInfoListType) => {
  const feeItem = props.feeList?.find((feeItem) => {
    return feeItem.type + '' === item.value + ''
  })
  if (feeItem) {
    return feeItem.value
  }
}

const handleSelect = (item: woodenFrameInfoListType) => {
  if (item.disabled) {
    return
  }
  emits('select', item)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
