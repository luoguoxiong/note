<template>
  <div
    id="industry-info"
    class="industry-info"
    v-exposure-report="{
      eventCode: 'exp_homepage_industry_v1',
      region_code: 'industry_info',
    }"
  >
    <div class="industry-header">
      <span class="title-main">行业解决方案</span>
      <span class="title-sub">为您提供全行业定制化解决方案</span>
    </div>

    <div class="industry-grid" v-if="industryList.length > 0">
      <IndustryCard v-for="item in industryList" :key="item.menuId" :item="item" @click="handleCardClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import IndustryCard from './components/industry-card.vue'
import { useHomeStore } from '@/stores/home'

interface IndustryItem {
  title: string
  desc: string
  imageUrl: string
  active: number
  /** 后台菜单稳定标识：跳转详情页用 menuId 匹配，避免后台重排后下标错位 */
  menuId: number
}

const router = useRouter()
const { industryInfo } = storeToRefs(useHomeStore())

// 卡片封面仅取接口 coverImg，未配置时不显示图；content 正文长图不作为封面
const industryList = computed<IndustryItem[]>(() =>
  (industryInfo.value as Record<string, unknown>[])
    .filter((item) => typeof item.title === 'string')
    .map((item, index) => ({
      title: item.title as string,
      desc: typeof item.subTitle === 'string' ? item.subTitle : '',
      imageUrl: typeof item.coverImg === 'string' ? item.coverImg.trim() : '',
      active: index + 1,
      menuId: Number(item.menuId),
    }))
)

const handleCardClick = (item: IndustryItem) => {
  // 跳转到行业解决方案详情页
  router.push({
    path: '/admin/home/industry',
    query: {
      active: String(item.active),
      menuId: String(item.menuId),
    },
  })
}
</script>

<style lang="scss" scoped>
.industry-info {
  margin-top: 8px;
  padding: 20px 24px 24px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.industry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.title-main {
  font-size: 18px;
  font-weight: 600;
  color: #24262b;
}

.title-sub {
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(---CG-Grey-08, rgba(104, 107, 117, 1));
}

.industry-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

@container home-left (max-width: 1055.99px) {
  .industry-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
