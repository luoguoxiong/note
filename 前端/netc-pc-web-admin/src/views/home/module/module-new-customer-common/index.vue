<template>
  <Content>
    <template #title>推荐功能</template>
    <template #content>
      <div
        id="new-customer-common"
        v-exposure-report="{
          eventCode: 'exp_homepage_new_customer_common_v1',
          region_code: 'new_customer_common',
        }"
      >
        <div ref="container" :class="['common-grid', { narrow: isNarrow }]">
          <div
            v-for="item in functionList"
            :key="item.menuCode"
            class="grid-item"
            @click="handleItemClick(item)"
            v-click-report="{
              eventCode: 'clk_homepage_new_customer_common_subblock_v1',
              region_code: 'new_customer_common',
              subblock_name: item.menuName,
            }"
          >
            <div class="item-icon">
              <img v-if="item.menuIcon" :src="item.menuIcon" :alt="item.menuName" />
            </div>
            <div class="item-label">{{ item.menuName }}</div>
          </div>
        </div>
      </div>
    </template>
  </Content>
</template>

<script setup lang="ts">
import Content from '@/views/home/components/content/index.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/hooks/useHomeStore'
import type { LightApplicationInfoListVO } from '@/apis/home/types'
import { useNarrowContainer } from '../hooks/useNarrowContainer'

const router = useRouter()
const container = ref<HTMLElement>()
const isNarrow = useNarrowContainer(container)

// 推荐功能数据（新首页轻应用接口 newCusomerApplication 下发）
const { newCusomerApplication: functionList } = useHomeStore()

const handleItemClick = (item: LightApplicationInfoListVO) => {
  router.push({
    path: item.routePath,
  })
}
</script>

<style lang="scss" scoped>
.common-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 8px;
  column-gap: 8px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 64px;
  padding: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(36, 38, 43, 0.03);
  }

  &:active {
    background: rgba(36, 38, 43, 0.06);
  }
}

.item-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border: 0;
  border-radius: 0;
  background: transparent;
  transition: transform 0.2s ease;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
}

.item-label {
  font-size: 12px;
  line-height: 18px;
  color: #24262b;
  text-align: center;
  transition: color 0.2s ease;
}

.common-grid.narrow {
  grid-template-columns: repeat(2, 1fr);
}
</style>
