<template>
  <Teleport v-if="visible" to="#page-wrap">
    <div v-if="visible" class="fullscreen-iframe-mask" @click.self="handleClose">
      <div class="mask-header">
        <KButton class="mask-close" circle aria-label="关闭视频" @click="handleClose">
          <!-- 设计稿叉叉线稿约 17.82px：CloseGrey 的 X 路径约占 viewBox 的 57%，30px 图标 ≈ 17px 线稿 -->
          <KIcon :size="30"><CloseGrey /></KIcon>
        </KButton>
      </div>
      <div class="mask-body">
        <iframe v-if="visible" :src="src" frameborder="0" allowfullscreen class="video-iframe"></iframe>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onDeactivated } from 'vue'
import { KButton, KIcon } from '@netc-design-pc/ui'
import { CloseGrey } from '@netc-design-pc/icons'

defineProps<{
  visible: boolean
  src: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

onDeactivated(handleClose)
</script>

<style lang="scss" scoped>
// 挂到不随首页滚动的容器，仅覆盖页签下方的可视区域。
.fullscreen-iframe-mask {
  position: absolute;
  inset: 36px 0 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #03050d;
}

.mask-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  height: 48px;
  // 右侧 64px = 关闭按钮距遮罩右缘的距离（设计稿实测）
  padding: 0 64px 0 32px;
}

// 覆盖 KButton 内置样式：白色圆钮，整体（含图标）80% 不透明度（scoped 属性选择器提供足够 specificity）
// 注意：KButton 默认 type=primary，theme-chalk 将按钮文字色定为白色（--el-button-text-color），
// 图标 fill: currentColor 会变成白色画在白底上（叉叉消失），这里覆盖回设计稿的深色
.mask-close {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  top: 24px;
  background: var(---CG-Grey-C1, rgba(255, 255, 255, 1));
  opacity: 0.8;
  // 设计稿叉叉色（CG-Grey-09），图标 currentColor 随之变深
  color: #24262b;
}

.mask-body {
  display: flex;
  justify-content: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// 铺满遮罩可视区域；播放器页面内部若自带留白则由其自行控制
.video-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
