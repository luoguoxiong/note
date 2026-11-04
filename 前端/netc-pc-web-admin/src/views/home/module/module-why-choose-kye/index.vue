<template>
  <div
    id="why-choose-kye"
    class="why-choose-kye"
    v-exposure-report="{
      eventCode: 'exp_homepage_why_choose_kye_v1',
      region_code: 'why_choose_kye',
    }"
  >
    <div class="why-header">
      <span class="title-main">为什么选择跨越速运？</span>
    </div>

    <div ref="container" :class="['why-grid', { narrow: isNarrow }]">
      <div
        v-for="item in featureList"
        :key="item.key"
        class="feature-item"
        @click="handleItemClick(item)"
        v-click-report="{
          eventCode: 'clk_homepage_why_choose_kye_subblock_v1',
          region_code: 'why_choose_kye',
          subblock_name: item.title,
        }"
      >
        <div class="feature-icon">
          <img v-if="item.icon" :src="item.icon" :alt="item.title" />
          <svg-icon v-else :name="item.iconName" />
        </div>
        <div class="feature-info">
          <div class="feature-title">{{ item.title }}</div>
          <div class="feature-desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNarrowContainer } from '../hooks/useNarrowContainer'

interface FeatureItem {
  key: string
  title: string
  desc: string
  icon?: string
  iconName?: string
}

const featureList = ref<FeatureItem[]>([
  {
    key: 'speed',
    title: '跨省最快8小时',
    desc: '24小时上门取派',
    icon: 'https://ic-img.ky-express.com/netc/20261027_44884_!!1793066478296_96_96.png',
  },
  {
    key: 'tracking',
    title: '全程定位跟踪',
    desc: '货物全程可视',
    icon: 'https://ic-img.ky-express.com/netc/20261027_90634_!!1793066480943_96_96.png',
  },
  {
    key: 'network',
    title: '直营网络覆盖',
    desc: '5000+覆盖城市',
    icon: 'https://ic-img.ky-express.com/netc/20261027_60_!!1793066483403_96_96.png',
  },
  {
    key: 'service',
    title: '专属客户服务',
    desc: '7×24小时服务',
    icon: 'https://ic-img.ky-express.com/netc/20261027_40840_!!1793066485659_96_96.png',
  },
])
const container = ref<HTMLElement>()
const isNarrow = useNarrowContainer(container)

const handleItemClick = (item: FeatureItem) => {
  // 埋点已由 v-click-report 处理，预留点击跳转逻辑
  console.log('feature click:', item.key)
}
</script>

<style lang="scss" scoped>
.why-choose-kye {
  margin-top: 8px;
  padding: 16px 24px 20px 24px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.why-header {
  margin-bottom: 16px;

  .title-main {
    font-size: 18px;
    font-weight: 600;
    color: #24262b;
  }
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  // gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  row-gap: 12px;
  column-gap: 16px;
  border-radius: 8px;
  height: 56px;
  transition: all 0.2s ease;
}

.feature-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  background: transparent;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  :deep(svg) {
    width: 24px;
    height: 24px;
    color: #7143f0;
  }
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 13px;
  line-height: 22px;
  color: #24262b;
  margin-bottom: 2px;
  transition: color 0.2s ease;
}

.feature-desc {
  font-size: 12px;
  line-height: 18px;
  color: #8a8d96;
}

.why-grid.narrow {
  grid-template-columns: repeat(1, 1fr);
}
</style>
