<template>
  <view class="text-renderer">
    <template v-for="(part, index) in parts" :key="index">
      <text v-if="isHighlight(part)" class="text-renderer__highlight">
        {{ getHighlightText(part) }}
      </text>
      <text v-else>{{ part }}</text>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import './index.scss'

interface Props {
  text: string
}

const props = defineProps<Props>()

const parts = computed(() => props.text.split(/(##.*?##)/g))

const isHighlight = (part: string): boolean => {
  return part.startsWith('##') && part.endsWith('##')
}

const getHighlightText = (part: string): string => {
  return part.slice(2, -2)
}
</script>
