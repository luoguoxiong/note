<!-- 高频词外层组件 -->
<template>
  <div class="high-frequency-word-Wrapper">
    <div class="high-frequency-title">您可选择标签，更便捷</div>
    <div class="high-frequency-list">
      <WordItem v-for="option in options" :key="option.id" :item="option" @toggle="toggleSelection(option.id)" />
    </div>
    <div class="high-frequency-title mt-32">还有其他想对司机说的话</div>
  </div>
</template>

<script setup lang="ts">
import { Ref } from 'vue'
import WordItem from './WordItem.vue'

interface IProps {
  options: { id: string; label: string; selected: Ref<boolean> }[]
}

const props = defineProps<IProps>()

const toggleSelection = (code: string) => {
  props.options?.forEach((option) => {
    if (option.id === code) {
      option.selected.value = !option.selected.value
    }
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './HighFrequencyWordWrapper.scss';
</style>
