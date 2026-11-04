<template>
  <span class="product-supplement-radio-content" @click="handleClick">
    <span class="checked-content">
      <SvgIcon v-if="checked" class="item-checked-icon" name="radio-checked" />
      <SvgIcon v-else class="item-checked-icon" name="radio-unchecked" />
    </span>
    <span class="radio-label" :class="{ checked: checked }" v-if="label">
      <span>{{ label }}</span>
    </span>
  </span>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
const props = defineProps<{ checked: boolean; label?: string }>()
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', !props.checked)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.product-supplement-radio-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;

  .checked-content {
    display: flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;

    .item-checked-icon {
      height: 100%;
      width: 100%;
      line-height: 40px;
      margin-top: -2px;
    }
  }
  .radio-label {
    font-weight: 600;
    display: flex;
    padding-left: 4px;
    align-items: center;
    line-height: 40px;
    flex-shrink: 0;
    &.checked {
      color: #8365f6;
    }
  }
}
</style>
