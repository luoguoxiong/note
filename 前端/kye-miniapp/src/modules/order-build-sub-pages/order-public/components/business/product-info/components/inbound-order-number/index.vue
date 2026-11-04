<template>
  <div
    v-exposure-report="{
      eventCode: 'exp_express_single_vip_num_v1',
    }"
    :class="`product-info-inbound-order-number inbound-order-number-${moduleStyle}`"
    v-if="dyamincData?.visible"
  >
    <div class="inbound-order-number-title font-level3">唯品会入库号</div>
    <div class="inbound-order-number-title-tips font-level3">如需入仓，请正确填写唯品会系统入库号</div>
    <div
      v-click-report="{
        eventCode: 'clk_express_single_vip_num_v1',
      }"
      class="inbound-order-number-input"
      id="productInfo_productCode"
      data-validate="productInfo.productCode"
    >
      <KyInput
        placeholder="请输入唯品会入库号"
        no-padding
        show-border
        clearable
        v-model="productCode"
        :maxlength="15"
        @blur="onInboundOrderNumberBlur"
        :formatter="formatterProductCode"
        v-keyboard
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { useProductCode } from '../../hooks/useState'
import { useValidate } from '../../hooks/useValidate'
import { useStore } from '@order-public-sub-public/store'
// import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { formatterProductCode } from '@order-public-sub-public/utils'
const piniaStore = useStore()

const dyamincData = computed(() => piniaStore.globalData.dynamicConfig('vipData') || {})

const inputBlurTimer = ref<null | number>(null)

const { productCode } = useProductCode()

const { useProductInfoValidate } = useValidate()

const props = defineProps<{ moduleStyle: string }>()

const emit = defineEmits(['change'])

const onInboundOrderNumberBlur = async () => {
  emit('change', productCode.value)

  if (props?.moduleStyle !== 'unfold') {
    try {
      await useProductInfoValidate('productCode')
    } catch (error) {
      console.error(error)
    }
  }
  window.$umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_single_vip_num_v1' },
    { fill_VIPreceiptno: productCode.value },
  )
}

onUnmounted(() => {
  if (inputBlurTimer.value) {
    clearTimeout(inputBlurTimer.value as number)
    inputBlurTimer.value = null
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
