<template>
  <div class="ky-input-content" :class="{ ...classes, notEmpty: valueSize > 0, empty: valueSize === 0 }">
    <ky-input
      v-bind="$attrs"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :clearable="clearable"
      :label-align="labelAlign"
      :show-word-limit="showWordLimit"
      :isError="isError"
      :model-value="modelValue"
      autocomplete="off"
      ref="inputRef"
      @blur="onBlur"
      @focus="onFocus"
      @clear="onClear"
      @update:model-value="onUpdate"
      @confirm="confirmInput"
      @click="onClick"
      @input="handleInput"
    >
      <!-- 通过遍历实现插槽透传 -->
      <template v-for="(_, key, index) in $slots" :key="index" v-slot:[key]>
        <slot :name="key"></slot>
      </template>
    </ky-input>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface KYInputBaseProps {
  title?: string
  required?: boolean
  showBorder?: boolean
  clearable?: boolean
  placeholder?: string
  maxlength?: number
  labelAlign?: 'top' | 'center' | 'right'
  showWordLimit?: boolean
  noPadding?: boolean
  modelValue?: string | number
  isError?: boolean
  refStr?: string
}

const inputRef = ref<InstanceType<typeof Field> | null>()
defineExpose({
  inputRef,
})

const props = withDefaults(defineProps<KYInputBaseProps>(), {
  noPadding: false,
  showBorder: false,
  showWordLimit: false,
  isError: false,
  maxlength: 140,
})

const emit = defineEmits(['blur', 'focus', 'update', 'onClearInput', 'confirm', 'click', 'input'])

const valueSize = computed(() => {
  const value = props.modelValue || ''
  return ('' + value).length
})

const isHighLight = ref(false)
const classes = reactive({
  highlight: props.showBorder && isHighLight,
  isHighLight: isHighLight,
  showWordLimit: props.showWordLimit,
  noPadding: props.noPadding,
})

const onBlur = (event: Event, value: string) => {
  isHighLight.value = false
  emit('blur', event, value)
}

const onClick = (event: Event) => {
  emit('click', event)
}

const onClear = (e: MouseEvent) => {
  console.log('onClear', e)
  // 竟然没抛出clear的事件，为避免onClear已有使用，此处新增 onClearInput
  emit('onClearInput', e)
}

const onUpdate = (e: MouseEvent) => {
  emit('update', e)
}

const onFocus = () => {
  isHighLight.value = true
  emit('focus')
}

const confirmInput = (value: string | number) => {
  emit('confirm', value)
}

const handleInput = (value: string | number) => {
  emit('input', value)
}
</script>

<style lang="scss" scoped>
@import '../../../styles/index.scss';
@import './input.scss';
</style>
