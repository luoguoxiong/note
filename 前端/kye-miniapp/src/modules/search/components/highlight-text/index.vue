<template>
  <view v-bind="$attrs" class="serach-highlight-text">
    <text v-for="(part, index) in parsedText" :key="index" class="text-warp">
      <text
        class="text-part"
        :style="{
          color: part.highlight ? highlightColor : 'inherit',
          fontWeight: part.highlight ? highlightWeight : 'inherit',
        }"
      >
        {{ part.text }}
      </text>
    </text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import './index.scss'

defineOptions({
  name: 'SearchHighlightText',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    text?: string
    highlight?: string
    color?: string
    weight?: string | number
    caseSensitive?: boolean
  }>(),
  {
    text: '',
    highlight: '',
    color: '#8365F6',
    weight: 'inherit',
    caseSensitive: false,
  },
)

const highlightColor = computed(() => props.color)
const highlightWeight = computed(() => props.weight)

const parsedText = computed(() => {
  const { text, highlight, caseSensitive } = props

  if (!text || !highlight) {
    return [{ text, highlight: false }]
  }

  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`(${highlight})`, flags)

  return text
    .split(regex)
    .filter((part) => part !== '')
    .map((part) => ({
      text: part,
      highlight: caseSensitive ? part === highlight : part.toLowerCase() === highlight.toLowerCase(),
    }))
})
</script>
