<template>
  <section
    id="recommon-card"
    class="recommend-config"
    v-exposure-report="{
      eventCode: 'exp_homepage_recommon_card_v1',
      region_code: 'recommon_card',
    }"
  >
    <aside class="recommend-sidebar">
      <h2 class="recommend-sidebar__title">推荐配置</h2>
      <TabNav class="recommend-sidebar__nav" :tabs="navList" v-model:current="activeIndex" />
    </aside>

    <main class="recommend-main">
      <PreferenceCard
        v-if="activeIndex === 0"
        :is-loading="isNavigating"
        @action="handleAction('/admin/preference-config')"
      />
      <TemplateCard
        v-else-if="activeIndex === 1"
        :template="shippingTemplateCard"
        :is-loading="isNavigating"
        @add-template="handleAction('/admin/order-default-config')"
        @shipping="handleShipping"
      />
      <ImportCard
        v-else
        :template="batchImportTemplateCard"
        :is-loading="isNavigating"
        @action="handleAction('/admin/batch-template')"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/hooks'
import TabNav from './components/tab-nav.vue'
import PreferenceCard from './components/preference-card.vue'
import TemplateCard from './components/template-card.vue'
import ImportCard from './components/import-card.vue'
import {
  SecondPrioritySearchType,
  type NewHomepageBatchImportTemplate,
  type NewHomepageShippingTemplate,
} from '@/apis/home/types'

interface NavItem {
  key: string
  label: string
}

const router = useRouter()
const activeIndex = ref(0)
const isNavigating = ref(false)
const isFetching = ref(false)
const isLoading = computed(() => isNavigating.value || isFetching.value)

const navList: NavItem[] = [
  { key: 'receivePreference', label: '收货偏好' },
  { key: 'shippingTemplate', label: '寄件模板' },
  { key: 'batchImportTemplate', label: '批量导入模板' },
]

// 二级接口 getSecondPriorityData 下发用户已有模板（后端拉取规则：默认模板 > 最新创建的模板）；
// 返回了模板数据即展示模板卡片，未配置/未返回时展示引导卡片。
const { shippingTemplate, batchImportTemplate, store } = useHomeStore()

watch(activeIndex, async (index, _, onCleanup) => {
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })
  isFetching.value = index !== 0
  if (index === 0) return

  try {
    await store.refreshTemplate(
      index === 1 ? SecondPrioritySearchType.SHIPPING_TEMPLATE : SecondPrioritySearchType.BATCH_IMPORT_TEMPLATE
    )
  } catch {
    // 请求层统一提示错误，保留已有模板，切换 Tab 可重试。
  } finally {
    // 快速切换时，旧请求结束不能取消当前 Tab 的加载状态。
    if (!cancelled) isFetching.value = false
  }
})

const shippingTemplateCard = computed<NewHomepageShippingTemplate | null>(() =>
  shippingTemplate.value?.title ? shippingTemplate.value : null
)

const batchImportTemplateCard = computed<NewHomepageBatchImportTemplate | null>(() => batchImportTemplate.value)

const handleAction = (path: string) => {
  if (isLoading.value) return

  isNavigating.value = true
  void router.push({ path }).finally(() => {
    isNavigating.value = false
  })
}

// 有默认模板时跳转单票寄件页；寄件页自动套用默认模板填充表单（协议定稿：无需传模板参数）。
const handleShipping = () => {
  if (isLoading.value || !shippingTemplateCard.value) return

  void router.push({ path: '/admin/order-config-single', query: { needQuerySave: 'false' } })
}
</script>

<style lang="scss" scoped>
.recommend-config {
  width: 100%;
  height: 304px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  container-name: recommend-config;
  container-type: inline-size;
}

.recommend-sidebar {
  width: 200px;
  min-width: 200px;
  height: 304px;
  padding: 24px 24px 32px;
  flex: 0 0 200px;
  background: #ffffff;
  box-sizing: border-box;
}

.recommend-sidebar__title {
  margin: 0;
  color: #24262b;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  white-space: nowrap;
}

.recommend-sidebar__nav {
  margin-top: 24px;
}

// 响应式
.recommend-main {
  width: calc(100% - 200px);
  min-width: 0;
  height: 304px;
  padding-right: 24px;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  box-sizing: border-box;
}
</style>
