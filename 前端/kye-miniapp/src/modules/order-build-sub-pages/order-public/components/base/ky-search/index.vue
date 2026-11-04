<template>
  <div
    class="ky-search-content"
    :class="{ ...classes, 'no-padding': noPadding, notEmpty: valueSize > 0, empty: valueSize === 0 }"
  >
    <ky-input
      v-bind="$attrs"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :clearable="clearable"
      :label-align="labelAlign"
      :show-word-limit="showWordLimit"
      :model-value="modelValue"
      autocomplete="off"
      ref="inputRef"
      @blur="onBlur"
      @focus="onFocus"
      @clear="onClear"
      @update:model-value="onUpdate"
    >
      <template #left>
        <SvgIcon name="search-icon" class="search-icon" />
      </template>
      <!-- 通过遍历实现插槽透传 -->
      <template #right v-if="showSearchButtom">
        <div class="search-btn" @click="clickSearch">查询</div>
      </template>
    </ky-input>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

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
  showSearchButtom?: boolean
}
const inputRef = ref()
defineExpose({
  inputRef,
})
const props = withDefaults(defineProps<KYInputProps>(), {
  noPadding: false,
  showBorder: false,
  showWordLimit: false,
  showSearchButtom: false,
})

const emit = defineEmits(['blur', 'focus', 'update', 'onClearInput', 'search'])

const valueSize = computed(() => {
  const value = props.modelValue || ''
  return ('' + value).length
})

const clickSearch = () => emit('search')

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
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
