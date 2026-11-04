<template>
  <div class="input-associate">
    <van-field
      v-bind="$attrs"
      v-bind:model-value="modelValue?.name"
      autocomplete="off"
      class="input-associate__input"
      clearable
      :border="false"
      @input="handleInput"
      @blur="handleBlur"
      @clear="handleClear"
    />
    <div
      class="input-associate-option"
      :class="{ 'placement-top': placement === 'placement-top' }"
      v-if="option?.length && showPopover"
    >
      <div class="item" v-for="(item, index) in option" :key="index" @click="itemSelect(item)">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { debounce } from 'lodash-es'

import { inputAssociateItem } from '@order-public-sub-root-pages/print-batch/hooks/type'

interface inputAssociateProps {
  option?: inputAssociateItem[]
  associateFn(param: any): void
  placement?: string
  modelValue: inputAssociateItem | undefined
}
const props = defineProps<inputAssociateProps>()

// const value = ref('')
const showPopover = ref(false)
const handleInput = debounce((e) => {
  props.associateFn(e.target.value)
  showPopover.value = true
}, 300)

const emit = defineEmits(['update:modelValue', 'itemSelect'])
const handleClear = () => {
  emit('update:modelValue', {})
}

const handleBlur = () => {
  setTimeout(() => {
    showPopover.value = false
  })
}

const itemSelect = (item: inputAssociateItem) => {
  emit('update:modelValue', item)
  emit('itemSelect', item)
  showPopover.value = false
}

let teleportName = ref('')
onMounted(() => {
  teleportName.value = '.input-associate'
})
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
