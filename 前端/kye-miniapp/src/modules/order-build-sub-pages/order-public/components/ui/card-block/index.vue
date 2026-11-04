<template>
  <div class="card-container">
    <div class="form-title flex items-center space-between">
      <div class="font-level2 mr-8 flex items-center">
        <span class="form-title-text">{{ title }}</span>
        <span class="card-block-tip" v-if="tip" v-html="tip"></span>
      </div>
      <span class="clear" v-if="showClear" @click="clearForm">清空</span>
      <slot name="right-slot"></slot>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['clearForm'])
defineProps({
  title: {
    type: String,
    default: '',
  },
  tip: {
    type: String,
    default: '',
  },
  showClear: {
    type: Boolean,
    default: false,
  },
})
const clearForm = () => {
  emit('clearForm')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
