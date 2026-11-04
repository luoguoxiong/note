<template>
  <div :class="`product-name product-name-${moduleStyle}`" v-if="visible">
    <div class="product-name-title flex items-center space-between">
      <div class="font-level3 flex items-center">
        托寄物<SvgIcon class="product-name-title-required" name="required" v-if="required" />
      </div>
      <!-- 产品说飞书隐藏 违禁品查询 -->
      <div
        v-if="!isH5FSEnv && source === 'order'"
        class="product-name-title-desc font-level4 color-sub-title flex items-center"
        @click="emit('clickTips')"
      >
        <image
          src="https://ic-img.ky-express.com/netc/20260206_20126_!!1770345685782_48_48.png"
          className="img-icon-prohibited"
        /><view class="desc-link">违禁品查询</view>
      </div>
    </div>
    <div
      class="product-name-desc font-level4"
      v-if="tip"
      v-html="isH5FSEnv ? tip : tip?.replace(/span/g, 'text')"
    ></div>
    <slot name="input"></slot>
    <slot name="slideTag"></slot>
    <div v-if="restrictData?.tips?.length > 0 && hasGoodsType">
      <div :class="['product-info-restric-tips font-level4']" v-for="item in restrictTips" :key="item.type">
        <span class="icon-content" v-if="tipsIconName(item) && productNameTipsLength > 1">
          <SvgIcon :name="tipsIconName(item)" class="tips-icon" />
        </span>
        <span :class="tipsClassName(item)">{{ item.msg }}</span>
      </div>
    </div>
    <slot name="deliveryDetailEntry"></slot>
    <!-- 纯电池 新旧电池 -->
    <slot name="pureBattery"></slot>
    <!-- 托寄物补充: 裸货,旧货 -->
    <slot name="productSupplement"></slot>
    <div v-if="moduleStyle == 'unfold'">
      <slot name="warnTips"></slot>
    </div>
    <slot name="aiPackageRecommend"></slot>
    <div class="product-name-package" v-for="item in restrictData?.goodsRestrictPropertyList" :key="item.code">
      <div :data-validate="`productInfo.${item.code}`" :id="`productInfo_${item.code}`">
        <div class="product-name-package-title font-level4 flex items-center">
          {{ item.name }}<SvgIcon class="product-name-package-title-required" name="required" v-if="item.require" />
        </div>
        <div class="product-name-package-content flex space-around">
          <div
            :class="`product-name-package-content-tag font-level4 ${
              radioChecked(item.code) === subItem.code ? 'product-name-package-selected' : ''
            } ${item?.subPropertyList?.length >= 3 ? 'min-width-tag' : 'auto-width-tag'}`"
            v-for="subItem in item.subPropertyList"
            :key="subItem.code"
            @click="() => emit('matchListClick', item.code, subItem.code)"
          >
            <div class="flex items-center">
              <div class="product-name-package-radio pl-16">
                <SvgIcon name="radio-checked" v-if="radioChecked(item.code) === subItem.code"></SvgIcon>
                <SvgIcon name="radio-unchecked" v-else></SvgIcon>
              </div>
              <div
                :class="`pl-8 ${radioChecked(item.code) === subItem.code ? 'radio-checked-text' : 'color-sub-title'}`"
              >
                {{ subItem.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <slot name="consignmentReport"></slot>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '../../ui/svg-icon/index.vue'
import { isH5FSEnv } from '@/public/utils'
import type { RestrictTipItem, MatchItem, RestrictData } from './types'
import { SourceType } from '../../../types/index'

interface ProductNameBusProps {
  visible?: boolean
  required?: boolean
  moduleStyle?: string
  tip?: string
  hasGoodsType?: boolean
  restrictData?: RestrictData
  restrictTips?: RestrictTipItem[]
  productNameTipsLength?: number
  matchList?: MatchItem[]
  source?: SourceType
}

const props = withDefaults(defineProps<ProductNameBusProps>(), {
  visible: true,
  required: false,
  moduleStyle: 'page',
  tip: '',
  hasGoodsType: false,
  restrictTips: () => [],
  productNameTipsLength: 0,
  matchList: () => [],
  source: 'order',
})

const emit = defineEmits(['clickTips', 'matchListClick'])

const radioChecked = (code: string) => {
  let result = ''
  props.matchList?.forEach((item: MatchItem) => {
    if (item.code === code) {
      result = item.value
    }
  })
  return result
}

const tipsIconName = (item: RestrictTipItem) => {
  return 'tip-message-warn'
}

const tipsClassName = (item: RestrictTipItem) => {
  return 'color-warning'
}
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
