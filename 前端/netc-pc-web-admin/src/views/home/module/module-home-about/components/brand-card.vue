<template>
  <div
    class="brand-card"
    @click="handleClick"
    v-click-report="{
      eventCode: 'clk_homepage_about_kye_subblock_v1',
      region_code: 'home_page_about',
      subblock_name: props.item.title,
    }"
  >
    <img class="card-image" :src="props.item.videoCover" :alt="props.item.title" />
    <div class="card-info">
      <div class="card-title-row">
        <span class="card-title">{{ props.item.title }}</span>
        <span class="play-btn">
          <KIcon :size="12" color="#ffffff"><Play /></KIcon>
        </span>
      </div>
      <span v-if="props.item.subTitle" class="card-subtitle">{{ props.item.subTitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomePageVideo } from '@/apis/home/types'
import { KIcon } from '@netc-design-pc/ui'
import { Play } from '@netc-design-pc/icons'

const props = defineProps<{
  item: HomePageVideo
}>()

const emit = defineEmits<{
  (e: 'click', item: HomePageVideo): void
}>()

const handleClick = () => {
  emit('click', props.item)
}
</script>

<style lang="scss" scoped>
.brand-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  height: 116px;
  padding: 24px;
  overflow: hidden;
  background: linear-gradient(91.12deg, rgb(244 243 255) 39.319%, rgb(235 237 255) 57.16%, #fff 75%);
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  gap: 16px;

  &:hover {
    z-index: 1;
    transform: translateY(-8px);
    box-shadow: 0 8px 20px rgba(36, 38, 43, 0.16);
  }
}

.card-image {
  position: absolute;
  top: 50%;
  right: 0;
  display: block;
  // 设计稿固定尺寸 228x128，贴右侧垂直居中；超出卡片部分由 overflow: hidden 裁剪
  width: 228px;
  height: 128px;
  transform: translateY(-50%);
  object-fit: cover;
}

// 文案层：叠在封面图上层，垂直居中
.card-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.card-title {
  overflow: hidden;
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
  color: #24262b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 紫色圆形播放按钮
.play-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 50%;
}

.card-subtitle {
  margin-top: 6px;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
