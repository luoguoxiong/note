<template>
  <div
    id="new-customer-search"
    class="new-customer-search"
    v-exposure-report="{
      eventCode: 'exp_homepage_new_customer_search_v1',
      region_code: 'new_customer_search',
    }"
  >
    <!-- Tab 切换 -->
    <div class="tab-bar">
      <div
        v-for="(tab, index) in visibleTabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === index }]"
        @click="onTabChange(index)"
        v-click-report="{
          eventCode: 'clk_homepage_new_customer_search_tab_v1',
          region_code: 'new_customer_search',
          tab_name: tab.label,
        }"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 动态切换输入组件；KeepAlive 缓存实例，切换 tab 保留各 tab 已输入的值 -->
    <KeepAlive>
      <component :is="currentComponent" @query="handleQuery" @load-error="onTabLoadError(currentTab.key)" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import FreightQuery from './components/freight-query.vue'
import BranchQuery from './components/branch-query.vue'
import ContrabandQuery from './components/contraband-query.vue'

interface TabItem {
  key: string
  label: string
  /** 查询跳转路由 */
  path: string
  /** 对应的输入组件 */
  component: ReturnType<typeof markRaw>
}

const tabs: TabItem[] = [
  { key: 'freight', label: '运费时效查询', path: '/admin/query', component: markRaw(FreightQuery) },
  { key: 'branch', label: '网点查询', path: '/admin/site-query', component: markRaw(BranchQuery) },
  { key: 'contraband', label: '违禁品查询', path: '/admin/contraband', component: markRaw(ContrabandQuery) },
]

const router = useRouter()
const activeTab = ref(0)

/** 远程组件加载失败的 tab，直接从 tab 栏隐藏 */
const loadErrorKeys = ref(new Set<string>())

const visibleTabs = computed(() => tabs.filter((tab) => !loadErrorKeys.value.has(tab.key)))

const currentTab = computed(() => visibleTabs.value[activeTab.value])

const currentComponent = computed(() => currentTab.value?.component)

const onTabChange = (index: number) => {
  activeTab.value = index
}

const onTabLoadError = (key: string) => {
  loadErrorKeys.value.add(key)
  // 被隐藏的 tab 若在当前激活项之前，激活索引左移保持选中项不变
  const failedIndex = tabs.findIndex((tab) => tab.key === key)
  if (failedIndex !== -1 && failedIndex < activeTab.value) {
    activeTab.value -= 1
  }
  if (activeTab.value >= visibleTabs.value.length) {
    activeTab.value = Math.max(0, visibleTabs.value.length - 1)
  }
}

const handleQuery = (payload: Record<string, string>) => {
  const tab = currentTab.value
  if (!tab) return
  const query: Record<string, string> = {
    ...payload,
    from: 'homepage_new_customer_search',
  }
  router.push({ path: tab.path, query })
}
</script>

<style lang="scss" scoped>
.new-customer-search {
  margin-top: 8px;
  padding: 0 24px 32px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

// Tab 切换：灰色条带 + 激活项白色梯形凸起
.tab-bar {
  display: flex;
  align-items: center;
  gap: 40px;
  height: 40px;
  margin: 0 -24px 32px;
  padding: 0 16px;
  box-sizing: border-box;
  // 顶部 1px 白色描边：让灰色渐变条带与卡片顶边之间留出白色间隙
  border-top: 1px solid rgba(255, 255, 255, 1);
  // QA1028：条带通栏（margin 0 -24px）直角顶角溢出卡片 8px 圆角，条带自身跟随圆角；
  // 不用容器 overflow: hidden，避免裁剪查询组件内部绝对定位的联想下拉面板
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, rgba(247, 248, 250, 1) 0%, rgba(249, 250, 254, 1) 100%);
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  color: #686b75;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #7143f0;
  }

  &.active {
    z-index: 1;
    color: #7143f0;

    // 选中白底主体：左右各内收 9px 的圆角矩形，顶部两角 8px 圆角
    &::after {
      content: '';
      position: absolute;
      z-index: -1;
      top: 0;
      bottom: 0;
      left: -9px;
      right: -9px;
      background: #ffffff;
      border-radius: 8px 8px 0 0;
    }

    // 两侧斜腰：9px 宽硬边渐变绘制的直角三角形裙边（斜率 9/32，上端止于 y=8px
    // 与主体圆角衔接），与主体拼合成顶部带圆角的梯形；不用 clip-path 画弧，
    // 避免多边形折线近似圆弧在高清屏出现锯齿
    &::before {
      content: '';
      position: absolute;
      z-index: -1;
      top: 0;
      bottom: 0;
      left: -18px;
      right: -18px;
      background-image: linear-gradient(105.7deg, transparent 50%, #ffffff 50%),
        linear-gradient(254.3deg, transparent 50%, #ffffff 50%);
      background-repeat: no-repeat;
      background-size: 9px 32px;
      background-position: left bottom, right bottom;
    }
  }

  // 最左侧 tab 选中：白色背景与卡片左边缘齐平，左侧不做斜切，避免溢出卡片圆角
  &:first-child.active {
    &::after {
      left: -16px;
    }

    &::before {
      background-image: linear-gradient(254.3deg, transparent 50%, #ffffff 50%);
      background-position: right bottom;
    }
  }
}
</style>
