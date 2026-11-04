<template>
  <view :class="classes" :style="style" @click="onClick">
    <view class="ky-switch-button">
      <template v-if="loading">
        <slot name="icon">
          <view class="ky-switch-loading"></view>
        </slot>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts" name="ky-switch">
import './index.scss'
import { ref, computed, watch } from 'vue'
import { KySwitchProps } from '@packages/__components/switch/src/types'

const props = withDefaults(defineProps<KySwitchProps>(), {
  color: '#8365f6',
  type: 'switch',
  size: 'medium',
  disabled: false,
  modelValue: false,
  loading: false,
  // 打开组件值
  activeValue: true,
  // 关闭组件值
  inactiveValue: false,
  activeColor: '#8365F6',
  inactiveColor: '#E6E8ED',
})

const emit = defineEmits(['change', 'update:modelValue'])

const prefix = 'ky-switch'
/* 开关是否打开 */
const checked = computed(() => {
  return props.modelValue === props.activeValue
})

const classes = computed(() => {
  return {
    [`${prefix}`]: true,
    [checked.value ? `${prefix}--open` : `${prefix}--close`]: true,
    [`${prefix}--size-${props.size}`]: props.size,
    [`${prefix}--disabled`]: disabled.value,
  }
})

const disabled = computed(() => props.disabled)

const style = computed(() => {
  return {
    backgroundColor: checked.value ? props.activeColor : props.inactiveColor,
  }
})

const triggerType = ref('')

const onClick = (event: Event) => {
  if (props.loading || disabled.value) return
  const value = checked.value ? props.inactiveValue : props.activeValue
  triggerType.value = 'click'
  emit('update:modelValue', value)
  emit('change', value, event)
}

const onChange = (value: any) => {
  emit('change', value)
}

// watch(
//   () => props.modelValue,
//   (v) => {
//     if (triggerType.value == 'click') {
//       triggerType.value = ''
//     } else {
//       onChange(v)
//     }
//   },
// )
</script>
