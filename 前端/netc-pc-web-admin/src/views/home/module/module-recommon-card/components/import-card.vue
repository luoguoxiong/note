<template>
  <section class="recommend-panel">
    <div v-if="template" class="recommend-panel__decoration">
      <img
        class="recommend-panel__decoration-image"
        src="https://ic-img.ky-express.com/netc/20260831_25055_!!1788148991268_800_512.png"
        alt=""
      />
    </div>

    <div class="recommend-panel__content">
      <header class="recommend-panel__header">
        <h3 class="recommend-panel__title">批量导入模板</h3>
        <span class="recommend-panel__tag">推荐配置</span>
      </header>

      <p class="recommend-panel__description">
        将映射规则存为模板，一次配置，多次复用，支持按客户、按品类创建多套模板，提升批量下单效率
      </p>

      <div class="recommend-panel__actions">
        <KButton
          :loading="isLoading"
          native-type="button"
          class="recommend-panel__button"
          :disabled="isLoading"
          :aria-busy="isLoading"
          v-click-report="{
            eventCode: 'clk_homepage_recommon_card_import_action_v1',
            region_code: 'recommon_card',
            button_name: '添加模板',
          }"
          @click="emit('action')"
        >
          <template #loading>
            <ButtonLoadingIcon :src="LOADING_IMG" :size="14" :mr="0" />
          </template>
          <span>添加模板</span>
        </KButton>
      </div>
    </div>

    <article v-if="template" class="import-template-card">
      <header class="import-template-card__header">
        <div class="import-template-card__title" :title="template.name">{{ template.name }}</div>
        <span v-if="template.default" class="import-template-card__default">默认</span>
      </header>

      <div class="import-template-card__body">
        <p class="import-template-card__remark" :title="template.remark">备注：{{ template.remark }}</p>
        <img class="import-template-card__watermark" :src="EXCEL_WATERMARK_IMG" alt="" />
      </div>
    </article>

    <div v-else class="recommend-panel__preview">
      <img
        class="recommend-panel__preview-image"
        src="https://ic-img.ky-express.com/netc/20260831_10222_!!1788140988394_800_512.png"
        alt="批量导入模板"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
import type { NewHomepageBatchImportTemplate } from '@/apis/home/types'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240506_23970395195_!!1714993379948_14_14.png'

const EXCEL_WATERMARK_IMG =
  'data:image/png;base64,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'

defineProps<{
  template: NewHomepageBatchImportTemplate | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<style lang="scss" scoped>
@import './recommend-panel.scss';

.recommend-panel__decoration {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 0;
  width: 400px;
  height: 256px;
  overflow: hidden;
  pointer-events: none;
}

.recommend-panel__decoration-image {
  display: block;
  width: 400px;
  height: 256px;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.import-template-card {
  position: relative;
  z-index: 3;
  display: flex;
  overflow: hidden;
  width: 260px;
  height: 200px;
  margin-right: 24px;
  border: 1px solid #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 24px -2px rgba(35, 0, 133, 0.12);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0.002%, rgba(194, 172, 255, 0.16) 99.998%),
    rgba(255, 255, 255, 1);
  flex: 0 0 260px;
  flex-direction: column;
  box-sizing: border-box;
}

.import-template-card__header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 16px;
  border-bottom: 1px solid #e6e8ed;
  flex: 0 0 56px;
  box-sizing: border-box;
}

.import-template-card__title {
  overflow: hidden;
  max-width: 188px;
  height: 22px;
  font-size: 15px;
  white-space: nowrap;
  color: #24262b;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
}

.import-template-card__default {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 18px;
  padding: 0 4px;
  margin-left: 8px;
  font-size: 12px;
  white-space: nowrap;
  color: #f57200;
  background: #fff3e5;
  border: 1px solid #ffbc70;
  border-radius: 2px;
  flex: 0 0 32px;
  line-height: 18px;
  box-sizing: border-box;
}

.import-template-card__body {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 0;
  padding: 16px;
  flex: 1 1 auto;
  box-sizing: border-box;
}

.import-template-card__remark {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  height: 20px;
  margin: 0;
  font-size: 13px;
  white-space: nowrap;
  color: #686b75;
  font-weight: 400;
  line-height: 20px;
  text-overflow: ellipsis;
}

.import-template-card__watermark {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 206px;
  height: 52px;
  pointer-events: none;
  user-select: none;
}
</style>
