<template>
  <div class="text-area-content">
    <KyTextarea
      :disabled="disabled"
      autocomplete="off"
      type="textarea"
      class="text-area"
      @clear="clear"
      v-bind="$attrs"
      :cursorSpacing="cursorSpacing"
      :showCount="false"
      :customPlaceholder="true"
      maxlength="99999"
      @focus="onFocus"
      @update:modelValue="onInput"
    ></KyTextarea>
    <div class="tool-content" v-if="isShowTool">
      <span class="clear" @click.stop="clear">清空</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyTextarea from '@order-global-package-order-sub/components/base/ky-textarea/index.vue'
import { computed, ref, watchEffect } from 'vue'
interface TextAreaProps {
  clearbal?: boolean
  number?: boolean
  cursorSpacing?: number
  value: string
  disabled?: boolean
  inputValue?: string
}

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'update:value', visible: string): void
  (event: 'focus', target: HTMLElement): void
}>()

// const inputValue = computed({
//   get() {
//     return props.value
//   },
//   set(v: string) {
//     emit('update:value', v)
//   },
// })

// const valueChange = (v: string) => {
//   console.log(v, props.value)
// }

const props = defineProps<TextAreaProps>()

const inputVal = ref('')
const isShowTool = computed(() => {
  return (props.clearbal || props.number) && inputVal.value
})

const clear = () => {
  inputVal.value = ''
  emit('clear')
}

watchEffect(() => {
  if (props?.inputValue) {
    inputVal.value = props?.inputValue || ''
  }
})

const onInput = (e) => {
  inputVal.value = e
}

const onFocus = (e) => {
  emit('focus', e)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
