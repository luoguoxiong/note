<template>
  <div class="normal-update flex">
    <div class="progress">
      <div class="title">正在下载{{ versionNo }}安装包</div>
      <el-progress :percentage="percentage" :show-text="false"></el-progress>
      <div class="progress-intro" v-if="percentage">
        <div class="size">{{ currSize }}M/{{ totalSize }}M</div>
        <div>{{ percentage }}%</div>
      </div>
    </div>
    <div class="close flex">
      <el-icon class="el-dialog__close el-icon el-icon-close" @click="emit('close')"><Close /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户端更新 - 弱升下载中右下角悬浮进度条
 * 自 update.vue 拆分(模板/样式随迁, 渲染与行为不变)
 */
import { Close } from '@element-plus/icons-vue'

defineProps<{
  percentage: number
  currSize: string | number
  totalSize: string | number
  versionNo?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.normal-update {
  width: 266px;
  height: 70px;
  background: #ffffff;
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 2000;
  border-radius: 8px;
  padding: 0 20px;
  box-sizing: border-box;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  .progress {
    width: 100%;
  }
  .progress-intro {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999999;
    .size {
      font-feature-settings: 'tnum';
    }
  }
  .close {
    width: 16px;
    height: 70px;
    cursor: pointer;
    margin-left: 20px;
    padding-top: 3px;
    box-sizing: border-box;
    i {
      font-size: 16px;
      cursor: pointer;
    }
  }
  .title {
    font-size: 13px;
    font-weight: 500;
    color: #03050d;
    margin-bottom: 8px;
  }
}
</style>
