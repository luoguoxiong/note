<template>
  <!--
    操作指引视频弹窗
    迁移自: netc-pc-web/src/components/ky-video-dialog/index.vue（内部依赖 ky-dialog）
    新基座无 ky-dialog 旧实现，此处用 el-dialog 复刻老 ky-dialog 最终渲染样式:
    弹窗垂直居中(radius 4 / 大投影 / max-height)、header 10px 16px 10px 20px + #f1f1f5 下边框、
    body padding 20px + margin 16px 20px 0
  -->
  <el-dialog
    v-model="visible"
    :title="title"
    append-to-body
    class="video"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="visible && videoUrl">
      <video :src="videoUrl" autoplay controls width="100%"></video>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ky-video-dialog' })

withDefaults(
  defineProps<{
    title?: string
    videoUrl?: string
  }>(),
  {
    title: '操作指引',
  }
)

const visible = ref(false)

const showDialog = () => {
  visible.value = true
}

const handleClose = () => {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture()
  }
  visible.value = false
}

defineExpose({ showDialog })
</script>

<style lang="scss">
/* 复刻老 ky-dialog(ky-dialog.scss + ky-dialog/index.vue scoped) 的最终渲染样式 */
.el-dialog.video {
  padding: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 !important;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 100px);
  max-width: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);

  .el-dialog__header {
    padding: 10px 16px 10px 20px;
    border-bottom: 1px solid #f1f1f5;

    .el-dialog__title {
      line-height: 1;
      font-size: 14px;
      font-weight: bold;
      color: #03050d;
    }
  }

  .el-dialog__headerbtn {
    top: 9px;
    right: 16px;
    width: auto;
    height: auto;

    .el-dialog__header-close {
      color: #999999;
      font-size: 16px;
    }
  }

  .el-dialog__body {
    padding: 20px;
    margin: 16px 20px 0;
    font-size: 12px;
    color: #03050d;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
