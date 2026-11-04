<template>
  <div ref="rootRef" class="contraband-query">
    <!-- 关键词查询 -->
    <div class="form-row">
      <div class="form-label">托寄物</div>
      <div class="input-wrap">
        <KInput
          ref="inputRef"
          :model-value="keyword"
          size="large"
          placeholder="请输入物品名称"
          class="detail-input"
          @update:model-value="handleUserInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @click="ensurePanelVisible"
        />

        <!-- 联想面板 -->
        <SuggestionPanel
          v-if="activePanel === 'suggestions'"
          ref="suggestPanelRef"
          :suggestions="suggestions"
          :fetched-keyword="fetchedKeyword"
          @select="handleSelectKeyword($event.goodsName)"
        />

        <!-- 搜索历史面板 -->
        <HistoryPanel
          v-if="activePanel === 'history'"
          ref="historyPanelRef"
          :list="historyList"
          @select="handleSelectKeyword"
          @remove="removeHistory"
          @clear="clearHistory"
        />
      </div>

      <!-- 查询按钮：与输入框同行 -->
      <KButton class="query-btn" type="primary" @click="handleQuery">查询</KButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KButton, KInput } from '@netc-design-pc/ui'
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import HistoryPanel from './contraband-query/HistoryPanel.vue'
import SuggestionPanel from './contraband-query/SuggestionPanel.vue'
import { useContrabandSearch } from './contraband-query/useContrabandSearch'

const emit = defineEmits<{
  (e: 'query', payload: Record<string, string>): void
}>()

// ===== 搜索业务（请求/防抖/历史/面板切换）=====
const {
  keyword,
  activePanel,
  suggestions,
  fetchedKeyword,
  historyList,
  handleUserInput,
  selectKeyword,
  handleFocus: onSearchFocus,
  handleBlur,
  closePanels,
  removeHistory,
  clearHistory,
} = useContrabandSearch()

// ===== 面板滚动：下方可视空间不足时页面自动向上滚动 =====
// 注意：页面滚动容器是 #app（overflow: auto），而非 window
const PANEL_VIEWPORT_MARGIN = 24 // 滚动后面板底边与可视区底部保留 24px 间距

// 输入框实例（KInput 仅暴露内部 elInputRef，失焦需经其 blur 方法）
const inputRef = ref<InstanceType<typeof KInput> | null>(null)

// 选中回填（联想/历史统一入口）：回填后输入框失焦
const handleSelectKeyword = (kw: string) => {
  selectKeyword(kw)
  inputRef.value?.elInputRef?.blur()
}

const rootRef = shallowRef<HTMLElement | null>(null)
const suggestPanelRef = ref<InstanceType<typeof SuggestionPanel> | null>(null)
const historyPanelRef = ref<InstanceType<typeof HistoryPanel> | null>(null)

// 当前展开面板的根元素
const getPanelEl = (): HTMLElement | null => {
  if (activePanel.value === 'suggestions') {
    return (suggestPanelRef.value?.rootRef ?? null) as HTMLElement | null
  }
  if (activePanel.value === 'history') {
    return (historyPanelRef.value?.rootRef ?? null) as HTMLElement | null
  }
  return null
}

// 向上查找最近的可滚动祖先（overflow-y 为 auto/scroll 且内容超高）
const getScrollParent = (el: HTMLElement): HTMLElement | null => {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

// 面板展开、以及已展开时内容更新（面板变高）后，都重新校验可视空间
const ensureVisible = async () => {
  await nextTick()
  const panel = getPanelEl()
  if (!panel) return
  const scroller = getScrollParent(panel)
  const viewportBottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight
  const overflow = panel.getBoundingClientRect().bottom + PANEL_VIEWPORT_MARGIN - viewportBottom
  if (overflow > 0) {
    if (scroller) {
      scroller.scrollBy({ top: overflow, behavior: 'smooth' })
    } else {
      window.scrollBy({ top: overflow, behavior: 'smooth' })
    }
  }
}

const ensurePanelVisible = () => {
  if (activePanel.value) ensureVisible()
}

watch(activePanel, (val) => {
  if (val) ensureVisible()
})

watch(suggestions, () => {
  if (activePanel.value === 'suggestions') ensureVisible()
})

// 聚焦：业务处理（历史/联想）+ 滚动校验
const handleFocus = () => {
  onSearchFocus()
  ensurePanelVisible()
}

// 查询
const handleQuery = () => {
  if (!keyword.value || !keyword.value.trim()) {
    ElMessage.warning('请输入物品名称')
    return
  }

  const kw = keyword.value.trim()
  closePanels()

  emit('query', {
    keyword: kw,
  })
}

// 点击组件外部收起面板
const onDocClick = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    closePanels()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style lang="scss" scoped>
// label(56) →8px→ 输入区(565) →16px→ 按钮(84)：行 gap 8 + 按钮 margin-left 8 = 16px
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  flex-shrink: 0;
  // 盒宽固定 56px；文字右对齐贴容器右缘，与输入区保持 8px 间距（QA1028）
  width: 56px;
  text-align: right;
  font-size: 13px;
  line-height: 20px;
  color: #24262b;
}

.input-wrap {
  position: relative;
  flex: 0 1 564px;
  min-width: 0;
  max-width: 100%;
}

.detail-input {
  width: 100%;
}

.query-btn {
  flex-shrink: 0;
  margin-left: 9px;
  width: 84px;
  height: 40px;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>
