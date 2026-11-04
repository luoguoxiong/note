<!-- 包装服务 - 基础UI组件 -->
<template>
  <div class="package-service" v-if="visible">
    <div v-if="isShowTitle && moduleStyle !== 'unfold'" class="package-service-title font-level3 flex items-center">
      <span>包装服务</span>
      <slot name="title-prefix"></slot>
    </div>
    <template v-if="isOrderSource">
      <div class="desctitle" v-if="showSizeTips">
        <span class="font-level5 color-sub-title">
          <SvgIcon name="dollar-reminder-line" class="font-level4 mr-8 reminder-icon mt--2"></SvgIcon>
          包装服务需要额外收费，若填写托寄物尺寸，计费会更准确哦
        </span>
      </div>
    </template>

    <template v-if="!isOrderSource">
      <div class="desctitle" v-if="extraTip">
        <span class="font-level5 color-sub-title">
          <SvgIcon name="dollar-reminder-line" class="font-level4 mr-8 reminder-icon mt--2"></SvgIcon>
          {{ extraTip }}
        </span>
      </div>
    </template>

    <!-- 常规包装服务 -->
    <PackageListBus
      :hasFrightFeeAuth="hasFrightFeeAuth"
      :dataList="packageServiceList"
      :woodenFrame="woodenFrame"
      :feeList="packageServiceFee"
      :packageServiceTips="packageServiceTips"
      type="normal"
      @select="(item: woodenFrameInfoListType) => emit('selectNormal', item)"
    />

    <!-- 更多包装服务 -->
    <PackageListBus
      :dataList="otherWoodList"
      :feeList="allocatePackageServiceFee"
      :otherWoodFrameList="otherWoodFrameList"
      type="other"
      @select="(item: woodenFrameInfoListType) => emit('selectOther', item)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '../../ui/svg-icon/index.vue'
import { SourceType, woodenFrameInfoListType } from '../../../types/index'
import { PackageServiceEnum, OtherPackageServiceEnum } from '../../../types/added-service'
import PackageListBus from './components/package-list-bus/index.vue'

interface PackageServiceProps {
  visible: boolean
  moduleStyle: string
  isShowTitle: boolean
  showSizeTips: boolean
  packageServiceList: woodenFrameInfoListType[]
  otherWoodList: woodenFrameInfoListType[]
  woodenFrame?: string
  otherWoodFrameList?: string[]
  packageServiceFee?: {
    type: PackageServiceEnum | OtherPackageServiceEnum
    value: number
    feeUnitPrice: string
    showFeeUnitPriceFlag: string
  }[]
  allocatePackageServiceFee?: {
    type: PackageServiceEnum | OtherPackageServiceEnum
    value: number
    feeUnitPrice: string
    showFeeUnitPriceFlag: string
  }[]
  packageServiceTips?: string
  source?: SourceType
  extraTip?: string
  hasFrightFeeAuth?: boolean
}

const props = withDefaults(defineProps<PackageServiceProps>(), {
  source: 'order',
  hasFrightFeeAuth: true,
})

const isOrderSource = computed(() => !props.source || props.source === 'order')

const emit = defineEmits<{
  selectNormal: [item: woodenFrameInfoListType]
  selectOther: [item: woodenFrameInfoListType]
}>()
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
