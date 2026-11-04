<template>
  <div ref="rootRef" class="suggest-panel">
    <div v-for="item in suggestions" :key="item.id" class="goods-item" @mousedown.prevent @click="emit('select', item)">
      <div class="goods-name">
        <span class="name-text">
          <span
            v-for="(seg, segIdx) in splitHighlight(item.goodsName, fetchedKeyword)"
            :key="segIdx"
            :class="{ 'name-hit': seg.hit }"
            >{{ seg.text }}</span
          >
        </span>
        <span v-if="item.firstCategory" class="goods-category">{{ item.firstCategory }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import type { FuzzyGoods } from '@/apis/home/types'

defineProps<{
  suggestions: FuzzyGoods[]
  /** 当前结果对应的关键词，用于面板内高亮 */
  fetchedKeyword: string
}>()

const emit = defineEmits<{
  (e: 'select', item: FuzzyGoods): void
}>()

// 暴露根元素，供入口组件做面板滚动校验
const rootRef = shallowRef<HTMLElement | null>(null)
defineExpose({ rootRef })

// 将物品名按关键词拆分为 [文本, 是否命中] 片段（大小写不敏感），用于面板内高亮
const splitHighlight = (name: string, keyword: string): { text: string; hit: boolean }[] => {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return [{ text: name, hit: false }]
  const segments: { text: string; hit: boolean }[] = []
  const lowerName = name.toLowerCase()
  let idx = 0
  while (idx < name.length) {
    const pos = lowerName.indexOf(kw, idx)
    if (pos === -1) {
      segments.push({ text: name.slice(idx), hit: false })
      break
    }
    if (pos > idx) segments.push({ text: name.slice(idx, pos), hit: false })
    segments.push({ text: name.slice(pos, pos + kw.length), hit: true })
    idx = pos + kw.length
  }
  return segments
}
</script>

<style lang="scss" scoped>
// 联想面板：悬浮于输入框下方（不撑开模块高度），宽度跟随输入框，超高出现滚动条
.suggest-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e6e8ed;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdee6;
    border-radius: 3px;

    &:hover {
      background: #c9cdd4;
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.goods-item {
  padding: 8px 10px;
  line-height: 1.4;
  cursor: pointer;
  user-select: none; // 点击选择时避免拖选文字

  // 悬浮态 #24262B 6%
  &:hover {
    background: rgba(36, 38, 43, 0.06);
  }

  // 点击态 #24262B 8%
  &:active {
    background: rgba(36, 38, 43, 0.08);
  }
}

.goods-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
  color: #24262b;
}

// 命中关键词高亮
.name-hit {
  color: #7143f0;
}

.goods-tag {
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 3px;
  font-size: 12px;

  &.tag-safe {
    color: #0aa870;
    background: rgba(10, 168, 112, 0.08);
  }

  &.tag-air-banned {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }

  &.tag-land-banned {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }
}

.goods-category {
  flex-shrink: 0;
  margin-left: 8px;
  font-size: 13px;
  line-height: 20px;
  color: #686b75;
}
</style>
