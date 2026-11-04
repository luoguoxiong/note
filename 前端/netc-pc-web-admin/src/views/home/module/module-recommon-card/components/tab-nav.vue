<template>
  <nav class="tab-nav">
    <KButton
      text
      v-for="(item, index) in tabs"
      :key="item.key"
      native-type="button"
      class="tab-item"
      :class="{ active: current === index }"
      @click="handleClick(index)"
    >
      <span class="tab-label">{{ item.label }}</span>
    </KButton>
  </nav>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
interface TabItem {
  key: string
  label: string
}

defineProps<{
  tabs: TabItem[]
  current: number
}>()

const emit = defineEmits<{
  (e: 'update:current', value: number): void
  (e: 'change', value: number): void
}>()

const handleClick = (index: number) => {
  emit('update:current', index)
  emit('change', index)
}
</script>

<style lang="scss" scoped>
.tab-nav {
  width: 152px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tab-item {
  width: 152px;
  height: 48px;
  // QA1103：文字容器（88px）随 tab 居中；border-left 所有 tab 恒占位（透明/紫色），
  // 各 tab 内容区等宽，居中基准一致
  justify-content: center;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: 2px;
  outline: none;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;

  & + & {
    margin-left: 0;
    margin-top: 8px;
  }

  &.active {
    border-left-color: #7143f0;
    background: #f0ecfd;

    .tab-label {
      color: #7143f0;
    }
  }
}

.tab-label {
  // 文字容器固定 88px 宽（justify-content: center 使其在 tab 内居中），文字在容器内左对齐
  width: 88px;
  height: 20px;
  color: #24262b;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  text-align: left;
  white-space: nowrap;
}
</style>
