<template>
  <FeePopup
    v-bind="$attrs"
    v-model:modelValue="show"
    :show-confirm-button="false"
    :zIndex="200"
    position="center"
    :showTitle="false"
    :levelTwo="true"
    class="example-dialog-popup"
  >
    <div class="example example-dialog">
      <div class="example-title">
        <div>
          <span class="example-title-left">示例说明</span>
        </div>
        <SvgIcon class="example-deleted" name="close-icon-padding" @click.stop="close"></SvgIcon>
      </div>
      <Noticebar leftIcon>实际收费以后台报价为准</Noticebar>

      <div class="modal-content">
        <div class="example-method">
          <text>收费方式:</text>
          <text> {{ feeFormula.chargeDesc }}</text>
        </div>
        <div class="example-desc">{{ feeFormula.exampleRemark }}</div>
        <div class="example-chargeType">
          <div class="example-chargeType-title">{{ desc.introduce }}区间收费标准：</div>
          <div class="example-chargeType-fill">
            <div class="example-chargeType-fill-header example-chargeType-fill-item">
              <span>{{ feeFormula.amountExampleTableHeaderOne }}</span>
              <span>{{ feeFormula.amountExampleTableHeaderTwo }}</span>
            </div>
            <div
              v-for="(item, index) in amountExampleList"
              :key="index"
              class="example-chargeType-fill-item"
              :class="index < amountExampleList.length - 1 ? 'example-chargeType-fill-item-line' : ''"
            >
              <span>{{ `${item?.start || ''}` }}~{{ `${item.end}` }}</span>
              <span>{{ handleMoneyAmountShow(item.price) }}</span>
            </div>
          </div>
        </div>
        <div class="example-footer">{{ feeFormula.exampleFormula }}</div>
      </div>
    </div>
  </FeePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, PropType, ref, watch } from 'vue'
// import { Dialog } from '@order-public-sub-public/hooks/useShowToast'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import FeePopup from '@order-public-sub-public/components/business/estimated-cost/components/fee-popup/index.vue'

interface AmountExampleList {
  start: number
  end: number
  price: number
}
const props = defineProps({
  amountExampleList: {
    type: Array as PropType<AmountExampleList[]>,
    default: () => [],
  },
  feeFormula: {
    type: Object,
    required: true,
  },
  examplePopupOverlayIndex: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
// const examplePopupIndex = computed(() => Number(props.examplePopupOverlayIndex) + 1)
const show = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    nextTick(() => {
      show.value = val
    })
  },
)
const desc = computed(() => {
  let title = '',
    introduce = '',
    unit = ''
  switch (props.feeFormula?.chargeType) {
    case '10':
      title = '对段收费'
      introduce = '对段'
      unit = 'kg'
      break
    case '20':
      title = '分段收费'
      introduce = '分段'
      unit = 'kg'
      break
    case '30':
      title = '对段 + 首重'
      introduce = '对段'
      unit = 'kg'
      break
    case '50':
      title = '按方收费'
      introduce = '方数'
      unit = 'm³'
      break
  }
  return { title, introduce, unit }
})

const handleMoneyAmountShow = (price: number) => {
  return Number(price || 0)?.toFixed(2)
}

const close = () => {
  emit('close')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
