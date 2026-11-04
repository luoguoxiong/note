<template>
  <div class="product-info-warn-tips" v-if="goodsTypeFeeTips">
    <span class="err-icon-content">
      <SvgIcon v-if="props.showIcon" class="err-tip" name="icon-tips-mony"></SvgIcon>
    </span>
    <span v-exposure-report="expReport()" :class="goodsTypeFeeTips ? 'text' : ''" v-html="goodsTypeFeeTips"></span>
  </div>
</template>

<script lang="ts" setup>
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { computed } from 'vue'
const props = defineProps<{
  source: string
  showIcon?: boolean
}>()
const goodsTypeFeeTips = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData
  return restrictStoreData?.goodsRestrict?.goodsTypeFeeTips
})
const expReport = () => {
  return {
    eventCode: 'exp_express_control_tips_v1',
    regionCode: 'order',
    otherParams: () => {
      return { button_name: props.source, button_content: goodsTypeFeeTips.value || '' }
    },
  }
}
</script>
<!--  -->
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.product-info-warn-tips {
  display: flex;
  position: relative;
  font-size: 24px;
  color: #ff706d;
  font-weight: normal;
  line-height: 34px;
  .err-icon-content {
    height: 34px;
    display: flex;
    align-items: center;
    .err-tip {
      width: 24px;
      height: 24px;
      margin-right: 4px;
    }
  }
  .text {
    color: #ff706d;
    overflow: auto;
    line-height: 34px;
  }
}
</style>
