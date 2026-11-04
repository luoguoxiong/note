<template>
  <div
    v-exposure-report="{
      eventCode: 'exp_express_single_vip_num_v1',
    }"
    class="inbound-order-number"
  >
    <div class="inbound-order-number-title font-level3">
      <span>{{ info?.customerFieldName }}</span>
      <SvgIcon v-if="info?.requiredStatus" class="required" name="required"></SvgIcon>
    </div>
    <div class="inbound-order-number-title-tips font-level3">{{ info?.kaTypeFlagTips }}</div>
    <div
      v-click-report="{
        eventCode: 'clk_express_single_vip_num_v1',
      }"
      class="inbound-order-number-input"
      :id="validateNameId()"
      :data-validate="validateName()"
    >
      <KyInput
        :data-validate="validateName()"
        placeholder="请输入唯品会入库号"
        no-padding
        show-border
        clearable
        v-model="productCode"
        :maxLength="15"
        @blur="onInboundOrderNumberBlur"
        :formatter="formatterProductCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { formatterProductCode } from '@order-public-sub-public/utils'
import { kaCustomerMapItem } from '@order-public-sub-public/types'
import { useProductCodeValidate } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/components/inbound-order-number/hooks/useValidate'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useInboundOrderNumber } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/components/inbound-order-number/hooks/useState'
import { effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const { productCodeValidate } = useProductCodeValidate()
const { productCode } = useInboundOrderNumber()

const props = defineProps<{ info: kaCustomerMapItem | undefined }>()

const emit = defineEmits(['change'])

const onInboundOrderNumberBlur = async () => {
  try {
    const validateResult = productCodeValidate(productCode.value, {
      needRemoteCheck: false,
      fieldName: validateName(),
    })
    if (!validateResult.passed && getCurrentPageName() === 'custom-encode') {
      effectBubble([validateResult])
    }
    change()
  } catch (error) {
    console.error(error)
  }
  umpOtherReport('OTHER', { eventCode: 'other_express_single_vip_num_v1' }, { fill_VIPreceiptno: productCode.value })
}

const change = () => {
  emit('change', {
    customerFieldValue: productCode.value,
    kyField: props.info?.kyField,
  })
}

const validateName = () => {
  return `kaCustomerMap.customerFieldValue.${props.info?.kyField}`
}
const validateNameId = () => {
  return `kaCustomerMap_customerFieldValue_${props.info?.kyField}`
}

watchEffect(() => {
  productCode.value = props.info?.customerFieldValue || ''
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import 'index';
</style>
