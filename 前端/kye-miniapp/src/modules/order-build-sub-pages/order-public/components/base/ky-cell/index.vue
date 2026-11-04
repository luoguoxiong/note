<template>
  <ky-cell
    :isError="popoverConfig.content"
    :isLink="isLink && !noBgDisabled"
    :title="title"
    @click="handleClick"
    :required="required && !noBgDisabled"
    v-bind="{ ...$attrs, 'data-validate': undefined }"
    :class="{ 'ky-cell-large-value': largeValue, 'ky-cell-no-bg-disabled': noBgDisabled }"
  >
    <template #title v-if="$slots.title">
      <slot name="title">{{ title }}</slot>
    </template>
    <template #value v-if="$slots.value">
      <slot name="value"></slot>
    </template>
    <template #extra v-if="$slots.extra">
      <span class="ky-cell-extra">
        <slot name="extra"></slot>
      </span>
    </template>
    <!-- <template v-for="slotName in Object.keys($slots)" :key="slotName" v-slot:[slotName]>
      <slot :name="slotName"></slot>
    </template> -->
  </ky-cell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
const { validateObj, removeValidateKey } = useValidate()

const emit = defineEmits(['click'])

export interface KYCellProps {
  largeValue?: boolean
  isLink?: boolean
  dataValidate?: string
  title?: string
  noBgDisabled?: boolean
  required?: boolean
}
const popoverConfig = computed(() => {
  console.log('popoverConfig', props.dataValidate, validateObj[props.dataValidate as keyof validateObj])
  return validateObj[props.dataValidate as keyof validateObj] || {}
})

const props = withDefaults(defineProps<KYCellProps>(), {
  isLink: true,
})

const handleClick = () => {
  if (props.noBgDisabled) return

  removeValidateKey(props.dataValidate || '')
  emit('click')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
<script setup lang="ts"></script>
