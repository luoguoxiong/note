<template>
  <div class="tab-content">
    <div
      :class="{
        'tab-item': true,
        active: item.value === active,
      }"
      @click="handChange(item.value)"
      v-for="item in data"
      :key="item.value"
    >
      {{ item.label }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { Options } from '@/types'

interface TabProps {
  active: string | number
  data: Options[]
}
const props = defineProps<TabProps>()

const emit = defineEmits(['change'])

const handChange = (tabVal: string | number) => {
  if (tabVal !== props.active) {
    emit('change', tabVal)
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
