<template>
  <div class="select-button">
    <div class="select-button-label">{{ label }}</div>
    <div class="select-button-option">
      <div
        class="item"
        :class="{ active: modelValue === item.id }"
        v-for="item in option"
        :key="item.id"
        @click="$emit('update:modelValue', item.id)"
      >
        <SvgIcon v-if="modelValue === item.id" class="select-button-active" name="select-button-active" />
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

interface selectButtonItem {
  id: number
  name: string
}

interface selectButtonProps {
  option: selectButtonItem[]
  label: string
  modelValue: number
}

defineProps<selectButtonProps>()
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
