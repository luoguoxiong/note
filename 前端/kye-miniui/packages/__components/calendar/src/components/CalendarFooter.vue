<template>
  <div v-if="props.showTips || props.showConfirm" class="ky-calendar__footer">
    <div v-if="props.showTips" class="ky-calendar__footer-tips">
      <slot name="footer-tips">
        <span>*可筛选查询180天内运单，选择时间范围不可超过90天</span>
      </slot>
    </div>
    <div v-if="props.showConfirm" class="ky-calendar__footer-button">
      <KyButton
        type="primary"
        size="large"
        :disabled="props.confirmDisable"
        class="ky-calendar__footer-button-base"
        @click="emit('confirm')"
      >确定</KyButton>
    </div>
  </div>
</template>

<script lang="ts" setup name="calendar-footer">
import { useSlots } from 'vue'
import KyButton from '@ky-miniui-lib/button'

const slots = useSlots();
const props = withDefaults(defineProps<{
  showTips: boolean
  showConfirm: boolean
  confirmDisable: boolean
}>(), {
  showTips: true,
  showConfirm: true,
  confirmDisable: false,
})
const emit = defineEmits(['confirm'])
</script>

<style lang="scss">
.ky-calendar__footer {
  background-color: #fff;
  border-top: 1px solid #E6E8ED;
  //box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);

  &-tips {
    padding: 16px 32px;
    font-size: 24px;
    font-weight: normal;
    line-height: 34px;
    text-align: center;
    color: #8C8F99;
  }

  &-button {
    padding: 16px 32px;
    display: flex;

    &-base {
      flex: 1;
      border-radius: 16px;
      border: none;
      font-weight: 600;
    }
  }
}
</style>
