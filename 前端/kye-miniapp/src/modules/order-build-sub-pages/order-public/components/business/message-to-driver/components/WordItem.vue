<template>
  <div class="high-frequency-item" :class="{ selected: item.selected.value }" @click="$emit('toggle')">
    <SvgIcon v-if="props.item.selected.value" class="icon" name="radio-checked" />
    <SvgIcon v-else class="icon" name="radio-unchecked" />
    <span>{{ item.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { Ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

interface IProps {
  item: {
    label: string
    selected: Ref<boolean>
  }
}

const props = defineProps<IProps>()

defineEmits(['toggle'])
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './HighFrequencyWordWrapper.scss';
</style>
