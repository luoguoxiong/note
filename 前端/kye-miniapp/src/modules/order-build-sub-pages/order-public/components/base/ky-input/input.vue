<template>
  <div class="ky-input-content" :class="{ ...classes, notEmpty: valueSize > 0, empty: valueSize === 0 }">
    <ky-input
      v-bind="$attrs"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :clearable="clearable"
      :label-align="labelAlign"
      :show-word-limit="showWordLimit"
      :isError="popoverConfig.content"
      :model-value="modelValue"
      autocomplete="off"
      ref="inputRef"
      @blur="onBlur"
      @focus="onFocus"
      @clear="onClear"
      @update:model-value="onUpdate"
      @confirm="confirmInput"
      @click="onClick"
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
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
const { validateObj, removeValidateKey } = useValidate()
// import { Field } from 'vant'

interface KYInputProps {
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
  refStr?: string
  dataValidate?: string
}
const inputRef = ref<InstanceType<typeof Field> | null>()
defineExpose({
  inputRef,
})
const props = withDefaults(defineProps<KYInputProps>(), {
  noPadding: false,
  showBorder: false,
  showWordLimit: false,
})

const emit = defineEmits(['blur', 'focus', 'update', 'onClearInput', 'confirm', 'click'])

const popoverConfig = computed(() => {
  return validateObj[props.dataValidate as keyof validateObj] || {}
})

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
const onBlur = (event: Event) => {
  isHighLight.value = false
  emit('blur', event)
}

const onClick = (event: Event) => {
  emit('click', event)
  removeValidateKey(props.dataValidate)
}

const onClear = (e: MouseEvent) => {
  console.log('onClear', e)
  // 竟然没抛出clear的事件，为避免onClear已有使用，此处新增 onClearInput
  emit('onClearInput', e)
  setTimeout(() => {
    removeValidateKey(props.dataValidate)
  }, 100)
}

const onUpdate = (e: MouseEvent) => {
  emit('update', e)
  removeValidateKey(props.dataValidate)
}

const onFocus = () => {
  isHighLight.value = true
  emit('focus')
  removeValidateKey(props.dataValidate)
}
const confirmInput = (value: string | number) => {
  emit('confirm', value)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './input.scss';
</style>
