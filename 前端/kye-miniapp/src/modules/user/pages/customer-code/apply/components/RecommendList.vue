<template>
  <view v-if="visible && list.length > 0" class="recommend-list">
    <scroll-view scroll-y class="list-scroll">
      <view
        v-for="(item, index) in list"
        :key="index"
        :class="['list-item', item.selected && 'selected']"
        @tap="$emit('select', item)"
      >
        <view class="item-code">
          <text
            v-for="(part, i) in highlightText(item.customerCode)"
            :key="i"
            :class="['code-text', part.highlight && 'active']"
          >
            {{ part.text }}
          </text>
        </view>
        <view class="item-name" :class="{ 'long-text': isLongName(item.customerShortName) }">
          <text
            v-for="(part, i) in highlightText(item.customerShortName)"
            :key="i"
            :class="['name-text', part.highlight && 'active']"
          >
            {{ part.text }}
          </text>
          <text v-if="item.selected" class="selected-tag">已选</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
/**
 * 推荐公司列表组件
 *
 * 用于展示联想推荐的客户编码列表
 * 支持高亮匹配文本、已选标识、长名称处理
 */
import { computed } from 'vue'
import type { RecommendItem } from '../types'
import { LONG_NAME_THRESHOLD } from '../types'

const props = defineProps<{
  list: RecommendItem[]
  visible: boolean
  searchValue?: string
}>()

defineEmits<{
  (e: 'select', item: RecommendItem): void
}>()

const isLongName = (name: string): boolean => {
  return name.length >= LONG_NAME_THRESHOLD
}

interface TextPart {
  text: string
  highlight: boolean
}

const highlightText = (text: string): TextPart[] => {
  if (!props.searchValue || !text) {
    return [{ text, highlight: false }]
  }

  const parts: TextPart[] = []
  const lowerText = text.toLowerCase()
  const lowerSearch = props.searchValue.toLowerCase()

  let lastIndex = 0
  let index = lowerText.indexOf(lowerSearch)

  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), highlight: false })
    }
    parts.push({ text: text.slice(index, index + props.searchValue.length), highlight: true })
    lastIndex = index + props.searchValue.length
    index = lowerText.indexOf(lowerSearch, lastIndex)
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }

  return parts
}
</script>
