<template>
  <div ref="rootRef" class="history-panel">
    <div class="history-title">
      <span class="title-text">搜索历史</span>
      <!-- mousedown.prevent：阻止点击转移焦点导致输入框失焦、面板先于 click 被卸载 -->
      <span class="clear-btn" @mousedown.prevent @click="emit('clear')">清空</span>
    </div>
    <div class="history-list">
      <div
        v-for="(kw, idx) in list"
        :key="`${kw}-${idx}`"
        class="history-item"
        @mousedown.prevent
        @click="emit('select', kw)"
      >
        <span class="history-text" :title="kw">{{ kw }}</span>
        <span class="history-delete" @mousedown.prevent @click.stop="emit('remove', kw)">
          <KIcon :size="14"><Close /></KIcon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { KIcon } from '@netc-design-pc/ui'
import { Close } from '@netc-design-pc/icons'

defineProps<{
  /** 历史关键词列表，按查询时间倒序（新的在前） */
  list: string[]
}>()

const emit = defineEmits<{
  (e: 'select', keyword: string): void
  (e: 'remove', keyword: string): void
  (e: 'clear'): void
}>()

// 暴露根元素，供入口组件做面板滚动校验
const rootRef = shallowRef<HTMLElement | null>(null)
defineExpose({ rootRef })
</script>

<style lang="scss" scoped>
// 搜索历史面板：悬浮于输入框下方（不撑开模块高度），高度随条目数自适应，最高 280px，超高仅列表区滚动
.history-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 280px;
  background: #ffffff;
  border: 1px solid #e6e8ed;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.history-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  font-size: 12px;

  .title-text {
    color: #8c8f99;
  }

  .clear-btn {
    color: #7143f0;
    cursor: pointer;
    user-select: none;
  }
}

.history-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

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

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;

  // 悬浮态 #24262B 6%（设计稿实测 #F2F2F3），同时显示删除按钮
  &:hover {
    background: rgba(36, 38, 43, 0.06);

    .history-delete {
      visibility: visible;
    }
  }

  // 点击态 #24262B 8%
  &:active {
    background: rgba(36, 38, 43, 0.08);
  }
}

// 单条关键词超长时省略号展示，悬浮 title 提示完整内容
.history-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #24262b;
}

// 删除按钮：悬浮该行时出现，用组件库 Close 图标
.history-delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: -8px; // 设计稿图标中心距右缘约 19px
  visibility: hidden;
  color: #8c8f99;

  &:hover {
    color: #24262b;
  }
}
</style>
