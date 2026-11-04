<template>
  <div class="update-last">
    <div class="banner"></div>
    <img
      class="logo"
      src="https://ic-img.ky-express.com/netc/20221018_61763189566_!!1666092636656_120_120.png"
      alt=""
    />
    <div class="title">跨越速运客户端</div>
    <div class="tip">当前版本{{ clientVersion }}已是最新版本</div>
    <div class="button">
      <div class="button normal-button flex" @click="emit('close')">我知道了</div>
    </div>
    <div class="close-icon flex" @click="emit('close')">
      <el-icon class="el-dialog__close el-icon el-icon-close"><Close /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户端更新 - "已经是最新版本"弹框
 * 自 update.vue 拆分(模板/样式随迁, 渲染与行为不变)
 */
import { Close } from '@element-plus/icons-vue'

defineProps<{
  clientVersion: string
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
.update-last {
  width: 360px;
  height: 240px;
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  .banner {
    height: 72px;
    background: linear-gradient(180deg, #f3f2ff 2%, #ffffff);
    box-shadow: 0px 1px 0px 0px #ffffff inset;
  }
  .logo {
    display: block;
    width: 60px;
    margin: -40px auto 16px;
  }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: #03050d;
    margin-bottom: 4px;
    text-align: center;
    line-height: 20px;
  }
  .tip {
    font-size: 12px;
    color: #999999;
    margin-bottom: 26px;
    text-align: center;
  }
  .normal-button {
    width: 124px;
    height: 32px;
    background: #8365f6;
    border-radius: 4px;
    color: #ffffff;
    margin: 0 auto;
    cursor: pointer;
  }
  .close-icon {
    position: absolute;
    right: 0;
    top: 0;
    width: 36px;
    height: 36px;
    color: #666666;
    i {
      font-size: 20px;
      cursor: pointer;
    }
  }
}
</style>
