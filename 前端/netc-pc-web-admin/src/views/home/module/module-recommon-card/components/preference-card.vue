<template>
  <section class="recommend-panel">
    <div class="recommend-panel__content">
      <header class="recommend-panel__header">
        <h3 class="recommend-panel__title">收货偏好设置</h3>
        <span class="recommend-panel__tag">推荐配置</span>
      </header>

      <p class="recommend-panel__description">
        用于设置指定收货时间，系统自动匹配可派送时间，减少无效投递对收方造成的打扰
      </p>

      <div class="recommend-panel__features">
        <div v-for="feature in features" :key="feature.label" class="recommend-panel__feature">
          <img class="recommend-panel__feature-icon" :src="feature.icon" alt="" />
          <span class="recommend-panel__feature-text">{{ feature.label }}</span>
        </div>
      </div>

      <div class="recommend-panel__actions">
        <KButton
          :loading="isLoading"
          native-type="button"
          class="recommend-panel__button"
          :disabled="isLoading"
          :aria-busy="isLoading"
          v-click-report="{
            eventCode: 'clk_homepage_recommon_card_preference_action_v1',
            region_code: 'recommon_card',
            button_name: '立即设置',
          }"
          @click="emit('action')"
        >
          <template #loading>
            <ButtonLoadingIcon :src="LOADING_IMG" :size="14" :mr="0" />
          </template>
          <span>立即设置</span>
        </KButton>
      </div>
    </div>

    <div class="recommend-panel__preview">
      <img
        class="recommend-panel__preview-image"
        src="https://ic-img.ky-express.com/netc/20260831_22680_!!1788140988398_800_512.png"
        alt="收货偏好设置"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240506_23970395195_!!1714993379948_14_14.png'

defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()

const features = [
  {
    label: '工作日/周末时段',
    icon: 'https://ic-img.ky-express.com/netc/20260831_38330_!!1788142245181_28_28.png',
  },
  {
    label: '节假日时段',
    icon: 'https://ic-img.ky-express.com/netc/20260831_90471_!!1788142660448_28_28.png',
  },
  {
    label: '指定时段',
    icon: 'https://ic-img.ky-express.com/netc/20260831_1694_!!1788142650958_28_28.png',
  },
]
</script>

<style lang="scss" scoped>
@import './recommend-panel.scss';

.recommend-panel__content {
  min-width: 244px;
  flex: 1 0 244px;
}

.recommend-panel__preview {
  min-width: 0;
  flex-shrink: 1;
}

.recommend-panel__preview-image {
  width: 100%;
}
</style>
