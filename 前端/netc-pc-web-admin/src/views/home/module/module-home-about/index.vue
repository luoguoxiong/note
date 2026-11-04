<template>
  <div
    v-if="brandList.length"
    id="home-page-about"
    class="home-page-about"
    v-exposure-report="{
      eventCode: 'exp_homepage_about_kye_v2',
      region_code: 'home_page_about',
    }"
  >
    <div class="about-header">
      <div class="header-left">
        <span class="title-main">了解跨越</span>
        <span class="title-sub">科技物流，为业务赋能</span>
      </div>
      <div class="header-right">
        <More :to-more="handleViewMore"></More>
      </div>
    </div>

    <div class="brand-cards">
      <BrandCard v-for="item in brandList" :key="item.title" :item="item" @click="handleCardClick" />
    </div>

    <!-- 全屏视频遮罩 -->
    <FullscreenIframe v-model:visible="dialogVisible" :src="currentVideo.videoUrl" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHomeStore } from '@/stores/home'
import type { HomePageVideo } from '@/apis/home/types'
import { useRouter } from 'vue-router'
import BrandCard from './components/brand-card.vue'
import FullscreenIframe from './components/fullscreen-iframe.vue'
import More from '@/views/home/components/more/index.vue'

const router = useRouter()

const homeStore = useHomeStore()
// 了解跨越视频取二级接口 profile（store.aboutVideo，数组，与原 videoConfig 同构），渲染多张卡片
const brandList = computed<HomePageVideo[]>(() => (homeStore.aboutVideo || []).filter((item) => item.videoUrl))

const handleViewMore = () => {
  window.$umpOtherReport(
    'CLK',
    { eventCode: 'clk_homepage_about_kye_view_more_v2' },
    { region_code: 'home_page_about' }
  )
  router.push('/admin/kye-style')
}

const handleCardClick = (item: HomePageVideo) => {
  if (!item.videoUrl) return
  currentVideo.value = item
  dialogVisible.value = true
}

// 弹窗状态
const dialogVisible = ref(false)
const currentVideo = ref<HomePageVideo>(brandList.value[0] || { title: '', videoUrl: '', subTitle: '', videoCover: '' })
</script>

<style lang="scss" scoped>
.home-page-about {
  margin-top: 8px;
  padding: 20px 24px 24px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
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

.brand-cards {
  display: grid;
  // 与行业解决方案模块一致采用固定列数：接口少下发一项时槽位留空，卡片不拉伸
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@container home-left (max-width: 1055.99px) {
  .brand-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
