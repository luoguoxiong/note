<template>
  <KButton
    type="default"
    link
    native-type="button"
    class="industry-card"
    @click="handleClick"
    v-click-report="{
      eventCode: 'clk_homepage_industry_subblock_v1',
      region_code: 'industry_info',
      subblock_name: props.item.title,
    }"
  >
    <div class="card-head">
      <span class="card-title">{{ props.item.title }}</span>
      <span class="card-arrow">
        <img class="arrow-icon" :src="ARROW_RIGHT_IMG" alt="" />
      </span>
    </div>
    <p v-if="props.item.desc" class="card-desc">{{ props.item.desc }}</p>
    <img
      v-if="props.item.imageUrl"
      class="card-image"
      :src="props.item.imageUrl"
      :alt="`${props.item.title}行业解决方案`"
    />
  </KButton>
</template>

<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'

// 设计稿下发的右箭头图标（36x36 透明底，自带留白，随容器等比缩放）
const ARROW_RIGHT_IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAAXNSR0IB2cksfwAAADNQTFRFAAAAFBQ7FhU6AAAzAAAkFxU3EQBEGhozCgozFxU2FRU7FRU3FRU0GBU4FRU4GBU7GBU6/mqylgAAABF0Uk5TAA3PBAuGCAoZej1iMbdJqsNCjMlaAAAAu0lEQVR4nI2U2RLDIAhFBYyYNEv//2s7beoOkfukM2cuiIBzlYgCewDPgcjJIoZKLGHkoZMfsNAjX4WWGWz+ZgamoVSmosR8urzoiQGgWbAccGJ0W/EMYs1oXxorEToRXzUkvj8eiHu+BSWlDfGIJSmlACvims7eyQzEC/FMlwLhoHcKWMKNEG4pXE58GZSqwM8tcCvMv06teA+ZPtjWKqams7WvaRBsI2UbTtuY2xaGbfU40xL7Yco6/AAvxgaTWpScwAAAAABJRU5ErkJggg=='
interface IndustryItem {
  title: string
  desc: string
  imageUrl: string
  active: number
  menuId: number
  htmlContent?: string
}

const props = defineProps<{
  item: IndustryItem
}>()

const emit = defineEmits<{
  (e: 'click', item: IndustryItem): void
}>()

const handleClick = () => {
  emit('click', props.item)
}
</script>

<style lang="scss" scoped>
.industry-card {
  position: relative;
  display: block;
  margin: 0;
  width: 100%;
  min-width: 0;
  height: 116px;
  padding: 12px 16px 0 16px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(242, 241, 254, 1) 0%, rgba(248, 246, 254, 1) 100%);
  text-align: left;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    z-index: 1;
    transform: translateY(-8px);
    box-shadow: 0 8px 20px rgba(36, 38, 43, 0.16);

    .card-arrow {
      background: #f0ecfd;
    }
  }

  &:focus-visible {
    outline: 2px solid #7143f0;
    outline-offset: 2px;
  }
}

.industry-card :deep(> span) {
  display: block;
  width: 100%;
  height: 100%;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  gap: 8px;
}

.card-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
  color: #24262b;
}

.card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.arrow-icon {
  display: block;
  width: 100%;
  height: 100%;
}

.card-desc {
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 400;
  color: #686b75;
}

.card-image {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: block;
  // 设计稿固定尺寸 140x48，贴底部水平居中
  width: 140px;
  height: 48px;
  transform: translateX(-50%);
  object-fit: cover;
}
</style>
