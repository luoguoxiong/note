<template>
  <Content>
    <template #title>营销服务</template>
    <template #content>
      <div
        ref="container"
        :class="['marketing-grid', { narrow: isNarrow }]"
        v-exposure-report="{
          eventCode: 'exp_homepage_marketing_card_v1',
          region_code: 'marketing_card',
          otherParams: () => ({
            access_name: marketingApplication.map((item) => item.menuName).join(','),
          }),
        }"
      >
        <KButton
          type="default"
          text
          v-for="item in marketingApplication"
          :key="item.menuCode"
          native-type="button"
          @click="toMenuRouter(item)"
          v-click-report="{
            eventCode: 'clk_homepage_marketing_card_button_v1',
            region_code: 'marketing_card',
            access_name: item.menuName,
          }"
        >
          <img :src="item.menuIcon" alt="" />
          <span class="marketing-name">{{ item.menuName }}</span>
        </KButton>
      </div>
    </template>
  </Content>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import Content from '@/views/home/components/content/index.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHomeStore } from '@/hooks'
import type { LightApplicationInfoListVO } from '@/apis/home/types'
import { useNarrowContainer } from '../hooks/useNarrowContainer'

const router = useRouter()
const container = ref<HTMLElement>()
const isNarrow = useNarrowContainer(container)

// 营销服务卡片数据（新首页轻应用接口下发）
const { marketingApplication } = useHomeStore()

const toMenuRouter = (item: LightApplicationInfoListVO) => {
  router.push({
    path: item.routePath,
  })
}
</script>

<style lang="scss" scoped>
.marketing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  &.narrow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(button) {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    height: 84px;
    padding: 4px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
  }

  :deep(button > span) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  img {
    display: block;
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.marketing-name {
  width: 106px;
  max-width: 100%;
  height: 18px;
  color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
  font-family: 'Microsoft YaHei', sans-serif;
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0;
  text-align: center;
}
</style>
