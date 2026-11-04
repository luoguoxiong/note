<template>
  <FeePopup
    v-model:modelValue="visible"
    position="center"
    :levelTwo="true"
    :showTitle="false"
    :zIndex="examplePopupOverlayIndex ? Number(examplePopupOverlayIndex) : 200"
    @onClose="close"
  >
    <div class="example example-dialog" @click.stop>
      <div class="example-title">
        <div>
          <span class="example-title-left">示例说明</span>
        </div>
        <SvgIcon class="example-deleted" name="close-icon-padding" @click.stop="close"></SvgIcon>
      </div>
      <Noticebar leftIcon>实际收费以后台报价为准</Noticebar>

      <div class="modal-content" @click.stop>
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
import FeePopup from '../../fee-popup/index.vue'
import SvgIcon from '../../../../../ui/svg-icon/index.vue'
import Noticebar from '../../../../../base/ky-noticebar/noticebar.vue'
import { handleMoneyAmountShow } from '../../../../../../utils'

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

const emit = defineEmits(['close', 'update:modelValue'])
const visible = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    nextTick(() => {
      visible.value = val
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

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style lang="scss">
@import '../../../../../../styles/index.scss';
@import './example.scss';
</style>
