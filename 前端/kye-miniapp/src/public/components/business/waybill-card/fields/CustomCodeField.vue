<template>
  <view class="waybill-card-extra-info custom-code-field" v-if="matched">
    <view class="custom-code-main">
      <view class="waybill-card-extra-info-label">{{ matched.customerWaybillName || name }}：</view>
      <view class="waybill-card-extra-info-content">
        <text class="custom-code-value black-color">{{ matched.customerWaybillNumber || '--' }}</text>
      </view>
    </view>
    <view v-if="showTags" class="custom-code-tags">
      <TimeTagsField :waybillData="waybillData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TimeTagsField from './TimeTagsField.vue'
import { CUSTOM_CODE_PREFIX } from '../config/codes'
import type { FieldProps } from './types'

interface Props extends FieldProps {}
const props = defineProps<Props>()

/**
 * 动态表头(customCode) 字段渲染：
 * code 形如 KYFIELD-${kyField}，按 kyField 匹配 waybillCustomerWaybillList 中
 * customerWaybillType 相等的项，展示其 customerWaybillName（标题）与 customerWaybillNumber（值）。
 */
const matched = computed(() => {
  const kyField = props.code.slice(CUSTOM_CODE_PREFIX.length)
  const list = props.waybillData?.waybillCustomerWaybillList || []
  return list.find((item: any) => String(item.customerWaybillType) === kyField)
})
</script>
<style lang="scss">
.custom-code-field {
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 2px;

  // label + content 作为一个整体，自然宽度，值超长时收缩省略
  .custom-code-main {
    flex: 0 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .waybill-card-extra-info-label {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .waybill-card-extra-info-content {
    flex: 0 1 auto;
    min-width: 0;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .custom-code-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 时间状态标签：保留宽度，不被压缩或裁切
  .custom-code-tags {
    flex-shrink: 0;
  }
}
</style>
