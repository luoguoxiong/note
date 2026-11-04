<template>
  <div
    class="product-size"
    :class="[
      `product-size-${moduleStyle}`,
      { 'product-size-unfold': moduleStyle === 'unfold', 'product-size-unfold-over-scroll': !isWechat },
    ]"
    v-if="visible && isShowGoodsSize"
  >
    <div class="product-size-title font-level3 flex items-center space-between">
      <slot name="sizeReport"></slot>
      <span v-if="moduleStyle !== 'unfold'"
        >尺寸<SvgIcon class="product-size-title-required" name="required" v-if="required"
      /></span>
      <div v-else></div>
      <slot name="titleRight"></slot>
    </div>
    <div class="p-c-t-b font-level4">长、宽、高单位为 cm；重量请输入单件重量，单位为kg</div>
    <component
      :is="useScrollView ? 'scroll-view' : 'view'"
      :scroll-y="true"
      :style="useScrollView ? 'max-height: 43vh;overflow-y: auto;' : ''"
      class="product-size-input"
      data-validate="productInfo.preWaybillGoodsSizeList"
      id="productInfo_preWaybillGoodsSizeList"
    >
      <div v-for="(item, index) in goodsSizeList" :key="`product-size-${item.id}}`">
        <slot name="sizeRow" :item="item" :index="index"></slot>
      </div>
    </component>
    <div class="product-size-add flex justify-center" v-if="editable">
      <div class="product-size-add-btn font-level4 flex justify-center items-center" @click="emit('addGoodsSize')">
        新增尺寸({{ goodsSizeList?.length }}/{{ maxSize }})
      </div>
    </div>
    <div class="line"></div>
    <div class="product-size-bottom-desc font-level4 color-assist">
      <text class="product-size-bottom-desc-text"
        >注：重量小体积大时按"体积重量"收费。实际重量、体积以物品包装后收派员测量结果为准。</text
      >
      <slot name="bottomDescBtn"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '../../ui/svg-icon/index.vue'
import { GoodsSize } from './types'

interface ProductSizeBusProps {
  visible?: boolean
  moduleStyle?: string
  required?: boolean
  isShowGoodsSize?: boolean
  goodsSizeList: GoodsSize[]
  editable?: boolean
  maxSize?: number
  isWechat?: boolean
  useScrollView?: boolean
}

withDefaults(defineProps<ProductSizeBusProps>(), {
  visible: true,
  moduleStyle: 'page',
  required: false,
  isShowGoodsSize: false,
  goodsSizeList: () => [],
  editable: true,
  maxSize: 5,
  isWechat: true,
  useScrollView: true,
})

const emit = defineEmits(['addGoodsSize', 'clickTips'])
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
