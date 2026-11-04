<template>
  <div
    class="custom-encode-tag"
    :data-validate="`kaCustomerMap.customerFieldValue.${info.kyField}`"
    :id="`kaCustomerMap_customerFieldValue_${info.kyField}`"
  >
    <div
      v-for="option in info?.customerFieldDetailList"
      :key="option.msg"
      class="item error_border"
      :class="{ selected: info.customerFieldValue === option.msg }"
      @click="clickItem(option)"
    >
      <SvgIcon
        v-if="props.info.customerFieldValue === option.msg"
        class="icon error-checked-red"
        name="radio-checked"
      />
      <SvgIcon v-else class="icon error-checked-red" name="no-check-icon" />
      <span class="error-ignore">{{ option.msg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { noPassedClassList } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useReset'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { customerFieldDetailListType, kaCustomerMapItem } from '@order-public-sub-public/types'
interface IProps {
  info: kaCustomerMapItem
}

const props = defineProps<IProps>()

const emit = defineEmits(['toggle'])

const clickItem = (option: customerFieldDetailListType) => {
  console.log(option, props.info)
  if (props.info.customerFieldValue === option.msg) {
    emit('toggle', {})
  } else {
    emit('toggle', option)
  }
}
// const iconName = (item: customerFieldDetailListType) => {
//   return props.info.customerFieldValue === item.msg ? 'radio-checked' : 'no-check-icon'
// }
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.custom-encode-tag {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  .item {
    &.selected {
      color: #7143f0;
      background: #f2effe;
      border: 1px solid #8365f6;
    }

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 24px;
    font-size: 28px;
    background: #fff;
    border: 1px solid #cacedb;
    border-radius: 10px;
    .icon {
      margin-right: 4px;
    }
  }
  &.validate-error {
    .error-ignore {
      color: #03050d;
    }
  }
}
</style>
