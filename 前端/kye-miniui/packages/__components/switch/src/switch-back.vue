<template>
  <switch
    :class="classes"
    :color="color"
    :checked="checked"
    :disabled="disabled"
    :type="type"
    @change="onChange"
    v-bind="$attrs"
  ></switch>
</template>

<script setup lang="ts" name="ky-switch">
import './index.scss'
import { ref, computed } from 'vue'
import { KySwitchProps } from '@packages/__components/switch/src/types'

const props = withDefaults(defineProps<KySwitchProps>(), {
  color: '#8365f6',
  disabled: false,
  modelValue: false,
  type: 'switch',
  activeValue: true,
  inactiveValue: false,
})

const emit = defineEmits(['change', 'update:modelValue'])

const prefix = 'ky-switch'

const checked = computed(() => {
  console.log('checked', props.modelValue === props.activeValue)
  return props.modelValue === props.activeValue
})

const classes = computed(() => {
  return {
    [`${prefix}`]: true,
    [`${prefix}--size-${props.size}`]: props.size,
    [`${prefix}--unchecked`]: !checked.value,
    [`${prefix}--disabled`]: props.disabled,
  }
})

const onChange = (event: Event) => {
  emit('change', event?.detail?.value, event)
  emit('update:modelValue', event?.detail.value)
}
</script>

<style lang="scss">
.ky-switch {
  &--disabled {
    opacity: 0.3;
  }
  /**/
  &--size-large {
    zoom: 1.5;
    .wx-switch-input {
      //transform: scale(1.5);
      //margin: 10px 0;
      width: 160px;
      height: 80px;
      border-radius: 177px;
      overflow: hidden;
      &:before {
        width: 156px;
        height: 76px;
        //margin-right: 38px;
        border-radius: 177px;
      }
      &:after {
        width: 72px;
        height: 70px;
        margin-top: 2px;
        margin-left: 38px;
      }
    }
    &.ky-switch--unchecked {
      .wx-switch-input {
        &:after {
          width: 72px;
          margin-left: 2px;
        }
      }
    }
  }
  &--size-medium {
    zoom: 1.2;
  }
  &--size-small {
    zoom: 0.8;
  }
  &--size-mini {
    zoom: 0.5;
  }
}
</style>
